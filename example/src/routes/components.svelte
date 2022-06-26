<script>

  import { connected, provider, signerAddress } from 'svelte-ethers-store'

  import { test } from '$lib/cache'

  import { Balance, Identicon, Jazzicon } from 'svelte-ethers-store/components'


  $: network = $connected ? $provider.getNetwork() : ''

</script>


<svelte:head>
  <title>About</title>
</svelte:head>

<div class="content">

  <h1>svelte-ethers-store: using Components</h1>

  {#if $connected }

  <hr />
  <h2>{'<Balance address={$signerAddress} />'}</h2>

  Balance of {$signerAddress} : <Balance address={$signerAddress} />

  <hr />
  <h2>{'<Identicon address={$signerAddress} />'}</h2>

  Identicon of {$signerAddress} : <Identicon address={$signerAddress} />

  <hr />
  <h2>{'<Jazzicon address={$signerAddress} />'}</h2>

  Jazzicon of {$signerAddress} : <Jazzicon address={$signerAddress} />

  {:else}

  <p>
    Please first <a sveltekit:prefetch href="/ethers">connect</a>
    connect to the Rinkeby network to be able to use this page
  </p>

  {/if}


</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
