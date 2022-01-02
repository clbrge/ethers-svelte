import adapter from '@sveltejs/adapter-auto';
import polyfillNode from 'rollup-plugin-polyfill-node'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  plugins: [
    polyfillNode()
  ],
  optimizeDeps: {
    exclude: ['dragula'] // <- modules that needs shimming have to be excluded from dep optimization
  },
  kit: {
	adapter: adapter(),

	// hydrate the <div id="svelte"> element in src/app.html
	target: '#svelte'
  }
};

export default config;
