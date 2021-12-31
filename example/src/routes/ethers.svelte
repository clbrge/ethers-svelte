<script>

  import { ethers } from 'ethers'
  import { connected, provider, signer, defaultEvmStores } from 'svelte-ethers-store'

  let type
  let pending = false

  const connect = async () => {
    pending = true
    try {
      const handler = {
        Browser: () => defaultEvmStores.setBrowserProvider(),
        RPC: () => defaultEvmStores.setProvider('https://rpc.xdaichain.com/'),
        Infura: () => defaultEvmStores.setProvider(new ethers.providers.InfuraProvider("ropsten")),
        Etherscan: () => defaultEvmStores.setProvider(new ethers.providers.EtherscanProvider("rinkeby")),
        Alchemy: () => defaultEvmStores.setProvider(new ethers.providers.AlchemyProvider("ropsten")),
        Clouflare: () => defaultEvmStores.setProvider(new ethers.providers.CloudflareProvider()),
      }

      await handler[type]()

      console.log('$connected', defaultEvmStores.$connected  )
      console.log('$provider', defaultEvmStores.$provider  )
      console.log('$signer', defaultEvmStores.$signer  )
    } catch(e) {
      console.log(e)
      pending = false
    }
  }

  const disconnect = async () => {
    await defaultEvmStores.disconnect()
    pending = false
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

  <p>Choose the provider:</p>
  <select bind:value={type}>
    <option value="Browser">Browser (window.ethereum)</option>
    <option value="RPC">https://rpc.xdaichain.com/ (RPC)</option>
    <option value="Infura">ethers.providers.InfuraProvider('ropsten')</option>
    <option value="Etherscan">ethers.providers.EtherscanProvider('rinkeby')</option>
    <option value="Alchemy">ethers.providers.AlchemyProvider('ropsten')</option>
    <option value="Clouflare">ethers.providers.CloudflareProvider()</option>
  </select>

  <button disabled={pending} on:click={connect}>Connect with {type}</button>
  {#if pending}connecting...{/if}

  {/if}


</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
