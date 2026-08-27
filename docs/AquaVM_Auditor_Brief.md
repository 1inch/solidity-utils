# AquaVM v2 — Auditor Brief: Design Assumptions, Known Limitations & Operational Context

> **Purpose:** This document captures design decisions, intentional trade-offs, and known constraints of the Aqua + SwapVM architecture that were surfaced during the v1 audit round (8 firms). Many findings in v1 were correctly identified edge cases but were **acknowledged** or **won't-fixed** because they reflect deliberate design choices, not bugs. This brief exists so auditors can focus on *real* vulnerabilities rather than re-discovering these known properties.
>
> **Scope:** This document is **strictly additive** to the existing project documentation. It does **not** repeat content from:
> - `aqua-dev-preview.pdf` — Aqua shared liquidity layer whitepaper
> - `swap-vm-1.0.pdf` — SwapVM bytecode virtual machine whitepaper (includes full curve mathematics in appendices)
> - `aqua-README.md` — Aqua usage, lifecycle, API reference
> - `swapvm-README.md` — Instruction set, core invariants, maker/taker guidance
> - `swapvm-PROGRAMS.md` — Program catalog with canonical compositions per strategy type
>
> **Read those first.** Everything below is audit-derived context that is *not* covered in the above.

---

## Responsibility Matrix

Quick reference for who enforces what. Many findings reported against the VM are actually maker, program-builder, taker, or integrator responsibilities — this table is the first filter to apply before flagging an issue.

| Concern | Enforced on-chain by the VM? | Delegated to | Reference |
|---|---|---|---|
| Token pair binding (`tokenIn` / `tokenOut`) | No — order hash does not include token addresses | Maker (must include a Balances instruction that lists the allowed tokens) | §4.1 |
| Swap direction enforcement | No — 1D instructions (`OraclePriceAdjuster`, `BaseFeeAdjuster`, `DutchAuction`, `TWAPSwap`) do not validate direction at runtime | Maker (must include a direction-gating instruction such as `LimitSwap`) | §4.1 |
| Opcode set targeting (`Opcodes` vs `AquaOpcodes` vs `LimitOpcodes`) | No — no runtime check that a program targets the same opcode set as the executing router | Program author (must target the correct opcode set for the intended router) | §2.2 |
| Program composition validity (instruction order, semantic compatibility) | No — no semantic validation of instruction sequences | Maker / program builder (off-chain) and taker (must validate before filling) | §1.2 |
| Threshold configuration (slippage / max-extraction bound) | Yes — enforced after `runLoop()` as the final settlement check | Taker / integrating frontend (must set conservatively; threshold is the last line of defense) | §4.2 |
| Program validation before fill (extruction targets, infinite loops, always-revert configs, maximum-slippage extraction) | No | Taker (must inspect every program before filling) | §4.2, §4.3 |
| Router / authorization-mode pairing (Aqua-mode orders ↔ `AquaSwapVMRouter`; signature-mode orders ↔ `SwapVMRouter`) | Partial — each router exposes only its appropriate instruction set, but cross-routing bypasses caps | Integrator (must route each order through the matching router) | §1.3 |
| Maker liquidity self-declarations (Aqua mode) | No — makers self-report available liquidity | Aggregators / resolvers (off-chain liquidity verification before routing volume) | §3.9 |

---

## 1. Protocol Design Principles & Assumptions

### 1.1 Orders Are Reusable Unless Explicitly Invalidated

Aqua orders are reusable by default. Signature-mode orders can be replayed without invalidators. This is intentional — invalidation is opt-in through dedicated invalidator instructions. Makers who want single-use orders must include invalidator opcodes in their programs.

### 1.2 No Broad On-Chain Guardrails for Instruction Composition (Rationale)

SwapVM deliberately does **not** add on-chain validation that an instruction sequence is semantically valid. The rationale:

- Guardrails would increase gas costs for *all* valid orders to protect against a small set of misconfigured ones.
- Builder contracts cover the common safe combinations off-chain.
- Canonical orderings are documented (see whitepaper §5.5 and `swapvm-PROGRAMS.md`).

**Implication for auditors:** A finding of the form "instruction X can be placed in position Y and produce wrong results" is generally acknowledged — invalid compositions are the maker's (or program builder's) responsibility, not the VM's. Takers must validate programs before filling them.

