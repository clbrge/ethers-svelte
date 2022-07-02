<script>
  import { onMount } from 'svelte'
  import { signerAddress } from 'svelte-ethers-store'
  import jazzicon from '@metamask/jazzicon'

  export let address = $signerAddress
  export let size = 30

  let target

  onMount(() => {
    const seed = parseInt(address.toLowerCase().slice(2, 10), 16)
    target.parentNode.replaceChild(jazzicon(size, seed), target)
  })

</script>

<div bind:this={target} />
