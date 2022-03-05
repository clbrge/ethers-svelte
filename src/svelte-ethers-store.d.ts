import type { Readable } from "svelte/store";
import type { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
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
    setProvider: (
        provider?: Provider,
        index?: string
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
 * You might want to access all chains CAIP-2 data directly without using the chainData store.
 * In this case, use the getter allChainsData, it returns the list of all CAIP-2 data available.
 */
export const allChainsData: ChainData[];
