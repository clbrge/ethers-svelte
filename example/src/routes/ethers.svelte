<script>

  import { ethers } from 'ethers'
  import { connected, provider, signer, defaultEvmStores } from 'svelte-ethers-store'


  //import { provider, signer } from 'ethers'

  const connect = async () => {

    const x = new ethers.providers.Web3Provider( window.ethereum )

    //new ethers.providers.InfuraProvider("ropsten")
    //new ethers.providers.EtherscanProvider("rinkeby")
    //new ethers.providers.AlchemyProvider("ropsten")
    //new ethers.providers.CloudflareProvider()

    // await defaultEvmStores.setBrowserProvider()

    await defaultEvmStores.setProvider(  x  )

    console.log('$connected', defaultEvmStores.$connected  )
    console.log('$provider', defaultEvmStores.$provider  )
    console.log('$signer', defaultEvmStores.$signer  )


  }
  const disconnect = async () => {
    console.log('connect', defaultEvmStores )
    await defaultEvmStores.disconnect()
  }

  $: network = $connected ? $provider.getNetwork() : ''



</script>


  <svelte:head>
	<title>About</title>
</svelte:head>

<div class="content">
	<h1>About svelte-ethers-store</h1>

	<p>
		This is a <a href="https://kit.svelte.dev">SvelteKit</a> app. You can make your own by typing the
		following into your command line and following the prompts:
	</p>



    {#if $connected}

	<p>
	  Well done, you are now connected to the blockchain

      {#await network}
      <span>waiting...</span>
      {:then value}
      <span>{JSON.stringify(value)}</span>
      {/await}

    </p>


    <button on:click={disconnect}> Disconnect </button>

    {:else}

    <button on:click={connect}> Connect </button>

    {/if}


</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