### 1.3 Router / Authorization-Mode Mismatch Bypasses Are a Configuration Boundary

- Aqua-mode orders (`useAquaInsteadOfSignature = true`) must use `AquaSwapVMRouter`.
- Signature-mode orders must use `SwapVMRouter`.

Running Aqua-mode orders through the general `SwapVMRouter` can bypass Aqua balance caps. Running signature-mode orders through `AquaSwapVMRouter` can ignore shipped caps. **This is a configuration boundary, not a protocol bug** — each router exposes the instruction set and settlement path appropriate for its mode.

---

## 2. Libraries & Instruction Design Principles

### 2.1 Rounding Invariant: Split-Proofness

The rounding direction rules are specified per-instruction in the SwapVM whitepaper. The audit-relevant consequence not stated there:

Splitting a swap into N smaller parts accumulates approximately N units of rounding loss *for the taker*, not the maker. **Swap-splitting cannot extract value from the maker via rounding.** Findings that claim "N small swaps yield better output than 1 large swap" should be rejected unless they demonstrate a specific rounding-direction violation in an instruction.

### 2.2 Opcode Sets Are Not Interchangeable

Three opcode sets exist: `Opcodes`, `AquaOpcodes`, and `LimitOpcodes`. They share Control instructions at indices 11–17 but diverge afterward (e.g., index 18 maps to different instructions in each set).

**A program designed for one opcode set will silently execute wrong instructions on another.** This is not validated at runtime — it is the program author's responsibility to target the correct opcode set for their router.

---

## 3. Protocol Limitations (Known & Accepted)

### 3.1 Fee-on-Transfer Tokens Are NOT Supported

SwapVM uses `safeTransferFrom()` and assumes the transferred amount equals the received amount. Fee-on-transfer tokens cause accounting mismatches: the protocol records nominal amounts, not actual received amounts. This affects both SwapVM direct transfers and Aqua's `push()`/`pull()` accounting.

**Documented, accepted limitation.**

### 3.2 Rebasing Tokens Are NOT Supported

Aqua treats balances as immutable after `ship()` and relies on internal records rather than querying `balanceOf()`. Rebasing tokens (positive or negative) cause virtual-to-actual balance divergence:
- Positive rebase: excess tokens become inaccessible within Aqua accounting.
- Negative rebase: `pull()` reverts when actual balance drops below virtual.

**Documented, accepted limitation for v1.**

### 3.3 `feeBps == BPS` (100% Fee) Causes Division-by-Zero in ExactOut

The exactOut fee formula divides by `BPS - feeBps`. When `feeBps == BPS`, the denominator is zero and the transaction reverts. ExactIn with 100% fee works fine (gives 0 output). The builder allows `feeBps <= BPS`, so this configuration can pass creation.

**Not fixed intentionally:** Adding a runtime check would increase gas costs for all orders to prevent an obviously erroneous configuration. Takers must validate strategies before use.

### 3.4 `quote()` Is Not a Faithful Simulation of `swap()` in All Cases

> **Note:** `quote()` is not a faithful simulation of `swap()` for several instruction categories. This is a documented protocol property, not an edge case. See §4.2 for taker responsibilities.

Several instructions produce divergent behavior between `quote()` and `swap()`:
- **Decay:** offsets are read but not written in quote mode (documented in whitepaper Appendix A.4).
- **Dynamic balances:** storage is not updated in quote mode.
- **Protocol fees:** token transfer is skipped in quote mode, so quote may succeed where swap reverts (e.g., maker has insufficient tokenIn balance for fee transfer).
- **Extruction:** external contract receives `isStaticContext` and can return different values.

**This is accepted.** Quote is indicative, not a guarantee. Takers simulate via `quote()` for gas estimation but must account for state changes between quote and swap.

### 3.5 Backward Jumps Can Create Infinite Loops

The `_jump()` instruction does not enforce `nextPC >= currentPC`. A maker can embed backward jumps that cause `runLoop()` to loop until gas exhaustion. This is an order-level failure, not a protocol-wide DoS. Takers mitigate by simulating via `quote()` before executing. No funds are at risk — the transaction simply reverts.

### 3.6 `Calldata.slice()` Does Not Enforce `begin <= end`

