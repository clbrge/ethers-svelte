<script>
  import { onMount } from 'svelte'
  import { signerAddress } from 'svelte-ethers-store'
  import makeBlockie from 'ethereum-blockies-base64'

  export let address = $signerAddress
  let importedClasses = ''
  export { importedClasses as class }

  let img

  onMount(() => {
    img.src = makeBlockie(address)
  })

</script>

<img bind:this={img} class={importedClasses}>

<style>

img {
  display: block;
  height: auto;
  width: 100%;
}

</style>
