import dts from "rollup-plugin-dts";

export default [
  {
    input: "./src/stores.js",
    output: [
      { file: "dist/index.mjs", format: "es" },
      { file: "dist/index.js", format: "umd", name: "ethers-stores" }
    ]
  },
  {
    input: "./src/ethers-svelte.d.ts",
    output: [{ file: "dist/ethers-svelte.d.ts", format: "es" }],
    plugins: [dts()],
  },
]
