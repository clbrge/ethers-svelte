<script>

  import { onMount } from 'svelte'

  import { ethers } from 'ethers'
  import { connected, provider, signer, chainId, signerAddress, defaultEvmStores } from 'svelte-ethers-store'
  //import Web3Modal from "web3modal"

  import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json'

  let type
  let pending = false

  const LINK_ON_RINKEBY = '0x01be23585060835e02b77ef475b0cc51aa1e0709'
  defaultEvmStores.attachContract('link', LINK_ON_RINKEBY, IERC20.abi)


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
      infuraId: import.meta.env.VITE_INFURA_API_KEY
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
  <h1>svelte-ethers-store: using setProvider()</h1>

  <p>
	Before using any stores, you need to establish a connection to an EVM blockchain.
    Here are a few examples to connect to the provider, RPC or others providers.
    Check the code and the README to learn more.
  </p>


  <p>Choose the provider:</p>
  <button class="button" disabled={pending} on:click={connect}>Connect with {type}</button>
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

  <button class="button" disabled={pending} on:click={enable}>Connect with Web3modal</button>
  {#if pending}connecting...{/if}


  {#if $connected}

  <p>
	Well done, you are now connected to the blockchain (account {$signerAddress})

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

  <button class="button" on:click={disconnect}> Disconnect </button>

  {/if}

</div>

<style>

.content {
  width: 100%;
  max-width: var(--column-width);
  margin: var(--column-margin-top) auto 0 auto;
}


</style>
