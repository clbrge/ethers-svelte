<script>

  import { defaultEvmStores as evm, connected, chainId, chainData, contracts, signerAddress } from 'svelte-ethers-store'

  import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json'

  import Highlight from 'svelte-highlight'

  import { javascript } from "svelte-highlight/languages"
  import lightfair from "svelte-highlight/styles/lightfair"

  const LINKTOKEN_ADDRESS_ON_GOERLI = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'

  evm.attachContract('link', LINKTOKEN_ADDRESS_ON_GOERLI, IERC20.abi)

</script>

<svelte:head>
  {@html lightfair}
</svelte:head>

<div class="content">

  <h1>svelte-ethers-store</h1>

  <h2>using the '$contracts' store</h2>

  <p>
    The following code initialize the $contracts store with the ERC20 LINK Token.
    Here we use the #await svelte block to load the token totalSupply of the contract
  </p>

    <Highlight language={javascript} code={`
  const LINKTOKEN_ADDRESS_ON_GOERLI = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'

  evm.attachContract('link', LINKTOKEN_ADDRESS_ON_GOERLI, IERC20.abi)
`} />

  {#if $connected }

    {#if $chainId !== 5 }

      <p>
        Your are connected to the wrong network ("{$chainData.name}")". Please
        connect to the testnet Görli for the $contract store demo
      </p>

    {:else if $contracts.link}
      {#await $contracts.link.totalSupply() }
        <span>waiting for $contracts.link.totalSupply() Promise...</span>
      {:then supply}
        <p>We have the result of $contracts.link.totalSupply() :</p>
        <p>ERC20 LINK contract has a supply of {supply} tokens on Görli.</p>
      {/await}

    {/if}

  {:else}

    <p>
      Please first <a href="/ethers/set">connect</a>
      connect to the görli network to be able to use this page.
    </p>

  {/if}

  {#if false}
    <button class="button" on:click={exec}>Send 0.01 Gorli ETH to the zero address</button>
  {/if}

</div>
