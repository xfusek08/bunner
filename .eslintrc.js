// https://docs.expo.dev/guides/using-eslint/
module.exports = {
    extends: 'expo',
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname
    },
    plugins: [
        "unused-imports",
        "import-newlines",
    ],
    settings: {
        "import/resolver": {
            node: {
                extensions: [
                    ".ts",
                    ".tsx"
                ]
            }
        }
    },
    ignorePatterns: ["*.js"],
    rules: {
        // allow eslint to remove unused imports
        "unused-imports/no-unused-imports": "warn",

        // indentation
        "indent": "off",
        "react/jsx-indent": "off",
        "react/jsx-indent-props": ["warn", 4],
        "@typescript-eslint/indent": ["warn", 4],

        // new lines
        "react/jsx-one-expression-per-line": "off",

        // allow trailing spaces for blank lines to align cursor with current indentation
        "no-trailing-spaces": ["warn", { "skipBlankLines": true }],

        // string quotes
        "quotes": "off",
        "@typescript-eslint/quotes": ["warn"],

        // allow 1 empty on beginning of file
        "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1, "maxBOF": 1 }],

        // allow unused vars if it has prefix "_"
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],

        // allow prop spreading {...props} in jsx components
        "react/jsx-props-no-spreading": "off",

        // enforce unified spacing around type colon: `const var: type = 'value';`
        "@typescript-eslint/type-annotation-spacing": [
            "warn",
            {
                "before": false,
                "after": true,
                "overrides": {
                    "arrow": {
                        "before": true,
                        "after": true
                    }
                }
            }
        ],
        "max-len": "off",

        // Fix return type checking for functions including returning from exhaustive switch statements
        "consistent-return": "off",
        "@typescript-eslint/no-unsafe-return": "error",
        // "@typescript-eslint/explicit-function-return-type.": ["error", {
        //     "allowExpressions": true,
        //     "allowTypedFunctionExpressions": true
        // }],

        "react/require-default-props": "off",

        "@typescript-eslint/lines-between-class-members": "off",

        "no-else-return": ["error", { "allowElseIf": true }],

        "@typescript-eslint/member-delimiter-style": ["error", {
            "multiline": {
                "delimiter": "comma",
                "requireLast": true
            },
            "singleline": {
                "delimiter": "comma",
                "requireLast": false
            },
            "multilineDetection": "brackets"
        }],

        "default-case": "off",

        "@typescript-eslint/switch-exhaustiveness-check": "error",

        "linebreak-style": 0,

        // https://github.com/typescript-eslint/typescript-eslint/issues/4619
        "@typescript-eslint/no-misused-promises": ["error", {
            "checksVoidReturn": {
                "attributes": false
            }
        }],

        // "key-spacing": ["error", { "align": "value" }],

        // outdated since 2014: https://stackoverflow.com/a/72072751
        "no-restricted-syntax": "off",

        // this is some kind of mistake?
        'jsx-a11y/control-has-associated-label': 'off',
        "jsx-a11y/no-interactive-element-to-noninteractive-role": "off",

        // https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",

        // Importy vždy na samostatný řádek
        // https://www.npmjs.com/package/eslint-plugin-import-newlines
        "import-newlines/enforce": [
            "error",
            {
                "items": 3,
                "max-len": 100,
                "semi": true,
            }
        ]
    },
};
