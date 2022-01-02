<script>

  import { onMount } from 'svelte'

  import { ethers } from 'ethers'
  import { connected, provider, signer, defaultEvmStores } from 'svelte-ethers-store'
  //import Web3Modal from "web3modal"

  let type
  let pending = false

  const connect = async () => {
    pending = true
    try {
      const handler = {
        Browser: () => defaultEvmStores.setProvider(),
        Localhost: () => defaultEvmStores.setProvider('http://127.0.0.1:8545'),
        Localhost4: () => defaultEvmStores.setProvider('http://127.0.0.1:8545', 4),
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
      pending = false
    } catch(e) {
      console.log(e)
      pending = false
    }
  }

  const enable = async () => {
    pending = true
    let WalletConnectProvider = window.WalletConnectProvider.default
    const provider = new WalletConnectProvider({
      infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Required
    })
    //  Enable session (triggers QR Code modal)
    await provider.enable();
    defaultEvmStores.setProvider(provider)
    pending = false
  }

  const disconnect = async () => {
    await defaultEvmStores.disconnect()
    pending = false
  }

  $: network = $connected ? $provider.getNetwork() : ''
  $: account = $connected && $signer ? $signer.getAddress() : ''

</script>


<svelte:head>
  <title>About</title>
</svelte:head>

<div class="content">
  <h1>About svelte-ethers-store</h1>

  <p>
	Here is a simple example with many type of persistent connection using svelte-ethers-store.
  </p>



  {#if $connected}

  <p>
	Well done, you are now connected to the blockchain

    {#await network}
    <span>waiting...</span>
    {:then value}
    <span>{JSON.stringify(value)}</span>
    {/await}

    {#await account}
    <span>waiting...</span>
    {:then value}
    with {#if value}account {value}{:else}no account{/if}
    {/await}

  </p>

  <button on:click={disconnect}> Disconnect </button>

  {:else}

  <p>Choose the provider:</p>
  <button disabled={pending} on:click={connect}>Connect with {type}</button>
  <select bind:value={type}>
    <option value="Browser">Browser (window.ethereum)</option>
    <option value="Localhost">Localhost (eg ganache or hardhat on http://127.0.0.1:8545)</option>
    <option value="Localhost4">Localhost using account index 4</option>
    <option value="RPC">https://rpc.xdaichain.com/ (RPC)</option>
    <option value="Infura">ethers.providers.InfuraProvider('ropsten')</option>
    <option value="Etherscan">ethers.providers.EtherscanProvider('rinkeby')</option>
    <option value="Alchemy">ethers.providers.AlchemyProvider('ropsten')</option>
    <option value="Clouflare">ethers.providers.CloudflareProvider()</option>
  </select>

  <button disabled={pending} on:click={enable}>Connect with Web3modal</button>
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
