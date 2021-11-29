
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
  throw new Error('cannot find the global object')
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
    if (getWindowEthereum()) getWindowEthereum().autoRefreshOnNetworkChange = false
    assign({
      connected: false,
      accounts: []
    })
  }

  const setProvider = async (evmProvider, callback) => {
    init()
    const provider = typeof evmProvider === 'string'
          ? new ethers.providers.JsonRpcProvider(evmProvider)
          : new ethers.providers.Web3Provider(evmProvider)
    const { name, chainId } = await provider.getNetwork()
    const signer = provider.getSigner()
    /*
    if (callback) {
      instance._provider.removeListener('accountsChanged', () => setProvider(provider, true))
      instance._provider.removeListener('chainChanged', () =>  setProvider(provider, true))
    } else {
      if (instance._provider && instance._provider.on) {
        instance._provider.on('accountsChanged', () => setProvider(provider, true))
        instance._provider.on('chainChanged', () => setProvider(provider, true))
      }
    }
    */
    assign({
      signer,
      provider,
      evmProviderType: typeof evmProvider === 'string' ? 'RPC' : 'Web3',
      evmProvider: getWindowEthereum(),
      connected: true,
      chainId,
      //accounts,
    })
    emit()
  }

  const setBrowserProvider = async () => {
    init()
    if (!getWindowEthereum()) throw new Error('Please autorized browser extension (Metamask or similar)')
    const res = await getWindowEthereum().request({ method: 'eth_requestAccounts' })
    getWindowEthereum().on('accountsChanged', setBrowserProvider)
    getWindowEthereum().on('chainChanged', setBrowserProvider)
    const provider = new ethers.providers.Web3Provider(getWindowEthereum())
    const signer = provider.getSigner()

    const { name, chainId } = await provider.getNetwork()
    assign({
      signer,
      provider,
      evmProviderType: 'Browser',
      evmProvider: getWindowEthereum(),
      connected: true,
      chainId,
      accounts: res,
    })
    emit()
  }

  const close = async () => {
    const provider = get('provider')
    provider.removeAllListeners()
    deleteAll()
    init()
    emit()
  }

  return {
    setBrowserProvider,
    setProvider,
    subscribe,
    close
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

export const makeEvmStore = name => {

  const evmStore = allStores[name] = createStore()

  allStores[name].connected = derived(evmStore, $evmStore => $evmStore.connected)
  allStores[name].chainId = derived(evmStore, $evmStore => $evmStore.chainId)
  allStores[name].evmProviderType = derived(evmStore, $evmStore => $evmStore.evmProviderType)

  allStores[name].provider = derived(
    evmStore,
    $evmStore => {
      // if not defined return proxy
      if (!$evmStore.provider) return { getBlockNumber: () => null }
      return $evmStore.provider
    }
  )

  allStores[name].signer = derived(
    evmStore,
    $evmStore => {
      // if not defined return proxy
      if (!$evmStore.signer) return { getAddress: () => null }
      return $evmStore.signer
    }
  )

  allStores[name].chainData = derived(
    evmStore,
    $evmStore => $evmStore.chainId ? getData($evmStore.chainId) : {}
  )

  return allStores[name]
}

export const defaultEvmStore = makeEvmStore('default')

export const connected = allStores.default.connected
export const provider = allStores.default.provider
export const signer = allStores.default.signer
export const chainId = allStores.default.chainId
export const chainData = allStores.default.chainData
