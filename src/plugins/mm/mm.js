import detectEthereumProvider from '@metamask/detect-provider';
import appConfig from '../../../app.config.js';
import Web3 from 'web3';
import { store } from '@/store';
import { SET_ACCOUNT, SET_CHAIN_ID } from '@/plugins/mm/store.js';
import './mm.types.js';

const OPERA_CHAIN_ID = appConfig.chainId;

/** @type {MMChain} */
export const OPERA_MAINNET = {
    chainId: appConfig.mainnet.chainId,
    chainName: 'X1 Mainnet',
    nativeCurrency: {
        name: 'XN',
        symbol: 'XN',
        decimals: 18,
    },
    rpcUrls: [appConfig.mainnet.rpc],
    blockExplorerUrls: [appConfig.mainnet.explorerUrl],
};

/** @type {MMChain} */
export const OPERA_TESTNET = {
    chainId: appConfig.testnet.chainId,
    chainName: 'X1 Testnet',
    nativeCurrency: {
        name: 'XN',
        symbol: 'XN',
        decimals: 18,
    },
    rpcUrls: [appConfig.testnet.rpc],
    blockExplorerUrls: [appConfig.testnet.explorerUrl],
};

/** @type {MM} */
export let mm = null;

/**
 * Plugin for communication with MM.
 */
export class MM {
    /**
     * @param {Vue} _Vue
     */
    static install(_Vue) {
        if (!mm) {
            mm = new MM();
            _Vue.prototype.$mm = mm;
        }
    }

    constructor() {
        /**
         * MM provider.
         *
         * @type {null}
         * @private
         */
        this._provider = null;
        /** Signals, if MM is installed. */
        this._installed = false;
        this._initialized = false;
        this._web3 = null;

        this.init();
    }

    async init() {
        if (!this._initialized && !appConfig.isChromeExtension && window.ethereum) {
            await this._detectProvider();

            const provider = this._provider;

            if (provider) {
                this._web3 = new Web3(provider);

                provider.autoRefreshOnNetworkChange = false;
                provider.on('chainChanged', (_chainId) => {
                    this._onChainChange(_chainId);
                });
                provider.on('accountsChanged', (_account) => {
                    this._onAccountsChange(_account);
                });
                provider.on('disconnect', () => {
                    window.location.reload();
                });

                this._setChainId(provider.chainId);
                this._setAccount(await this.getAccounts());
            }
        }

        this._initialized = true;
    }

    /**
     * Signals, if MM is installed.
     *
     * @return {boolean}
     */
    isInstalled() {
        return this._installed;
    }

    /**
     * @return {boolean}
     */
    isCorrectChainId() {
        return this._provider && this._provider.chainId === OPERA_CHAIN_ID;
    }

    /**
     * @return {Promise<[]>}
     */
    async getAccounts() {
        let accounts = [];

        if (this._provider) {
            try {
                accounts = await this._provider.request({ method: 'eth_accounts' });
            } catch (_error) {
                console.error(_error);
            }
        }

        return accounts;
    }

    async requestAccounts() {
        if (this._provider) {
            try {
                return await this._provider.request({ method: 'eth_requestAccounts' });
            } catch (_error) {
                // userRejectedRequest error
                if (_error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    // If this happens, the user rejected the connection request.
                    console.log('Please connect to MetaMask.');
                } else {
                    console.error(_error);
                }
            }
        }
    }

    async signTransaction(_tx, _address) {
        if (this._provider) {
            try {
                _tx.from = _address;

                const txHash = await this._provider.request({
                    method: 'eth_sendTransaction',
                    params: [_tx],
                });

                return txHash;
            } catch (_error) {
                console.error(_error);
            }
        }
    }

    /**
     * @param {MMChain} _chain
     * @return {Promise<*>}
     */
    async addEthereumChain(_chain) {
        if (this._provider) {
            return await this._provider.request({
                method: 'wallet_addEthereumChain',
                params: [{ ..._chain }],
            });
        }
    }

    /**
     * @param {MMAsset} _asset
     * @return {Promise<*>}
     */
    async watchAsset(_asset) {
        if (this._provider) {
            return await this._provider.request({
                method: 'wallet_watchAsset',
                params: { ..._asset },
            });
        }
    }

    /**
     * @param {string} _chainId Hex number.
     * @private
     */
    _setChainId(_chainId) {
        store.commit(`mm/${SET_CHAIN_ID}`, _chainId);
    }

    /**
     * @param {string} _account
     * @private
     */
    _setAccount(_account) {
        store.commit(`mm/${SET_ACCOUNT}`, _account[0] || '');
    }

    /**
     * Called on chainId change.
     *
     * @param {string} _chainId Hex number.
     * @private
     */
    _onChainChange(_chainId) {
        this._setChainId(_chainId);
    }

    /**
     * Called on account change.
     *
     * @param {string} _account
     * @private
     */
    _onAccountsChange(_account) {
        this._setAccount(_account);
    }

    /**
     * Detect the MetaMask Ethereum provider.
     *
     * @private
     */
    async _detectProvider() {
        const provider = await detectEthereumProvider();

        if (provider) {
            if (provider === window.ethereum) {
                this._provider = provider;
                this._installed = true;
            } else {
                console.error('Do you have multiple wallets installed?');
            }
        }
    }
}
