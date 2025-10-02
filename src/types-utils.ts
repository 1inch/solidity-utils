import type {
    Abi,
    AbiFunction,
    AbiParameter,
    AbiParameterKind,
    AbiParametersToPrimitiveTypes,
    AbiParameterToPrimitiveType,
    AbiStateMutability,
    ExtractAbiFunction,
    ExtractAbiFunctionNames,
} from 'abitype';
import { BaseContract } from 'ethers';

export type ContractFunctionName<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = ExtractAbiFunctionNames<
    abi extends Abi ? abi : Abi,
    mutability
> extends infer functionName extends string
    ? [functionName] extends [never]
        ? string
        : functionName
    : string;

export type ContractFunctionArgs<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability,
    functionName extends ContractFunctionName<
        abi,
        mutability
    > = ContractFunctionName<abi, mutability>
> = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
        abi extends Abi ? abi : Abi,
        functionName,
        mutability
    >['inputs'],
    'inputs'
> extends infer args
    ? [args] extends [never]
        ? readonly unknown[]
        : args
    : readonly unknown[];

export type IsUnion<
    union,
    ///
    union2 = union
> = union extends union2 ? ([union2] extends [union] ? false : true) : never;

export type UnionToTuple<
    union,
    ///
    last = LastInUnion<union>
> = [union] extends [never]
    ? []
    : [...UnionToTuple<Exclude<union, last>>, last];
type LastInUnion<U> = UnionToIntersection<
    U extends unknown ? (x: U) => 0 : never
> extends (x: infer l) => 0
    ? l
    : never;
type UnionToIntersection<union> = (
    union extends unknown ? (arg: union) => 0 : never
) extends (arg: infer i) => 0
    ? i
    : never;

export type ExtractAbiFunctionForArgs<
    abi extends Abi,
    mutability extends AbiStateMutability,
    functionName extends ContractFunctionName<abi, mutability>,
    args extends ContractFunctionArgs<abi, mutability, functionName>
> = ExtractAbiFunction<
    abi,
    functionName,
    mutability
> extends infer abiFunction extends AbiFunction
    ? IsUnion<abiFunction> extends true // narrow overloads using `args` by converting to tuple and filtering out overloads that don't match
        ? UnionToTuple<abiFunction> extends infer abiFunctions extends readonly AbiFunction[]
            ? // convert back to union (removes `never` tuple entries)
              {
                  [k in keyof abiFunctions]: CheckArgs<abiFunctions[k], args>;
              }[number]
            : never
        : abiFunction
    : never;
type CheckArgs<
    abiFunction extends AbiFunction,
    args,
    ///
    targetArgs extends AbiParametersToPrimitiveTypes<
        abiFunction['inputs'],
        'inputs'
    > = AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>
> = (readonly [] extends args ? readonly [] : args) extends targetArgs // fallback to `readonly []` if `args` has no value (e.g. `args` property not provided)
    ? abiFunction
    : never;

export type ContractFunctionReturnType<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability,
    functionName extends ContractFunctionName<
        abi,
        mutability
    > = ContractFunctionName<abi, mutability>,
    args extends ContractFunctionArgs<
        abi,
        mutability,
        functionName
    > = ContractFunctionArgs<abi, mutability, functionName>
> = abi extends Abi
    ? Abi extends abi
        ? unknown
        : AbiParametersToPrimitiveTypes2<
              ExtractAbiFunctionForArgs<
                  abi,
                  mutability,
                  functionName,
                  args
              >['outputs']
          > extends infer types
        ? types extends readonly []
            ? void
            : types extends readonly [infer type]
            ? type
            : types
        : never
    : unknown;

export type AbiParametersToPrimitiveTypes2<
    abiParameters extends readonly AbiParameter[],
    abiParameterKind extends AbiParameterKind = AbiParameterKind
> = abiParameters[number]['name'] extends string
    ? {
          [k in abiParameters[number]['name']]: AbiParameterToPrimitiveType<
              abiParameters[number],
              abiParameterKind
          >;
      }
    : {
          [key in keyof abiParameters]: AbiParameterToPrimitiveType<
              abiParameters[key],
              abiParameterKind
          >;
      };


export type StrictBaseContract<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability
> = BaseContract & {
    [k in ContractFunctionName<abi>]: (
        // eslint-disable-next-line no-empty-pattern
        ...[]: ContractFunctionArgs<abi, mutability, k>
    ) => Promise<ContractFunctionReturnType<abi, mutability, k>>;
};