The `slice()` function validates that `end` does not exceed `calls.length` but does not verify `begin <= end`. When `begin > end`, the computed length underflows. This causes order-level OOG reverts for malformed orders. Not fixed because gas optimization is prioritized and takers should validate order structure.

### 3.7 `ship()` and `dock()` Accept Empty Token Arrays

Calling `ship()` or `dock()` with zero-length token arrays emits events without meaningful state changes. This can confuse indexers and subgraphs but is not a security issue. Indexers, integrators, and applications should validate event parameters.

### 3.8 Decay Offset Accumulation via Dust Swaps

Each new swap resets the decay timer while adding to the offset. Theoretically, repeated small swaps can extend the effective decay tail and accumulate offsets that block reverse-direction swaps. In practice, gas costs make this attack unprofitable on mainnet, and offset magnitude decreases with each refresh. On cheap L2s, this remains a theoretical griefing vector.

### 3.9 No On-Chain Verification of Maker's Declared Liquidity (Aqua)

In Aqua mode, a maker self-reports available liquidity in the program with no on-chain enforcement. A maker with minimal funds can advertise arbitrarily large liquidity. Aggregators and resolvers should implement off-chain liquidity verification before routing volume.

---

## 4. Maker & Taker Limitations and Operational Principles

### 4.1 Maker Responsibilities

#### Token Pair Binding Is the Maker's Responsibility

The order hash does **not** include `tokenIn` or `tokenOut`. The maker's signature does not bind a specific token pair. Token validation happens at the instruction level — Balances instructions (`_staticBalancesXD`/`_dynamicBalancesXD`) enforce that both `tokenIn` and `tokenOut` are in the configured token list. Programs without balance instructions have no token validation.

**Makers must always include a Balances instruction (or equivalent token-binding mechanism) in their programs.** Programs without token-pair binding expose the maker to arbitrary token substitution.

#### Direction Enforcement Is the Maker's Responsibility

1D instructions (OraclePriceAdjuster, BaseFeeAdjuster, DutchAuction, TWAPSwap) are documented as single-direction only but do **not** validate token direction at runtime. Makers must include a direction-gating instruction (like `LimitSwap`) to enforce the intended swap direction.

#### `shouldUnwrapWeth` Does Not Verify the Token Is WETH

The unwrap flag triggers `IWETH(token).safeWithdrawTo()` without checking that the token matches the canonical WETH address. If set for a non-WETH token, the call reverts. This is self-harming only (the flag is controlled by the party setting it). In Aqua mode, `shouldUnwrapWeth` is correctly prohibited.

#### Dynamic Balances + Custom Receiver Creates Accounting Drift

When dynamic balances are combined with a custom fee receiver (`order.traits.receiver != maker`), the accounting invariant is maintained in the ledger but the maker's wallet doesn't hold sufficient funds. In Aqua mode, this is explicitly prohibited (`MakerTraitsCustomReceiverIsIncompatibleWithAqua`), but in signature mode it is not enforced.

#### `ship()` Can Be Called Multiple Times for the Same Strategy

`ship()` can be called with the same `strategyHash` but different token arrays, adding tokens to an existing strategy. This creates multiple sets of tokens; `dock()` only clears one set at a time (matching `tokensCount`). Makers must be aware of this when managing strategies.

### 4.2 Taker Responsibilities

#### Specific Attack Surfaces a Taker Must Validate Against

Before filling any program, a taker must inspect it for the following — none of which are prevented at the protocol level:
- **Extruction target divergence:** the target may return different values in `quote()` vs `swap()` (it receives `isStaticContext`).
- **Infinite loops:** backward `_jump` can trap execution until gas exhaustion.
- **Maximum-slippage extraction:** hooks and extruction can push the taker to their threshold.
- **Always-revert configurations:** e.g., `feeBps == BPS` in exactOut.

#### Threshold Misconfiguration

The taker-side threshold is the *last* line of defense. If set to zero or otherwise overly permissive, a maker's program can extract up to that threshold. Integrating frontends must treat threshold configuration as a primary security parameter.

#### `isFirstTransferFromTaker` Affects Hook Execution Order

The taker can specify whether they provide input first or receive output first. This changes when hooks/callbacks execute relative to actual transfers. Hooks designed with assumptions about transfer ordering may behave unexpectedly when `isFirstTransferFromTaker` changes.

