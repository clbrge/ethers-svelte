# ethers-svelte

`ethers-svelte` is a package that integrates the [ethers.js v6
library](https://docs.ethers.io/v6/) as a collection of [readable Svelte
stores](https://svelte.dev/tutorial/readable-stores) for Svelte or SvelteKit. It
provides a convenient and reactive way to interact with Ethereum blockchain
using ethers.js in your Svelte applications.

**Key features:****

- A set of reactive Svelte stores, automatically updated when a new connection,
  or when the chain or the selected account changes
- Support for ethers.js version 6, with compatibility for various EVM providers
  (such as browser wallets like Metamask, WalletConnect, Web3Modal, web3-onboard and more)
- A few basic Svelte components for typical ethers.js usage, such as `Balance`,
  `Identicon`, and `Jazzicon`, demonstrating how it is easy to build common UI
  elements in your application.

With `ethers-svelte`, you can quickly set up connections to Ethereum blockchain,
manage accounts and contracts, and create reactive UI components that respond to
changes in the underlying blockchain data. This package simplifies the process
of building decentralized applications using Svelte or SvelteKit (Sapper should
also works but it's official support is now deprecated).

`ethers-svelte` support `ethers.js` version 6. If you want the same package for
`ethers.js` version 5, please use the package
[svelte-ethers-store](https://www.npmjs.com/package/svelte-ethers-store).

If you also use the [web3.js library](https://web3js.readthedocs.io/) to
interact with EVM, you may be interested by the sister package
[svelte-web3](https://www.npmjs.com/package/svelte-web3).

### Community

For additional help or discussion, join us [in our
Discord](https://discord.gg/7yXuwDwaHF).


## Installation

To use `ethers-svelte` in your Svelte or SvelteKit project, you need to add it
as a dependency:

```bash
npm i ethers-svelte
```

Once the package is installed, you can import and use the provided stores and
components in your application, as shown in the [Basic
Usage](#basic-usage-default-stores-connected-to-one-chain) and [Ethers Svelte
Components](#ethers-svelte-components) sections.


## Basic Usage (Default Stores Connected to One Chain)

In this section, we will cover how to use the default stores provided by
`ethers-svelte` for managing a single chain connection. The default stores
include `connected`, `provider`, `chainId`, `chainData`, `signer`,
`signerAddress`, and `contracts`.

### Derived Stores

`ethers-svelte` provides a set of readable Svelte stores that automatically
update when a new connection is established, or when the chain or selected
account changes. Import the required stores in your Svelte or JavaScript files:

```js
import {
  connected,
  provider,
  chainId,
  chainData,
  signer,
  signerAddress,
  contracts,
} from "ethers-svelte"
```

- connected: store value is true if a connection has been set up.
- provider: store value is an Ethers.js Provider instance when connected.
- chainId: store value is the current chainId when connected (** always a BigInt **)
- chainData: store value is the current blokchain CAIP-2 data (when connected), see below.
- signer: store value is an Ethers.js Signer instance when connected.
- signerAddress: store value is a shortcut to get `$signer.getAddress()` when connected.
- contract: store value is an Object for all ethers.Contract instances you need.


To make these stores useful in your Svelte application, you first need to
establish a connection to an EVM blockchain. Use the `defaultEvmStores` helper
to initiate the connection and instantiate all stores:

```js
import { defaultEvmStores } from "ethers-svelte"
```

### Connecting with the Browser Provider (e.g., MetaMask)

To enable a connection with the current [EIP-1193
provider](https://eips.ethereum.org/EIPS/eip-1193#appendix-i-consumer-facing-api-documentation)
injected into the browser's `window` context, simply call the `setProvider()`
method on the `defaultEvmStores` helper without any arguments:

```js
defaultEvmStores.setProvider()
```

Please note that using `setProvider()` without any arguments is only possible in
a browser context. When using SvelteKit, you may want to use the `onMount`
function. Similarly, you cannot use `setProvider` with no argument in SSR
context.

```js
import { onMount } from "svelte"

onMount(() => {
  // Add a test to return in SSR context
  defaultEvmStores.setProvider()
})
```

`ethers-svelte` will automatically update the stores when the network or
accounts change, and it will remove listeners upon disconnection.

### Abbreviating the `defaultEvmStores` Helper

It's common to abbreviate the `defaultEvmStores` helper in applications. For
example, you can use a `evm` shortcut alias as shown in the following example.
This documentation will use this convention going forward.

```js
import {
  defaultEvmStores as evm,
} from "ethers-svelte"

// ...

evm.setProvider()
```

By using the `evm` alias, you can simplify your code and make it easier to read
while still retaining the functionality provided by the `defaultEvmStores`
helper. This convention allows for cleaner code organization and improved
readability in your Ethereum-based applications.


### Connecting with Non-Injected EIP-1193 Providers

For non-injected EIP-1193 providers like:

- buidler.dev
- ethers.js
- eth-provider
- WalletConnect
- Web3Modal
- Web3 Onboard


Call the `setProvider()` method on the `evm` helper with the
JavaScript provider instance object of the library. For example, with Web3Modal:

```js
const web3Modal = new Web3Modal(<your config>)
const provider = await web3Modal.connect()
evm.setProvider(provider)
```

`ethers-svelte` will automatically update the stores when the network or
accounts change, and it will remove listeners upon disconnection.

### Connecting with Other Ethers.js Providers (ws, http, ipc, ...)

You can instantiate various types of providers using Ethers.js (see the
[relevant documentation](https://docs.ethers.org/v6/api/providers/thirdparty/))
and pass them as an argument to `evm.setProvider()` to initiate the
stores:

```js
evm.setProvider(new ethers.InfuraProvider(<args>))
// or
evm.setProvider(new ethers.EtherscanProvider(<args>))
// or
evm.setProvider(new ethers.AlchemyProvider(<args>))
// etc...
```

As a shortcut, if you pass a URL string or a valid connection object, an
[Ethers.js
JsonRpcProvider](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider)
will be automatically instantiated.

For providers that support the `getSigner()` function, a Signer Object will be
automatically associated with the `signer` store. You can also pass
`addressOrIndex` as the second argument of `setProvider()` to select another
account than the default when possible.


```js
evm.setProvider(<Ethers provider>, <addressOrIndex>)
```

If you don't need a signer, you might also call `setProvider()` with the
argument `addressOrIndex` set to `null`, which will bypass any attempt to detect
an account.

### Using the Stores

After a connection has been established, you can import the stores anywhere in
your application. Most of the time, you should use the `$` prefix Svelte
notation to access the store values.

```html
<script>
  import { connected, chainId, signerAddress } from "ethers-svelte"
</script>

{#if !$connected}

<p>My application is not yet connected</p>

{:else}

<p>Connected to chain (id {$chainId}) with account ($signerAddress)</p>

{/if}
```

The example above allows you to display connection status, chain ID, and signer
address in your application based on the current connection state.

As you build your application, you can use these stores to create reactive UI
components that respond to changes in the underlying blockchain data.


### Using the Ethers.js Providers and Signers API

To leverage the full functionality of Ethers.js Providers and Signers within
your Svelte application, use the `$` prefix Svelte notation to access the
`provider` and `signer` stores. This allows you to call methods from the
Ethers.js API directly.

For example, you can interact with the blockchain using the following Ethers.js methods:

```js
import { connected, provider, signer } from "ethers-svelte"

// ...

const { name, chainId } = await $provider.getNetwork()

const balance = await $signer.getBalance()

$signer.sendTransaction({ to: <recipient>, value: <amount>, gasLimit: <gasLimit> })
```

Remember that for providers that don't support `getSigner`, the value of
`$signer` will be `null`.

By using the `$` notation to access the `provider` and `signer` instances, you
can ensure that your application's UI components will react to any changes in
the underlying blockchain data. This simplifies the process of creating and
managing decentralized applications using Svelte.


### Using the Contracts Store for Reactive Contract Calls

The `contracts` store allows you to interact with smart contracts reactively by
declaring their address, ABI, and an optional logical name. To do this, use the
`attachContract()` function provided by `evm`.

```html
<script>
  import { defaultEvmStores as evm } from "ethers-svelte"

  // ...

  evm.attachContract("myContract", <address>, <abi>)
</script>
```

The `attachContract()` function only needs to be called once and can be called
before a connection is established. `Ethers.Contract` instances will be created
when a connection becomes available. If you want to reattach a new contract
definition or ABI when the current network changes, simply use the same logical
name. The old definition will be overwritten, and the instance updated in the
`contracts` store.

After declaring a contract, you can access its instance anywhere in your
application using the `$` notati*on and the logical name:

```html
<script>
  import { contracts } from "ethers-svelte"

  // ...
</script>

{#await $contracts.myContract.totalSupply()}

<span>waiting...</span>

{:then value}

<span>Result of contract call totalSupply on my contract: {value}</span>

{/await}
```

By default, `ethers-svelte` builds contract instances using the signer if
available and the provider otherwise. You can force the use of the current
provider by passing `false` as the fourth argument to `attachContract()`.

```js
evm.attachContract('myContract', <address>, <abi>, false)
```

By using the `$contracts` store, you can create reactive UI components that
interact with smart contracts and automatically update when the underlying
contract state changes.

### Accessing Stores Outside of Svelte Files

When working with pure JavaScript files outside of Svelte components, you cannot
use the `$` prefix notation to access store values directly. Instead, you can
use the `$<store>` method provided by the `defaultEvmStores/evm` helper to access
the instantiated values without subscribing to the store:

```js
// this is not a Svelte file but a standard JavaScript file
import { defaultEvmStores as evm } from "ethers-svelte"

if (evm.$selectedAccount)) {
  // Do something if the store selectedAccount is non-null
}
```

You can use the `$<store>` methods with any of the available store names, such
as `connected`, `provider`, `chainId`, `chainData`, `signer`, `signerAddress`,
and `contracts`.


### Forcing a Disconnect (and Removing All Listeners)

There might be situations where you want to disconnect from the current provider
and remove all associated listeners. To achieve this, simply call the
`disconnect()` method on the `defaultEvmStores/evm` helper:

```js
evm.disconnect()
```

This method will reset the connection state, remove all listeners, and update
the store values accordingly. You can use this method, for example, when your
application needs to switch between different providers or when the user logs
out.

By disconnecting and removing listeners, you can ensure that your application
remains responsive to user actions and maintains a clean state when transitions
occur between providers or user sessions.


## Human Readable Chain CAIP-2 Information

The `chainData` store provides human-readable information about the currently
connected chain in the
[CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md)
format. This information can be useful for displaying details about the
connected chain and updating UI elements reactively.

### Accessing Chain Data

To access the chain data, simply import and use the `chainData` store:

```js
import { chainData } from "ethers-svelte"
```

The information returned by the `chainData` store depends on the connected
chain. If the store has not yet been connected (with `setProvider()`), the store
value will be an empty Object.

### Example

The following is an example of the CAIP-2 formatted information when the default
store is connected to the Ethereum Mainnet. The `chainData` store will return an
object containing various information about the connected chain, such as its
name, chain ID, native currency, and more.

You can use this information to display relevant details about the connected
chain in your application and update your UI reactively based on the current
chain data.

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
  "explorers": [
    {
      "name": "etherscan",
      "url": "https://etherscan.io",
      "standard": "EIP3091"
    }
  ]
}
```


### Accessing All Chains CAIP-2 Data Directly

If you want to access all chains CAIP-2 data directly without using the
`chainData` store, you can use the `allChainsData` getter. It returns the list
of all available CAIP-2 data.

```js
import { allChainsData } from "ethers-svelte"

console.log(allChainsData)
```

Alternatively, you can use the `getChainDataByChainId` helper function, which
takes the `chainId` as an argument and returns the corresponding CAIP-2 data or
an empty object if not found.

```js
import { getChainDataByChainId } from "ethers-svelte"

console.log(getChainDataByChainId(5))
```

These methods allow you to access chain-specific information without relying on
the reactive `chainData` store, making it easier to work with multiple chains or
retrieve data outside of Svelte components.

## Ethers.js Svelte Components

`ethers-svelte` includes several basic Svelte components designed to simplify
common tasks when building Ethereum-based applications. These components
demonstrate how to use the `ethers-svelte` library effectively and serve as
reusable and composable best practices components. Currently, the library
includes `Balance`, `Identicon`, and `Jazzicon` components. We encourage
community members to contribute and help develop additional components by
joining our discussions in our [Discord](https://discord.gg/7yXuwDwaHF).

You can find example usage of these components in the `components` route in the
example directory.

### Balance Component

The `Balance` component displays the balance of a specified Ethereum address. To
use the `Balance` component, import it and pass the address as a prop:

```html
<script>
  import { Balance } from 'ethers-svelte/components'
</script>

<p>Balance: <Balance address="0x0000000000000000000000000000000000000000" /></p>
```

### Identicon Component

The `Identicon` component generates a unique identicon (a visual representation
of an Ethereum address) using the `ethereum-blockies-base64` library. To use the
`Identicon` component, import it and pass the address as a prop:

```html
<script>
  import { Identicon } from 'ethers-svelte/components'
</script>

<Identicon address="0x0000000000000000000000000000000000000000" />
```

### Jazzicon Component

The `Jazzicon` component generates a unique and colorful identicon using the
`@metamask/jazzicon` library. To use the `Jazzicon` component, import it and
pass the address and size (optional) as props:

```html
<script>
  import { Jazzicon } from 'ethers-svelte/components'
</script>

<Jazzicon address="0x0000000000000000000000000000000000000000" size={32} />
```

These components serve as a starting point for building your Ethereum-based
applications using `ethers-svelte`. You can further customize them and create
additional components according to your application's requirements. By
leveraging the reactivity and simplicity of Svelte along with the powerful
features of ethers.js, you can create a seamless and efficient user experience
for your decentralized applications.

## Frequently Asked Questions

### 1. How can I automatically connect to a provider on page load?

Auto-connecting on page load is outside the scope of this package. However, the
implementation depends on the type of provider you are using and a method to
store connection information between page loads (e.g., using localStorage). You
can create a custom function that connects to your desired provider and calls
`evm.setProvider()` on page load.

### 2. Can I use ethers-svelte with multiple chains simultaneously?

Yes, you can create multiple instances of EVM stores by calling
`makeEvmStores(name)` with a unique name for each instance. This allows you to
manage connections, accounts, and contracts for different chains independently.

### 3. Can I use ethers-svelte with Sapper or SvelteKit?

Yes, `ethers-svelte` works with both Sapper and SvelteKit. However, Sapper suppory
is not officially supported and when using `setProvider()` with no arguments in
a server-side rendering (SSR) context, you should use the `onMount` lifecycle
function to ensure it is called only in the browser context.


### 4. Is there an example of integrating `ethers-svelte` with Web3 Onboard

Yes, you can refer to the Rouge Ticket application, which demonstrates the
integration of `ethers-svelte` and Web3 Onboard. The wallet configuration can be
found in the `wallet.js` file:

[https://github.com/TheRougeProject/ticket-dapp/blob/main/src/lib/wallet.js](https://github.com/TheRougeProject/ticket-dapp/blob/main/src/lib/wallet.js)

This example will help you understand how to use `ethers-svelte` in conjunction
with Web3 Onboard to build a seamless and user-friendly Ethereum application.
