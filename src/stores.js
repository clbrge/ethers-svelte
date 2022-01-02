
import { ethers, version, utils } from 'ethers'
import { proxied } from 'svelte-proxied-store'
import { derived } from 'svelte/store'

import chains from './chains.js'

const getGlobalObject = () => {
  if (typeof globalThis !== 'undefined') { return globalThis }
  if (typeof self !== 'undefined') { return self }
  if (typeof window !== 'undefined') { return window }
  if (typeof global !== 'undefined') { return global }
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

  const init = () => {
    if (get('eipProvider') && get('eipProvider').removeListener) {
      get('eipProvider').removeListener('accountsChanged', () => switch1193Provider())
      get('eipProvider').removeListener('chainChanged', () => switch1193Provider())
    }
    deleteAll()
    assign({
      connected: false,
      evmProviderType: '',
    })
  }

  const switch1193Provider = async accounts => {
    const { name, chainId } = await get('provider').getNetwork()
    if (!accounts) {
      // TODO better tests
      accounts = await get('eipProvider').request({ method: 'eth_requestAccounts' })
    }
    const signer = get('provider').getSigner()
    assign({
      connected: true,
      signer,
      chainId,
      accounts
    })
    emit()
  }

  const set1193Provider = async eipProvider => {
    init()
    const accounts = await eipProvider.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.providers.Web3Provider(eipProvider)
    assign({
      provider,
      eipProvider,
      evmProviderType: 'EIP1193',
      accounts
    })
    if (eipProvider.on) {
      // TODO handle disconnect/connect events
      eipProvider.on('accountsChanged', () => switch1193Provider())
      eipProvider.on('chainChanged', () => switch1193Provider())
    }
    return switch1193Provider(accounts)
  }

  const setProvider = async (provider, addressOrIndex = 0) => {
    if (!provider) {
      if (!getWindowEthereum()) throw new Error('[svelte-ethers-store] Please authorize browser extension (Metamask or similar)')
      getWindowEthereum().autoRefreshOnNetworkChange = false
      return set1193Provider(getWindowEthereum())
    }
    if (typeof provider === 'object' && provider.request) return set1193Provider(provider)
    init()
    if (typeof provider !== 'object'
        || (!Object.getPrototypeOf(provider) instanceof ethers.providers.BaseProvider
            && !Object.getPrototypeOf(provider) instanceof ethers.providers.UrlJsonRpcProvider)) {
      provider = new ethers.providers.JsonRpcProvider(provider)
    }
    const { name, chainId } = await provider.getNetwork()
    let signer
    // some providers do not support getSigner
    try {
      if (typeof provider.listAccounts === 'function') {
        // const accounts = (await provider.listAccounts()) || []
        // check account ?
        signer = provider.getSigner(addressOrIndex)
      } else {
        signer = provider.getSigner()
      }
    } catch(e) {
      console.warn(e)
    }
    assign({
      signer,
      provider,
      connected: true,
      chainId,
      evmProviderType: provider.constructor.name,
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

const subStoreNames = [ 'connected', 'chainId', 'provider', 'signer', 'chainData' ]

export const makeEvmStores = name => {

  const evmStore = allStores[name] = createStore()

  allStores[name].provider = derived(evmStore, $evmStore => $evmStore.provider)
  allStores[name].signer = derived(evmStore, $evmStore => $evmStore.signer)

  allStores[name].connected = derived(evmStore, $evmStore => $evmStore.connected)
  allStores[name].chainId = derived(evmStore, $evmStore => $evmStore.chainId)
  allStores[name].chainData = derived(
    evmStore,
    $evmStore => $evmStore.chainId ? getData($evmStore.chainId) : {}
  )

  allStores[name].evmProviderType = derived(evmStore, $evmStore => $evmStore.evmProviderType)

  return new Proxy(allStores[name], {
    get: function (internal, property) {
      if (/^\$/.test(property)) {
        // TODO forbid deconstruction !
        property = property.slice(1)
        if (subStoreNames.includes(property)) return allStores[name].get(property)
        throw new Error(`[svelte-ethers-store] no store named ${property}`)
      }
      if (['setBrowserProvider', 'setProvider', 'disconnect', ...subStoreNames].includes(property))
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


export { chains as allChainsData }

export const defaultEvmStores = makeEvmStores('default')

export const connected = allStores.default.connected
export const chainId = allStores.default.chainId
export const evmProviderType = allStores.default.evmProviderType
export const provider = allStores.default.provider
export const signer = allStores.default.signer

export const chainData = allStores.default.chainData
