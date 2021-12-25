
# svelte-ethers-store

Use the [ethers.js library](https://docs.ethers.io/v5/) as a
collection of [readable svelte stores](https://svelte.dev/tutorial/readable-stores)
for Svelte, Sapper or SvelteKit.

If you prefer to use the [web3.js library](https://web3js.readthedocs.io/) to intereact
with EVM, you may be interested by the sister package [svelte-web3](https://www.npmjs.com/package/svelte-web3).%

### Community

For additional help or discussion, join us [in our
Discord](https://discord.gg/7yXuwDwaHF).

## Installation

Add the `svelte-ethers-store` package

```bash
npm i svelte-ethers-store
```

## Basic usage (default stores connected to one chain)

### Derived stores

This library creates a set of readable Svelte stores that are
automatically updated when a new connection happens, or when the chain
or the selected account change. You can import them directly in any
Svelte or JavaScript files :

```js
import { connected, provider, signer, chainId, chainData} from 'svelte-ethers-store'
```

 * connected: store value is true a connection has been set up.
 * provider: store value is an Ethers.js Provider instance when connected.
 * signer: store value is an Ethers.js Signer instance when connected.
 * chainId: store value is the current chainId when connected.
 * chainData: store value is the current blokchain CAIP-2 data (when connected), see below.

For these stores to be useful in your Svelte application, a connection to an EVM
blockchain first need to established . The abstract helper
`defaultEvmStores` can be used to initiate the connection and automatically
instanciate all stores.

```js
import { defaultEvmStores } from 'svelte-ethers-store'
```

### Connection with the browser provider (eg wallets like Metamask)

To enable a connection with the current window provider, simply call
`setBrowserProvider` on the library abstract helper:

```js
defaultEvmStores.setBrowserProvider()
```

Please note that `setBrowserProvider` can only to be executed in a browser
context. So you may want to use `onMount` when using Sapper or
SvelteKit. Similarly, you cannot use `setBrowserProvider` in SSR
context.

```js
  onMount(
    () => {
      // add a test to return in SSR context
      defaultEvmStores.setBrowserProvider()
    }
  )
```

### Connection with other providers (ws, http, Web3Modal, Walletconnect, etc)

To enable connection using an URL string or a valid provider object
(for example as returned by web3Modal or WalletConnect):

```js
defaultEvmStores.setProvider(<ws/https or http provider url or provider Object>)
```
### Using the stores

After a connection has been established, you may import the stores
anywhere in your application. Most of the time, you should use the `$`
prefix Svelte notation to access the stores values.


```html
<script>

  import { connected, chainId } from 'svelte-ethers-store'

</script>

{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain with id {$chainId}</p>

{/if}
```

### Using the Ethers.js Providers and Signers API

Likewise use the `$` prefix Svelte notation to access Provider or Signer
read-only abstractions and use the whole Ethers.js API. (beware, in the Ethers 
library documentation, Provider or Signer instances are always noted as `provider`
 and `signer, without `$`, but in the context of `svelte-ethers-store`, this naming
is used by the Svelte stores themselves encapsulating Provider or Signer instances).

```js
  import { connected, provider, signer } from 'svelte-ethers-store'

  // ...

  const { name, chainId } = await $provider.getNetwork()

  const balance = await $signer.getBalance()
```

### Reading stores outside of Svelte files

The `$` prefix Svelte notation to access store values in only
available inside Svelte files. To directly access the instantiated
values in pure javascript library without subscribing to the store,
you can use special getter on the library abstract helper:

```js
// this is not a Svelte file but a standard JavaScript file 
import { defaultEvmStores } from 'svelte-ethers-store'

if (defaultEvmStores.$selectedAccount) {

  // do something if store selectedAccount is non null

}
```

### Forcing a disconnect (and the remove all listeners)

Simply call the function `disconnect` directly on the on the library
abstract helper:

```js
defaultEvmStores.disconnect()
```

## Human readable chain CAIP-2 information

`chainData` is a store returning the current JavaScript [CAIP-2 representation](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) object.

### Example

The information returned by the `chainData` store depends (like all
other ethers stores) on which chain the current provider is
connected. If the store has not yet been connected (with `setProvider`
or `setBrowserProvider`), the store value will be `undefined`.

Below is the CAIP-2 formatted information when the default store is 
connected with the Ethereum Mainnet :

```json
{
  "name": "Ethereum Mainnet",
  "chain": "ETH",
  "network": "mainnet",
  "rpc": [
    "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
    "https://api.mycryptoapi.com/eth"
  ],
  "faucets": [],
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "infoURL": "https://ethereum.org",
  "shortName": "eth",
  "chainId": 1,
  "networkId": 1,
  "icon": "ethereum",
  "explorers": [{
    "name": "etherscan",
    "url": "https://etherscan.io",
    "icon": "etherscan",
    "standard": "EIP3091"
  }]
}
```


You might want to access all chains CAIP-2 data directly without using the
`chainData` store. In this case, use the getter `allChainsData`, it returns
the list of all CAIP-2 data available.

```js
import { allChainsData } from 'svelte-ethers-store'

console.log( allChainsData )
```
