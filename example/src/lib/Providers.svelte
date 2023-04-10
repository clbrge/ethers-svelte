<script>

  import { onMount } from 'svelte'

  import { ethers } from 'ethers'

  import Highlight from 'svelte-highlight'
  import { xml } from "svelte-highlight/languages"

  import lightfair from "svelte-highlight/styles/lightfair"

  import {
    connected,
    provider,
    signer,
    chainData,
    chainId,
    signerAddress,
    evmProviderType,
    defaultEvmStores as evm
  }
  from 'ethers-svelte'

  let type
  let pending = false

  const connect = async () => {
    pending = true
    try {
      const handler = {
        Browser: () => evm.setProvider(),
        Localhost: () => evm.setProvider('http://127.0.0.1:8545'),
        Localhost4: () => evm.setProvider('http://127.0.0.1:8545', 4),
        LocalhostNull: () => evm.setProvider('http://127.0.0.1:8545', null),
        Gnosis: () => evm.setProvider('https://rpc.gnosischain.com'),
        Arbitrum: () => evm.setProvider('https://arb1.arbitrum.io/rpc'),
        Infura: () => evm.setProvider(new ethers.InfuraProvider('goerli'), null),
        Etherscan: () => evm.setProvider(new ethers.EtherscanProvider('goerli'), null),
        Alchemy: () => evm.setProvider(new ethers.AlchemyProvider('goerli'), null),
        Clouflare: () => evm.setProvider(new ethers.CloudflareProvider(), null),
      }
      console.log('[example]', type, handler[type])
      await handler[type]()
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
    evm.setProvider(provider)
    pending = false
  }

  const disconnect = async () => {
    await evm.disconnect()
    pending = false
  }

  $: network = $connected ? $provider.getNetwork() : ''
  $: account = $connected && $signer ? $signer.getAddress() : ''

</script>


<div class="content">

  <h1>ethers-svelte</h1>

  <h2>using setProvider()</h2>

  {#if !$connected}

  <p>
    Before using any stores, you need to establish a connection to an EVM blockchain.
    Here are a few examples to connect to the provider, RPC or others providers.
    Check the code and the README to learn more.
  </p>

  <p>Use an external provider</p>

  <button class="button" disabled={pending} on:click={enable}>Connect with Web3modal</button>

  <hr />

  <p>Or choose the setProvider method:</p>

  <button class="button" disabled={pending} on:click={connect}>Connect with</button>

  <select bind:value={type}>
    <option value="Browser">Browser (window.ethereum)</option>
    <option value="Localhost">Localhost (eg ganache or hardhat on http://127.0.0.1:8545)</option>
    <option value="Localhost4">Localhost using account index 4</option>
    <option value="LocalhostNull">Localhost but only provider (no signer)</option>
    <option value="Gnosis">https://rpc.gnosischain.com (RPC)</option>
    <option value="Arbitrum">https://arb1.arbitrum.io/rpc (RPC)</option>
    <option value="Infura">ethers.InfuraProvider('goerli')</option>
    <option value="Etherscan">ethers.EtherscanProvider('goerli')</option>
    <option value="Alchemy">ethers.AlchemyProvider('goerli')</option>
    <option value="Clouflare">ethers.CloudflareProvider()</option>
  </select>


  {#if pending}connecting...{/if}

  {:else}

  <p>
   You are now connected to the blockchain (account {$signerAddress})
  </p>

  <button class="button" on:click={disconnect}> Disconnect </button>

  <p>Use the stores in your HTML to get responsive value of evm connection</p>

  <h2>Current stores values:</h2>

  <ul>
    <li>$connected: {$connected}</li>
    <li>$chainId: {$chainId}</li>
    <li>$evmProviderType: {$evmProviderType}</li>
    <li>$signerAddress: {$signerAddress}</li>
    <li>$chainData.name: {$chainData.name}</li>
  </ul>

  <h3>you may also use <em>await</em> </h3>

    <Highlight language={xml} code={`\n<p>
    {#await network}
    <span>waiting...</span>
    {:then value}
    connected to <span>{value.name}[{value.chainId}]</span>
    {/await}

    {#await account}
    <span>waiting...</span>
    {:then value}
    with {#if value}account {value}{:else}no account{/if}
    {/await}
  </p>\n\n`} />

    generates

    <p style="background: #fff;">
    {#await network}
    <span>waiting...</span>
    {:then value}
    connected to <span>{value.name}[{value.chainId}]</span>
    {/await}

    {#await account}
    <span>waiting...</span>
    {:then value}
    with {#if value}account {value}{:else}no account{/if}
    {/await}
  </p>

 {/if}

</div>

<style>

  select {
    margin-top: 1em;
    padding: 0.5em;
    font-size: 80%;
  }


  ul li {
    list-style: none;
    text-align: left;
  }

  ul li:before {
    content: "=> ";
  }

</style>
