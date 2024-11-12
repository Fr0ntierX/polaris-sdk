const config = {
  extends: ["prettier", "plugin:prettier/recommended", "plugin:import/recommended", "plugin:import/typescript"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint", "import", "prettier"],
  rules: {
    "prettier/prettier": ["error", { endOfLine: "auto" }, { usePrettierrc: true }],
    "import/prefer-default-export": "off",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-unused-vars": "off",
    "import/order": [
      "warn",
      {
        alphabetize: {
          caseInsensitive: true,
          order: "asc",
        },
        groups: ["builtin", "external", "index", "sibling", "parent", "internal", "type"],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["types"],
        "newlines-between": "always",
      },
    ],
  },
};

module.exports = config;
