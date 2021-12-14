---

# svelte-ethers-store

Use the [ethers.js library](https://docs.ethers.io/v5/) as a
collection of [readable svelte stores](https://svelte.dev/tutorial/readable-stores)
for Svelte, Sapper or Sveltekit.

## Installation

1. add the `svelte-ethers-store` package

```bash
npm i svelte-ethers-store
```

## Basic usage (default stores connected to one chain)

## Derived stores

This library is creating automatically a set of readable Svelte stores
that are automatically updated when a new connection happens, or when
the chain or the selected account change. You can import them directly
in any svelte or js files :

```js
import { connected, provider, signer, chainId, chainData} from 'svelte-ethers-store'
```

 * connected: store value is true a connection has been set up.
 * provider: store value is an Ethers.js Provider instance if connected.
 * signer: store value is an Ethers.js Signer instance if connected.
 * chainId: store value is the current chainId if connected.
 * chainData: store value is the current blokchain CAIP-2 data (if connected), see below.

For these stores to be useful in your svelte application, you first need to connect to the blockchain.

The main connection helper `defaultEvmStores` can be use to initiate a connection.

```js
import { defaultEvmStores } from 'svelte-ethers-store'
```

### Connection with the browser provider (wallets like metamask)

To enable a connection with the current window provider: 

```js
defaultEvmStores.setBrowserProvider()
```

Please note that your code need to be in browser context when
`setBrowserProvider` is running. So you may want to use `onMount` when
using Sapper or Sveltekit. Similarly, you cannot use
`setBrowserProvider` in SSR context.

```js
  onMount(
    () => {
      // add a test to return in SSR context
      defaultEvmStores.setBrowserProvider()
    }
  )
```

### Connection with other providers (ws, http, Web3Modal, Walletconnect, etc)

To enable connection using an url string or a valid provider object
(as returned by web3Modal or WalletConnect for example):

```js
defaultEvmStores.setProvider(<ws/https or http provider url or provider Object>)
```


### Using the connection Ethers Providers and Signers API 

Now that a connection has been established, you may import the default
`provider` and `signer` stores anywhere in your application to use
Ethers API. Use the `$` prefix svelte notation to access their values
and use the Ethers.js API.

```js
  import { connected, provider, signer } from 'svelte-ethers-store'

  const { name, chainId } = await $provider.getNetwork()

  const balance = await $signer.getBalance()
```

### Forcing a disconnect (and the remove the provider listeners)

Simply call the function `disconnect` directly on the store. For example with the default store:

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
