<script>

  import { connected, provider, contracts } from 'svelte-ethers-store'

  import { test } from '$lib/cache'

  $: network = $connected ? $provider.getNetwork() : ''

</script>


<svelte:head>
  <title>About</title>
</svelte:head>

<div class="content">

  <h1>using the contracts store</h1>

  {#if $connected }
  {#await network}
  <span>waiting...</span>
  {:then value}
  {#if value.name === 'rinkeby' }


  {#await $contracts.link.totalSupply()}
  <span>waiting...</span>
  {:then supply}
  <p>Let's call $contracts.link.totalSupply() :</p>
  <p>ERC20 LINK contract has a supply of {supply} tokens on Rinkeby</p>
  {/await}


  {:else}

  <p>This is not rinkeby but the { value.name } network... Please update to Rinkeby</p>

  {/if}
  {/await}

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