#### Pre-Push Mode with Aqua Fees Requires Extra Funding

When using Aqua mode with pre-push (`useTransferFromAndAquaPush = false`) and Aqua fee opcodes, takers must pre-push `amountIn + fee`, not just `amountIn`. The fee is pulled during `runLoop()` but `_transferIn()` still validates against `amountIn`.

### 4.3 Extruction: The Most Powerful and Least Auditable Instruction

`_extruction()` delegates execution to an arbitrary external contract specified by the maker. Key properties:
- The external contract receives `isStaticContext` and can distinguish `quote()` from `swap()`.
- A malicious maker can return attractive prices during quoting while delivering worse rates during execution.
- The external contract can modify `ctx.swap` (including `amountNetPulled` and `nextPC`), allowing arbitrary modification of swap amounts and control flow.
- The target address is read from maker-signed program data with no validation (no allowlist, no code-hash check).
- Taker's only protection is the threshold setting.

**Extruction is documented as a "use with care" feature.** It cannot be made fully secure at the protocol level. Takers must validate any strategy that includes extruction before filling it. See also `swapvm-PROGRAMS.md` §4 on conditional-flow programs.

---

## 5. Additional Context & Edge Cases

### 5.1 `EIP-1271` Smart Contract Makers

When a smart contract is used as a maker with signature mode, the `isValidSignature` function determines authorization. If improperly implemented, other contracts sharing the same owner may be usable as makers. Tokens must be explicitly approved to the router by each contract.

### 5.2 Decay + Static Balances = Intentionally Excluded Combination

Combining `_decayXD` with `_staticBalancesXD` is considered incorrect usage. Offsets grow across executions while underlying balances reset each time, eventually causing underflow reverts on reverse swaps. Decay is intentionally excluded from `LimitOpcodes` for this reason. Only use decay with dynamic balances or Aqua balances.

### 5.3 `onlyTakerTokenBalance*` Gates Are Bypassable

Token balance gates (`_onlyTakerTokenBalanceNonZero`, `_onlyTakerTokenBalanceGte`) can be bypassed via flash loans. Supply share gates (`_onlyTakerTokenSupplyShareGte`) can be bypassed via flash-minting tokens like DAI or ERC-4626 vault tokens. These gates are deterrents, not guarantees.

### 5.4 ERC-1155 Is Not Natively Supported by Balance Gates

The `_onlyTakerTokenBalanceNonZero` instruction natively supports ERC-721 (via standard `balanceOf(address)`), but ERC-1155 uses `balanceOf(address, uint256)` and is **not** supported.

### 5.5 Stack Depth Limits for Complex Strategies

Each `runLoop()` invocation pushes onto the EVM stack. Deeply nested wrapping instructions (fee wrapping concentration wrapping another fee) can overflow the 1024 EVM stack limit. Makers of complex strategies should analyze worst-case stack consumption.

### 5.6 Double-Entry Tokens Can Bypass `tokenIn != tokenOut`

Certain tokens (e.g., TUSD) share two addresses representing the same underlying token. The `tokenIn != tokenOut` validation compares addresses and can be bypassed by double-entry tokens.

### 5.7 Protocol Fee Transfer Depends on Maker Balance at Execution Time

Protocol fee instructions (`_protocolFeeAmountInXD`) execute `safeTransferFrom(maker, recipient, feeAmount)` during `runLoop()` — **before** the taker's tokenIn transfer reaches the maker. If the maker doesn't hold sufficient tokenIn balance before the swap, the fee transfer reverts and the entire swap fails. This is by design: the protocol fee is pulled from the maker during program execution.

### 5.8 `Simulator.simulate()` Only Works via Self-Delegatecall

The simulator reads storage slots meaningful only when called via delegatecall from the inheriting contract (e.g., `AquaSwapVMRouter`). If called from a different contract, storage layout differs and results will be incorrect.

---

## 6. Information Useful for AI Agent Pre-Audit

When using AI agents to perform a pre-audit or assist human auditors, provide the following context to avoid false positives:

### 6.1 Required Reading

Two reading orders apply, depending on the consumer.

