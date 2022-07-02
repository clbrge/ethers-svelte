<script>
  import { onMount } from 'svelte'
  import { signerAddress } from 'svelte-ethers-store'
  import jazzicon from '@metamask/jazzicon'

  export let address = $signerAddress
  export let size = 32
  let importedClasses = ''
  export { importedClasses as class }

  let target

  onMount(() => {
    const seed = parseInt(address.toLowerCase().slice(2, 10), 16)
    const el = jazzicon(size, seed)
    if (importedClasses) el.setAttribute('class', importedClasses)
    target.parentNode.replaceChild(el, target)
  })

</script>

<div bind:this={target} />
