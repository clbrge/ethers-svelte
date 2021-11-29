
export default [
  {
    input: "./src/stores.js",
    output: [
      { file: "dist/index.mjs", format: "es" },
      { file: "dist/index.js", format: "umd", name: "ethers-stores" }
    ]
  }
]
