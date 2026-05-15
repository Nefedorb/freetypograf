import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "src-tauri/target/**",
      "src-tauri/gen/**",
      "coverage/**"
    ]
  },
  ...nextVitals
];

export default eslintConfig;
