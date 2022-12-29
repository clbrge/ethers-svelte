<script>
  import { connected, provider, signerAddress } from '../stores'

  export let address = $signerAddress
  export let pending = 'pending'
  // todo format + symbol

  $: balance = $connected && address ? $provider.getBalance(address) : ''

</script>

{#if address}{#await balance}{pending}{:then value}{value}{/await}{/if}
