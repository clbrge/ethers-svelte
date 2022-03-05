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
    input: "./src/svelte-ethers-store.d.ts",
    output: [{ file: "dist/svelte-ethers-store.d.ts", format: "es" }],
    plugins: [dts()],
  },
]
