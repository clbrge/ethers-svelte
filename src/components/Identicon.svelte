<script>
  import { onMount } from 'svelte'
  import { connected, provider, signerAddress } from 'svelte-ethers-store'
  import makeBlockie from 'ethereum-blockies-base64'

  export let address = $signerAddress

  let img

  onMount(() => {
    img.src = makeBlockie('0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8');
  })

</script>

<img bind:this={img}>