**For AI scanners doing triage (load this document FIRST as the filter):**
1. **This document** — load first; the Responsibility Matrix (top), §6.2 (topic-indexed accepted behaviors), and §6.3 (symbol-indexed known behaviors) are the primary triage filters.
2. `aqua-README.md` and `swapvm-README.md` — usage, API, instruction set, core invariants; supplies the symbols and surfaces this Brief annotates.
3. `swapvm-PROGRAMS.md` — canonical program compositions per strategy type with invariant-focus checklists.
4. `swap-vm-1.0.md` — SwapVM whitepaper (main body + Appendix A curve mathematics + Appendix B fee mathematics); load on demand when a finding cites curve math, fee math, rounding direction, or quote/swap divergence. Markdown replacement for `swap-vm-1.0.pdf`.
5. `aqua-dev-preview.md` — Aqua protocol whitepaper (virtual balance hierarchy, pull/push semantics, custody model, allowance-based access, atomic settlement, illiquidity behavior, SLAC formula, glossary); load on demand for Aqua-mode flows. Markdown replacement for `aqua-dev-preview.pdf`.

**For human auditors building protocol understanding from scratch:**
1. `aqua-dev-preview.md` — Aqua protocol whitepaper
2. `swap-vm-1.0.md` — SwapVM whitepaper (includes curve and fee mathematics in appendices)
3. `aqua-README.md` and `swapvm-README.md` — usage, API, instruction set, core invariants
4. `swapvm-PROGRAMS.md` — canonical program compositions per strategy type with invariant-focus checklists
5. **This document** — audit-derived design assumptions, known limitations, and operational context layered on top of the above

### 6.2 Key Properties AI Agents Should NOT Flag as Bugs

| Finding Class | Status | Reason |
|---|---|---|
| `quote()` succeeds where `swap()` reverts | Accepted | Known quote/swap divergence; quote is indicative, not a guarantee. See §3.4. |
| Orders are replayable without an invalidator | By design | Invalidation is opt-in; makers who want single-use orders must include an invalidator instruction. See §1.1. |
| Token pair not bound in the order hash | By design | Token binding is enforced at the instruction level via Balances instructions, not in the signed hash. See §4.1. |
| Swap direction not enforced on 1D instructions | By design | Makers must include a direction-gating instruction (e.g., `LimitSwap`). See §4.1. |
| Backward `_jump` causing OOG / infinite loop | Accepted | Order-level revert; no fund risk; mitigated by `quote()` simulation. See §3.5. |
| `feeBps == BPS` causing exactOut revert | Accepted | Configuration error; runtime check would add gas to all orders. See §3.3. |
| `Calldata.slice()` not checking `begin <= end` | Accepted | Order-level OOG only; gas optimization prioritized. See §3.6. |
| Empty arrays in `ship()`/`dock()` emitting events | Cosmetic | Not a security issue; indexers and integrators should validate event parameters. See §3.7. |
| Decay offsets accumulating via small swaps | Accepted | Gas costs make attack unprofitable on mainnet; offsets decay across refreshes. See §3.8. |
| Maker self-reports liquidity without on-chain check (Aqua) | By design | Aggregators and resolvers must verify liquidity off-chain. See §3.9. |
| Fee-on-transfer or rebasing token incompatibility | Accepted | Explicitly unsupported tokens. See §3.1, §3.2. |
| Extruction returning different values in `quote()` vs `swap()` | By design | External contract receives `isStaticContext` and may diverge. See §3.4, §4.3. |
| Rounding consistently favors maker | By design | Split-proofness invariant; rounding loss accrues to taker, not maker. See §2.1 and whitepaper appendices. |
| Program designed for one opcode set executing wrong instructions on another router | By design | Opcode sets diverge after index 17; program authors must target the correct router. See §2.2. |
| Router / authorization-mode mismatch bypassing caps | By design | Configuration boundary; each router exposes the instruction set appropriate for its mode. See §1.3. |
| Instruction-ordering dependent outcomes | Out-of-scope | Composition safety is the maker / program builder's responsibility; takers must validate before filling. See §1.2. |
| Quote-vs-swap divergence for Decay, Dynamic balances, Protocol fees, Extruction | By design | Listed in §3.4; quote is not a faithful simulation of swap for these instruction categories. |

### 6.3 Symbol-Indexed Known Behaviors

