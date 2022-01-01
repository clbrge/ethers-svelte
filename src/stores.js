
import { ethers, version, utils } from 'ethers'
import { proxied } from 'svelte-proxied-store'
import { derived } from 'svelte/store'

/*
BaseContract BigNumber Contract ContractFactory FixedNumber Signer VoidSigner Wallet
Wordlist constants errors ethers getDefaultProvider logger providers utils version wordlists
*/

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
    console.error('no globalThis.ethereum object')
  }
}

export const createStore = () => {

  const { emit, get, subscribe, assign, deleteAll } = proxied()

  const init = () => {
    deleteAll()
    assign({
      connected: false,
      evmProviderType: '',
      account: null,
    })
  }

  const setProvider = async (provider, addressOrIndex = 0) => {
    init()
    if (typeof provider !== 'object'
        || (!Object.getPrototypeOf(provider) instanceof ethers.providers.BaseProvider
            && !Object.getPrototypeOf(provider) instanceof ethers.providers.UrlJsonRpcProvider)) {
      // todo autodetect web3 provider ?
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
      // evmProvider
      evmProviderType: provider.constructor.name
    })
    emit()
  }

  // todo generic EIP-1193 Provider handling

  const setBrowserProvider = async () => {
    init()
    if (!getWindowEthereum()) throw new Error('[svelte-ethers-store] Please authorize browser extension (Metamask or similar)')
    getWindowEthereum().autoRefreshOnNetworkChange = false
    const res = await getWindowEthereum().request({ method: 'eth_requestAccounts' })
    getWindowEthereum().on('accountsChanged', setBrowserProvider)
    getWindowEthereum().on('chainChanged', setBrowserProvider)
    const provider = new ethers.providers.Web3Provider(getWindowEthereum())
    const signer = provider.getSigner()
    const { name, chainId } = await provider.getNetwork()
    assign({
      signer,
      provider,
      connected: true,
      chainId,
      evmProvider: getWindowEthereum(),
      evmProviderType: 'Browser',
    })
    emit()
  }

  const disconnect = async () => {
    const provider = get('provider')
    provider.removeAllListeners()
    if (get('evmProviderType') === 'Browser') {
      getWindowEthereum().removeListener('accountsChanged', setBrowserProvider)
      getWindowEthereum().removeListener('chainChanged', setBrowserProvider)
    }
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

export { chains as allChainsData }

export const defaultEvmStores = makeEvmStores('default')

export const connected = allStores.default.connected
export const chainId = allStores.default.chainId
export const evmProviderType = allStores.default.evmProviderType
export const provider = allStores.default.provider
export const signer = allStores.default.signer

export const chainData = allStores.default.chainData
