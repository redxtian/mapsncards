import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // Relax React rules
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-key": "warn",
      
      // Relax general JavaScript rules
      "no-console": "off",
      "no-debugger": "warn",
      "no-unused-vars": "off",
      "prefer-const": "warn",
      "no-var": "warn",
      
      // Relax Next.js specific rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