This table is keyed by Solidity identifier (function, instruction, flag, or struct field) as it appears in source. Use it as the first lookup when a finding cites a specific symbol — most findings against these symbols are accepted design properties.

| Symbol / Identifier | Accepted Behavior | Status | Blast Radius | Reference |
|---|---|---|---|---|
| `_jump` | Does not enforce `nextPC >= currentPC`; backward jumps allowed | By design | Order-level OOG; no fund risk | §3.5 |
| `_extruction` | Delegates to maker-specified contract; receives `isStaticContext`; may return different values in `quote()` vs `swap()`; can modify `ctx.swap` (including `amountNetPulled`, `nextPC`); no allowlist or code-hash check | By design | Bounded by taker threshold | §3.4, §4.3 |
| `Calldata.slice` | Validates `end <= calls.length` but not `begin <= end`; underflow when `begin > end` | Accepted | Order-level OOG; no fund risk | §3.6 |
| `ship` / `dock` (empty token arrays) | Accepts zero-length arrays; emits events without state changes | Accepted | Cosmetic; indexer concern only | §3.7 |
| `ship` (multi-call, same `strategyHash`) | Allowed with different token arrays; `dock` clears one set per `tokensCount` | By design | Maker awareness required | §4.1 |
| `rawBalances` vs `safeBalances` | `rawBalances` does not validate token membership in active strategy; `safeBalances` does (and reverts if not) | By design | Caller must pick the appropriate query | aqua-README API ref |
| `safeTransferFrom` (in SwapVM, Aqua `push`/`pull`) | Assumes transferred == received; no balance-delta check | Accepted | Fee-on-transfer / rebasing tokens explicitly unsupported | §3.1, §3.2 |
| `_protocolFeeAmountInXD` | `safeTransferFrom(maker, recipient, feeAmount)` runs during `runLoop()` — **before** taker's tokenIn reaches maker; reverts if maker underfunded at execution time | By design | Order-level revert | §5.7 |
| `_staticBalancesXD` | Stateless balance loading; paired invalidators (`_invalidateBit1D`, `_invalidateTokenIn1D`, `_invalidateTokenOut1D`) are what writes storage | By design | N/A | §4.1, swapvm-README |
| `_dynamicBalancesXD` | Persists state across swaps; storage **not** updated during `quote()` | By design | Quote/swap divergence | §3.4 |
| `_dynamicBalancesXD` + `order.traits.receiver != maker` (signature mode) | Accounting invariant maintained in ledger; maker wallet does not actually hold funds | Accepted (Aqua mode blocks it) | Maker self-error | §4.1 |
| `shouldUnwrapWeth` | Calls `IWETH(token).safeWithdrawTo()` without checking `token == canonical WETH`; reverts on non-WETH | Accepted | Self-harm only (party setting the flag) | §4.1 |
| `shouldUnwrapWeth` + Aqua mode | Explicitly prohibited at runtime | Enforced | N/A | §4.1 |
| `feeBps == BPS` (exactOut) | `BPS - feeBps == 0` → division by zero → revert; builder allows the configuration | Accepted | Order-level revert; configuration error | §3.3 |
| `_decayXD` | Offsets read but not written in `quote()` mode; intentionally excluded from `LimitOpcodes` | By design | Quote/swap divergence + composition restriction | §3.4, §5.2 |
| `_decayXD` + `_staticBalancesXD` | Incorrect composition; offsets grow while balances reset → underflow on reverse swaps | By design | Maker self-error | §5.2 |
| `_onlyTakerTokenBalanceNonZero` / `_onlyTakerTokenBalanceGte` | Bypassable via flash loans | Accepted | Deterrent only, not a guarantee | §5.3 |
| `_onlyTakerTokenSupplyShareGte` | Bypassable via flash-minting (e.g., DAI, ERC-4626 vault tokens) | Accepted | Deterrent only, not a guarantee | §5.3 |
| `_onlyTakerTokenBalanceNonZero` (ERC-1155) | Not supported; ERC-1155 uses `balanceOf(address, uint256)` | Accepted | Documented limitation | §5.4 |
| `tokenIn != tokenOut` | Address comparison; bypassable by double-entry tokens (e.g., TUSD) | Accepted | Documented limitation | §5.6 |
| `Simulator.simulate` | Only valid when invoked via self-delegatecall from inheriting contract; wrong results otherwise | By design | Caller responsibility | §5.8 |
| `isFirstTransferFromTaker` | Changes hook/callback execution order relative to transfers | By design | Hook author awareness | §4.2 |
| `useAquaInsteadOfSignature` + `SwapVMRouter` mismatch | Can bypass Aqua balance caps; reverse mismatch can bypass shipped caps | By design (configuration boundary) | Integrator routing error | §1.3 |
| `useTransferFromAndAquaPush = false` + Aqua fee opcodes | Taker must pre-push `amountIn + fee`, not just `amountIn` | By design | Taker self-error | §4.2 |
| 1D pricing instructions (`_oraclePriceAdjuster1D`, `_baseFeeAdjuster1D`, `_dutchAuctionBalanceIn1D`, `_dutchAuctionBalanceOut1D`, `_twap`) | No runtime direction validation; documented single-direction only | By design | Maker must include direction-gating instruction | §4.1 |
| Order hash | Does **not** bind `tokenIn` / `tokenOut`; signature does not commit to a token pair | By design | Maker must include a Balances instruction | §4.1, swapvm-README |
| EIP-1271 maker (smart contract) | If `isValidSignature` is improperly implemented, contracts sharing the same owner may be reusable as makers | Accepted | Smart-contract maker responsibility | §5.1 |
| `runLoop` (nested) | Each invocation pushes onto EVM stack; deep wrapping can hit the 1024 stack limit | Accepted | Order-level revert | §5.5 |
| `Opcodes` vs `AquaOpcodes` vs `LimitOpcodes` | Share Control instructions at indices 11–17; diverge after; no runtime check that program targets the correct set | By design | Program author responsibility | §2.2 |

