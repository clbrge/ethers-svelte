<script>

  import { connected, provider, signerAddress } from 'svelte-ethers-store'

  import { test } from '$lib/cache'

  import { Balance, Identicon, Jazzicon } from 'svelte-ethers-store/components'

  import Highlight from 'svelte-highlight'
  import { xml } from "svelte-highlight/languages"

  import lightfair from "svelte-highlight/styles/lightfair"

  $: network = $connected ? $provider.getNetwork() : ''

</script>

<svelte:head>
  {@html lightfair}
</svelte:head>


<div class="content">

  <h1>svelte-ethers-store</h1>

  <h2>using Components</h2>

  {#if $connected }

    <Highlight language={xml} code={'\n<Balance address={$signerAddress} />\n\n'} />

    Balance of {$signerAddress} : <Balance address={$signerAddress} />

    <hr />

    <Highlight language={xml} code={'\n<Identicon address={$signerAddress} class="whatever" />\n\n'} />

    Identicon of {$signerAddress} :
    <figure class="identicon">
      <Identicon address={$signerAddress} class="whatever"  />
    </figure>

    <hr />

    <Highlight language={xml} code={'\n<Jazzicon address={$signerAddress} class="whatever" />\n\n'} />

    Jazzicon of {$signerAddress} : <Jazzicon address={$signerAddress} class="whatever" />

  {:else}

    <p>
      Please first <a href="/ethers/set">connect</a>
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

  .identicon {
    display: inline-block;
    height: 32px;
    width: 32px;
  }

  hr {
    margin-top: 2em;


  }


</style>
