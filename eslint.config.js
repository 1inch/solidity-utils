import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
    {
        ignores: [
            'dist/**',
            'artifacts/**',
            'cache/**',
            'coverage/**',
            'typechain-types/**',
            'types/**',
            'generated/**',
            'node_modules/**',
            'docgen/templates/**',
        ],
    },
    js.configs.recommended,
    ...tsPlugin.configs['flat/recommended'],
    {
        files: ['**/*.{ts,js,mjs,cjs}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
        rules: {
            'no-debugger': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            indent: ['error', 4],
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'always'],
            'space-before-function-paren': [
                'error',
                { anonymous: 'always', named: 'never', asyncArrow: 'always' },
            ],
            'one-var-declaration-per-line': ['error', 'always'],
            'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
            eqeqeq: ['error', 'smart'],
            'dot-notation': ['error', { allowKeywords: true, allowPattern: '' }],
            'no-trailing-spaces': ['error', { skipBlankLines: true }],
            'eol-last': 'warn',
            'comma-spacing': ['error', { before: false, after: true }],
            camelcase: ['error', { properties: 'always' }],
            'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
            'comma-dangle': ['warn', 'always-multiline'],
            'object-curly-spacing': ['error', 'always'],
            'max-len': ['error', 200, 2],
            'generator-star-spacing': ['error', 'before'],
        },
    },
];
