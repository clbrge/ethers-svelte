<script>
  import { onMount } from 'svelte'
  import { signerAddress } from 'svelte-ethers-store'
  import makeBlockie from 'ethereum-blockies-base64'

  export let address = $signerAddress

  let img

  onMount(() => {
    img.src = makeBlockie(address)
  })

</script>

<img bind:this={img}>
