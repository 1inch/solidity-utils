# Setting Up Documentation Generation with Docgen

To generate documentation using **solidity-docgen**, follow these steps:

1. **Add Docgen as a dependency:**
    Add `solidity-docgen` as a dependency in your `package.json`:
    ```
    "solidity-docgen": "0.6.0-beta.36"
    ```

2. **Import Docgen in Hardhat Configuration**
    In your `hardhat.config.js` (or `.ts`), import `solidity-docgen`:
    ```
    import 'solidity-docgen'; // ES6 style
    // OR
    require('solidity-docgen'); // CommonJS style
    ```

3. **Configure Docgen in Hardhat**
    Add the following configuration under `module.exports` to set up output directories, templates, and other options:
   ```
    const { oneInchTemplates } = require('@1inch/solidity-utils/docgen');

    module.exports = {
        // other configuration
        // ...
        docgen: {
            outputDir: 'docs/contracts',    // Directory where docs will be generated
            templates: oneInchTemplates(),  // Custom templates for doc generation
            pages: 'files',                 // Output documentation as separate files
            exclude: ['tests'],             // Exclude certain files or directories
        },
    };
    ```

4. **Generate Documentation**
    Run the following command to generate the documentation:
    ```
    yarn hardhat docgen
    ```
    or
    ```
    npx hardhat docgen
    ```

After running this command, the generated documentation will appear in the specified `outputDir` directory.
