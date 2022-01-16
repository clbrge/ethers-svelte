import { ethers, utils } from 'ethers'
import { proxied } from 'svelte-proxied-store'
import { derived } from 'svelte/store'

import chains from './chains.js'

/* eslint no-undef: "warn" */
const getGlobalObject = () => {
  if (typeof globalThis !== 'undefined') {
    return globalThis
  }
  if (typeof self !== 'undefined') {
    return self
  }
  if (typeof window !== 'undefined') {
    return window
  }
  if (typeof global !== 'undefined') {
    return global
  }
  throw new Error('[svelte-ethers-store] cannot find the global object')
}

const getWindowEthereum = () => {
  try {
    if (getGlobalObject().ethereum) return getGlobalObject().ethereum
  } catch (err) {
    console.error('[svelte-ethers-store] no globalThis.ethereum object')
  }
}

export const createStore = () => {
  const { emit, get, subscribe, assign, deleteAll } = proxied()

  const switch1193Provider = async ({
    chainId,
    signerAddress, // not used
    addressOrIndex = 0
  }) => {
    console.log(
      'switch1193Provider',
      { chainId, signerAddress },
      get('provider'),
      get('eipProvider')
    )
    if (!get('provider')) {
      console.log('lost connection')
      init()
      emit()
      return
    }
    if (!chainId) {
      chainId = (await get('provider').getNetwork()).chainId
    }
    const signer = get('provider').getSigner(addressOrIndex)
    try {
      signerAddress = await signer.getAddress()
    } catch (e) {
      console.warn(e)
    }
    assign({
      connected: true,
      chainId,
      signer,
      signerAddress
    })
    emit()
  }

  const accountsChangedHandler = accounts =>
    switch1193Provider({
      addressOrIndex:
        Array.isArray(accounts) && accounts.length ? accounts[0] : 0
    })
  const chainChangedHandler = chainId => switch1193Provider({ chainId })
  // TODO better error support ?
  const disconnectHandler = error => switch1193Provider({ error })

  const init = () => {
    if (get('eipProvider') && get('eipProvider').removeListener) {
      get('eipProvider').removeListener(
        'accountsChanged',
        accountsChangedHandler
      )
      get('eipProvider').removeListener('chainChanged', chainChangedHandler)
      get('eipProvider').removeListener('disconnect', disconnectHandler)
    }
    deleteAll()
    assign({
      connected: false,
      evmProviderType: ''
    })
  }

  const set1193Provider = async (eipProvider, addressOrIndex) => {
    init()
    let accounts
    try {
      accounts = await eipProvider.request({ method: 'eth_requestAccounts' })
    } catch (e) {
      console.warn('[svelte-ethers-store] non compliant 1193 provider')
      // some provider may store accounts directly like walletconnect
      accounts = eipProvider.accounts
    }
    if (addressOrIndex == null && Array.isArray(accounts) && accounts.length) {
      addressOrIndex = accounts[0]
    }
    const provider = new ethers.providers.Web3Provider(eipProvider)
    assign({
      provider,
      eipProvider,
      evmProviderType: 'EIP1193'
    })
    if (eipProvider.on) {
      // TODO handle disconnect/connect events
      eipProvider.on('accountsChanged', accountsChangedHandler)
      eipProvider.on('chainChanged', chainChangedHandler)
      eipProvider.on('disconnect', disconnectHandler)
    }
    return switch1193Provider({ addressOrIndex })
  }

  const setProvider = async (provider, addressOrIndex = 0) => {
    if (!provider) {
      if (!getWindowEthereum())
        throw new Error(
          '[svelte-ethers-store] Please authorize browser extension (Metamask or similar)'
        )
      getWindowEthereum().autoRefreshOnNetworkChange = false
      return set1193Provider(getWindowEthereum())
    }
    if (typeof provider === 'object' && provider.request)
      return set1193Provider(provider, addressOrIndex)
    init()
    if (
      typeof provider !== 'object' ||
      (!(
        Object.getPrototypeOf(provider) instanceof ethers.providers.BaseProvider
      ) &&
        !(
          Object.getPrototypeOf(provider) instanceof
          ethers.providers.UrlJsonRpcProvider
        ))
    ) {
      provider = new ethers.providers.JsonRpcProvider(provider)
    }
    const { chainId } = await provider.getNetwork()
    let signer, signerAddress
    // XXX some providers do not support getSigner
    try {
      if (typeof provider.listAccounts === 'function') {
        signer = provider.getSigner(addressOrIndex)
      } else {
        signer = provider.getSigner()
      }
      signerAddress = await signer.getAddress()
    } catch (e) {
      console.warn(e)
    }
    assign({
      signer,
      signerAddress,
      provider,
      connected: true,
      chainId,
      evmProviderType: provider.constructor.name
    })
    emit()
  }

  const setBrowserProvider = () => setProvider()

  const disconnect = async () => {
    init()
    emit()
  }

  return {
    setBrowserProvider,
    setProvider,
    disconnect,
    subscribe,
    get
  }
}

const allStores = {}

const noData = { rpc: [], faucets: [], nativeCurrency: {} }

const getData = id => {
  if (utils.isHexString(id)) id = parseInt(id, 16)
  for (const data of chains) {
    if (data.chainId === id) return data
  }
  return noData
}

const subStoreNames = [
  'connected',
  'provider',
  'chainId',
  'chainData',
  'signer',
  'signerAddress'
]

export const makeEvmStores = name => {
  const evmStore = (allStores[name] = createStore())

  allStores[name].connected = derived(
    evmStore,
    $evmStore => $evmStore.connected
  )

  allStores[name].provider = derived(evmStore, $evmStore => $evmStore.provider)
  allStores[name].chainId = derived(evmStore, $evmStore => $evmStore.chainId)
  allStores[name].chainData = derived(evmStore, $evmStore =>
    $evmStore.chainId ? getData($evmStore.chainId) : {}
  )

  allStores[name].signer = derived(evmStore, $evmStore => $evmStore.signer)
  allStores[name].signerAddress = derived(
    evmStore,
    $evmStore => $evmStore.signerAddress
  )

  allStores[name].evmProviderType = derived(
    evmStore,
    $evmStore => $evmStore.evmProviderType
  )

  return new Proxy(allStores[name], {
    get: function (internal, property) {
      if (/^\$/.test(property)) {
        // TODO forbid deconstruction !
        property = property.slice(1)
        if (subStoreNames.includes(property))
          return allStores[name].get(property)
        throw new Error(`[svelte-ethers-store] no store named ${property}`)
      }
      if (
        [
          'setBrowserProvider',
          'setProvider',
          'disconnect',
          ...subStoreNames
        ].includes(property)
      )
        return Reflect.get(internal, property)
      throw new Error(`[svelte-ethers-store] no store named ${property}`)
    }
  })
}

/*
TODO contract store
BaseContract BigNumber Contract ContractFactory FixedNumber Signer VoidSigner Wallet
Wordlist constants errors ethers getDefaultProvider logger providers utils version wordlists
*/

export const getChainStore = name => {
  if (!allStores[name])
    throw new Error(`[svelte-ethers-store] chain store ${name} does not exist`)
  return allStores[name]
}

export { chains as allChainsData }

export const defaultEvmStores = makeEvmStores('default')

export const connected = allStores.default.connected
export const provider = allStores.default.provider
export const chainId = allStores.default.chainId
export const signer = allStores.default.signer
export const signerAddress = allStores.default.signerAddress
export const evmProviderType = allStores.default.evmProviderType

export const chainData = allStores.default.chainData
