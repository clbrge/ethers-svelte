
# svelte-ethers-store

Use the [ethers.js library](https://docs.ethers.io/v5/) as a
collection of [readable Svelte stores](https://svelte.dev/tutorial/readable-stores)
for Svelte, Sapper or SvelteKit.

If you prefer to use the [web3.js library](https://web3js.readthedocs.io/) to interact
with EVM, you may be interested by the sister package [svelte-web3](https://www.npmjs.com/package/svelte-web3).

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
import { connected, provider, chainId, chainData, signer, signerAddress, contracts } from 'svelte-ethers-store'
```

 * connected: store value is true if a connection has been set up.
 * provider: store value is an Ethers.js Provider instance when connected.
 * chainId: store value is the current chainId when connected.
 * chainData: store value is the current blokchain CAIP-2 data (when connected), see below.
 * signer: store value is an Ethers.js Signer instance when connected.
 * signerAddress: store value is a shortcut to get `$signer.getAddress()` when connected.
 * contract: store value is an Object for all ethers.Contract instances you need.

For these stores to be useful in your Svelte application, a connection
to an EVM blockchain first need to established . The abstract helper
`defaultEvmStores` can be used to initiate the connection and
automatically instanciate all stores.

```js
import { defaultEvmStores } from 'svelte-ethers-store'
```

### Connection with the browser provider (eg wallets like Metamask)

To enable a connection with the current [EIP-1193
provider](https://eips.ethereum.org/EIPS/eip-1193#appendix-i-consumer-facing-api-documentation)
injected in the browser `window` context, simply call `setProvider` on
the library abstract helper with no argument:

```js
defaultEvmStores.setProvider()
```

Please note that `setProvider` can only to be called with no argument
in a browser context. So you may want to use `onMount` when using
Sapper or SvelteKit. Similarly, you cannot use `setProvider` with no
argument in SSR context.

```js
  onMount(
    () => {
      // add a test to return in SSR context
      defaultEvmStores.setProvider()
    }
  )
```

`svelte-ethers-store` will automatically update the stores when the network or
accounts change and remove listeners at disconnection.

:exclamation: previous version of `svelte-ethers-store` were using a special
method `setBrowserProvider`. The former naming still works but will be
removed in later versions. Please update your code!


### Connection with non injected EIP-1193 providers

To connect to non injected EIP-1193 providers like :

 * buidler.dev
 * ethers.js
 * eth-provider
 * WalletConnect
 * Web3Modal

Call `setProvider` on the library abstract helper with the JavaScript provider
instance object of the library. For example with Web3Modal :

```js
const web3Modal = new Web3Modal(<your config>)
const provider = await web3Modal.connect()
defaultEvmStores.setProvider(provider)
```

`svelte-ethers-store` will automatically update the stores when the network or
accounts change and remove listeners at disconnection.


### Connection with other Ethers.js providers (ws, http, ipc, ...)

You can instanciate many types of providers using Ethers.js, see the
relevant
[documentation](https://docs.ethers.io/v5/api/providers/other/) and
simply pass them as argument to `defaultEvmStores.setProvider()` to inititate the stores:

```js
defaultEvmStores.setProvider(new ethers.providers.InfuraProvider(<args>))
// or 
defaultEvmStores.setProvider(new ethers.providers.EtherscanProvider(<args>))
// or 
defaultEvmStores.setProvider(new ethers.providers.AlchemyProvider(<args>))
// etc...
```

As a shortcut, if you pass an URL string or a valid connection object, a
[Ethers.js JsonRpcProvider](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/)
will be automatically instantiated.

For provider that support the function `getSigner()`, a Signer Object will be automatically
associated with the `signer` store. You can also pass `addressOrIndex` as the second argument
of `setProvider()` to select another account than the default when possible.

```js
defaultEvmStores.setProvider(<Ethers provider>, <addressOrIndex>)
```

If you don't need a signer, you might also call `setProvider` with the
argument `addressOrIndex` as a `null` value and bypass any attempt to
detect an account.


### Using the stores

After a connection has been established, you may import the stores
anywhere in your application. Most of the time, you should use the `$`
prefix Svelte notation to access the stores values.


```html
<script>

  import { connected, chainId, signerAddress } from 'svelte-ethers-store'

</script>

{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain (id {$chainId}) with account ($signerAddress)</p>

{/if}
```

### Using the Ethers.js Providers and Signers API

Likewise use the `$` prefix Svelte notation to access Provider or Signer
read-only abstractions and use the whole Ethers.js API. (beware, in the Ethers 
library documentation, Provider or Signer instances are always noted as `provider`
 and `signer`, without `$`, but in the context of `svelte-ethers-store`, this naming
is used by the Svelte stores themselves encapsulating Provider or Signer instances).

```js
  import { connected, provider, signer } from 'svelte-ethers-store'

  // ...

  const { name, chainId } = await $provider.getNetwork()

  const balance = await $signer.getBalance()
  
  $signer.sendTransaction({<to>, <value>, <gasLimit>});

```

For providers that don't support `getSigner`, the value `$signer` will be `null`.


### Using the contracts store for reactive contract calls

To enjoy the same reactivity as using `$provider` and `$signer` but
with a contract instance, you first need to declare its address and
interface. To differenciate each `ethers.Contract` instance, you also
need to define a logical name. That's the function `attachContract`:


```html
<script>

  import { defaultEvmStores } from 'svelte-ethers-store'

  // ... 

  defaultEvmStores.attachContract('myContract',<address>, <abi>)

</script>
```

`attachContract` only needs to be called once and can be called before
connection since `ethers.Contract` instances will only be created when
a connection becomes available. You may want to reattach new contract
definition or abi for example when you the current network change. For
the old definition will be overwritten and instance updated in the
`contracts` store, simply use the same logical name.

After a contract as be declared, you can use its instance anywhere
using the `$` notation and the logical name :

```html
<script>

  import { contracts } from 'svelte-ethers-store'

  // ... 

</script>


  {#await $contracts.myContract.totalSupply()}

  <span>waiting...</span>

  {:then value}

  <span>result of contract call totalSupply on my contract : { value }   </span>

  {/await}

```

By default, `svelte-ethers-store` build contract instances using the signer if
available and if not the provider. You may want to force using the current provider
by passing `false` as fourth argument.

```html
  defaultEvmStores.attachContract('myContract', <address>, <abi>, <signerIfavailble>)
```

### Reading stores outside of Svelte files

The `$` prefix Svelte notation to access store values is only
available inside Svelte files. To directly access the instantiated
values in pure javascript library without subscribing to the store,
you can use a special getter on the library abstract helper:

```js
// this is not a Svelte file but a standard JavaScript file 
import { defaultEvmStores } from 'svelte-ethers-store'

if (defaultEvmStores.$selectedAccount) {

  // do something if store selectedAccount is non null

}
```

### Forcing a disconnect (and removing all listeners)

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
connected. If the store has not yet been connected (with
`setProvider`), the store value will be `undefined`.

This object is extremely useful to build components that reactively
update all variables elements that depends on the current active chain
or account.

Below is the CAIP-2 formatted information when the default store is 
connected with the Ethereum Mainnet :

```json
{
  "name": "Ethereum Mainnet",
  "chain": "ETH",
  "icon": "ethereum",
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
  "slip44": 60,
  "ens": { "registry": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
  "explorers": [{
    "name": "etherscan",
    "url": "https://etherscan.io",
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

Another solution is to use the helper function `getChainDataByChainId`
that takes the chainId as argument and returns
the CAIP-2 data or an empty object if not found.

```js
import { getChainDataByChainId } from 'svelte-ethers-store'

console.log( getChainDataByChainId(5) )
```

## Ethers Svelte components [ experimental ]

We plan to export generic Svelte low level components both to
demonstrate the use of the `svelte-ethers-store` library and as
resuable and composable best practices components. A `Balance` and
`Identicon` components have been implemented for now. You are welcome
to help define and develop new components by joining our discussions
in our [Discord](https://discord.gg/7yXuwDwaHF).

See also the `components` route in the example directory.

```html
  import { Balance } from 'svelte-ethers-store/components'
</script>

<p>balance = <Balance address="0x0000000000000000000000000000000000000000" /></p>

```


## FAQ


### *Cannot run using SvelteKit, I get error:* `Cannot read property 'BN' of undefined`

The module `ethers` has not been detected by Vite. You need `import ethers` somewhere
in your app or add `optimizeDeps: { include: [ 'ethers' ] }` in `svelte.config.js`


### *how to auto-connect on page load?*

It is out of scope of this package to implement this function but it
generally depends on the type of provider you are using and a way to
store connection information between page loads (for example by using
localStorage).

