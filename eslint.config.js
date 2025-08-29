import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  { 
    ignores: ["dist", "supabase/functions/**", "node_modules/**", "AUTH_TESTS/**"] 
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        __dirname: "readonly",
        require: "readonly"
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
];