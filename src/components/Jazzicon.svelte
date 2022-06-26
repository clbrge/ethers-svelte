<script>
  import { onMount } from 'svelte'
  import { signerAddress } from 'svelte-ethers-store'
  import jazzicon from '@metamask/jazzicon'

  export let address = $signerAddress
  export let size = 100

  let target

  onMount(() => {
    const seed = parseInt(address.toLowerCase().slice(2, 10), 16)
    target.appendChild(jazzicon(size, seed))
  })

</script>

<div bind:this={target} />