**Status legend:**
- *By design* — deliberate protocol property; should not be reported as a bug.
- *Accepted* — known limitation acknowledged across prior audits; trade-off documented.
- *Enforced* — runtime check exists; finding only valid if the check is shown bypassable.

**Blast Radius legend:**
- *No fund risk* / *Order-level* — failure mode reverts a single order; counterparty and protocol untouched.
- *Self-harm only* — the party setting the configuration is the only one harmed.
- *Bounded by taker threshold* — worst case capped by the taker's threshold setting (which is the last line of defense).
- *Cosmetic* — affects indexers / off-chain consumers, not on-chain state security.

### 6.4 Cross-Cutting Audit Focus Areas

Beyond the per-instruction invariants already listed in the SwapVM whitepaper §4 and per-category checklists in `swapvm-PROGRAMS.md`, AI agents should prioritize:

- **Register manipulation correctness** — Any instruction that modifies `amountIn`, `amountOut`, `balanceIn`, `balanceOut`, or `amountNetPulled`.
- **Settlement path correctness** — Transfer ordering, Aqua push/pull accounting, hook interactions, and the maker/taker transfer order implied by `isFirstTransferFromTaker`.
- **Arithmetic precision** — Integer overflow/underflow, rounding direction, catastrophic cancellation in mathematical solvers (especially new curves).
- **Cross-instruction state leaks** — One instruction's storage writes affecting another instruction's behavior across orders or strategies.
- **New external integrations** — Any new external dependencies (oracles, fee providers, hook targets, extruction targets); all must be treated as untrusted.
- **Mode-boundary checks** — Any logic that differs between Aqua mode and signature mode, between `quote()` and `swap()`, or between `isExactIn = true` and `false`.

### 6.5 Threat Model Summary

| Actor | Trust Level | Capabilities |
|-------|-------------|-------------|
| Maker | Semi-trusted (controls program) | Can construct arbitrary programs, choose extruction targets, set hooks |
| Taker | Untrusted | Chooses tokenIn/tokenOut, amounts, transfer ordering, hook data |
| External contracts (hooks, extruction, fee providers, oracles) | Untrusted | Can return arbitrary data, consume gas, revert |
| Tokens | Untrusted (standard ERC-20 only) | Fee-on-transfer and rebasing explicitly unsupported |

---

*This document was compiled from acknowledged/declined findings across 8 independent security audits of AquaVM v1 (Bailsec, Decurity, Hashlock, Hexens, MixBytes, Nethermind, OpenZeppelin, Theori/ChainLight). Last updated: April 2026.*
