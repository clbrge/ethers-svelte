import type { Readable } from "svelte/store";
import type { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Contract } from "@ethersproject/contracts";

/**
 * JavaScript CAIP-2 representation object.
 * @see https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
 */
export interface ChainData {
    name: string;
    chain: string;
    network: string;
    rpc: string[];
    faucets: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    infoURL: string;
    shortName: string;
    chainId: number;
    networkId: number;
    icon: string;
    explorers: {
        name: string;
        url: string;
        icon: string;
        standard: string;
    }[];
}

export interface DefaultEVMStore {
    /**
     * Forces a disconnect (and event subscriptions from a provider)
     */
    disconnect: () => Promise<void>;
    /**
     * Enables a connection with the current window provider.
     * Note that your code need to be in browser context when setProvider is running.
     * So you may want to use onMount when using Sapper or Sveltekit.
     * @param provider An url string or a valid provider object (as returned by web3Modal or WalletConnect for example)
     * @param index Select another account than the default when possible.
     */
    setProvider: (provider?: Provider, index?: string) => Promise<void>;
    /**
     * To enjoy the same reactivity as using `$provider` and `$signer` but with a contract instance, you first need to declare its address and interface.
     * To differentiate each `ethers.Contract` instance, you also need to define a logical name.
     *
     * This function only needs to be called once and can be called before connection since `ethers.Contract` instances will only be created when a connection becomes available.
     * You may want to reattach new contract definition or abi for example when you the current network change.
     * For the old definition will be overwritten and instance updated in the contracts store, simply use the same logical name.
     *
     * @param name The logical name of the contract
     * @param address The address of the contract
     * @param abi The ABI of the contract
     * @param fromSigner By default, svelte-ethers-store build contract instances using the signer if available and if not the provider. You may want to force using the current provider by passing `false`.
     */
    attachContract: (
        name: string,
        address: string,
        abi: string,
        fromSigner?: boolean
    ) => Promise<void>;
    /**
     * A stored Ethers.js Provider instance when connected.
     */
    provider: Readable<Provider>;
    /**
     * A stored Ethers.js Signer instance when connected.
     */
    signer: Readable<Signer>;
    /**
     * Current selected account address if connected, `null` otherwise.
     */
    selectedAccount: Readable<string | null>;
    /**
     * `true` if connection to the provider was successful.
     */
    connected: Readable<boolean>;
    /**
     * The current chainId (if connected).
     */
    chainId: Readable<number | string>;
    /**
     * Store value is a shortcut to get `$signer.getAddress()` when connected.
     */
    signerAddress: Readable<string>;
}

/**
 * The main connection helper and derived Svelte stores
 */
export const defaultEvmStores: DefaultEVMStore;
/**
 * `true` if connection to the provider was successful for `defaultEvmStores`.
 */
export const connected: DefaultEVMStore["connected"];
/**
 * The current chainId of `defaultEvmStores` if connected.
 */
export const chainId: DefaultEVMStore["chainId"];
/**
 * Store value is a shortcut to get `$signer.getAddress()` when connected.
 */
export const signerAddress: DefaultEVMStore["signerAddress"];
/**
 * A stored Ethers.js Provider instance when connected.
 */
export const provider: DefaultEVMStore["provider"];
/**
 * A stored Ethers.js Signer instance when connected.
 */
export const signer: DefaultEVMStore["signer"];
/**
 * Current selected account address if connected, `null` otherwise.
 */
export const selectedAccount: DefaultEVMStore["selectedAccount"];
/**
 * After a contract as be declared, you can use its instance anywhere using the $ notation and the logical name that was declared in `attachContract()`
 */
export const contracts: Readable<Record<string, Contract>>;

/**
 * You might want to access all chains CAIP-2 data directly without using the chainData store.
 * In this case, use the getter allChainsData, it returns the list of all CAIP-2 data available.
 */
export const allChainsData: ChainData[];
