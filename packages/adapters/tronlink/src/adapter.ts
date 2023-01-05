import {
    Adapter,
    AdapterState,
    isInBrowser,
    checkAdapterState,
    isInMobileBrowser,
} from '@tronweb3/tronwallet-abstract-adapter';
import {
    WalletNotFoundError,
    WalletDisconnectedError,
    WalletConnectionError,
    WalletSignTransactionError,
    WalletSwitchChainError,
} from '@tronweb3/tronwallet-abstract-adapter';
import type { Transaction, SignedTransaction, AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import type {
    AccountsChangedEventData,
    NetworkChangedEventData,
    ReqestAccountsResponse,
    Tron,
    TronAccountsChangedCallback,
    TronChainChangedCallback,
    TronLinkMessageEvent,
    TronWeb,
} from './types.js';
export interface TronLinkWallet {
    ready: boolean;
    tronWeb: TronWeb;
    request(config: Record<string, unknown>): Promise<ReqestAccountsResponse | null>;
}
export function isFireFox() {
    return isInBrowser() && typeof (window as any).InstallTrigger !== 'undefined';
}
/**
 * Detect if in TronLinkApp
 * Tron DApp running in the DApp Explorer injects iTron objects automatically to offer customized App service.
 * See [here](https://docs.tronlink.org/tronlink-app/dapp-support/dapp-explorer)
 */
export function isInTronLinkApp() {
    return isInBrowser() && typeof (window as any).iTron !== 'undefined';
}

export function openTronLink(
    { dappIcon, dappName }: { dappIcon: string; dappName: string } = { dappIcon: '', dappName: '' }
) {
    if (isInMobileBrowser() && !isInTronLinkApp()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + (hash.includes('?') ? hash : `${hash}?_=1`);
        const params = {
            action: 'open',
            actionId: Date.now() + '',
            callbackUrl: 'http://someurl.com', // no need callback
            dappIcon,
            dappName,
            url,
            protocol: 'TronLink',
            version: '1.0',
            chainId: '0x2b6653dc',
        };
        window.location.href = `tronlinkoutside://pull.activity?param=${encodeURIComponent(JSON.stringify(params))}`;
        return true;
    }
    return false;
}

declare global {
    interface Window {
        tronLink?: TronLinkWallet;
        tronWeb?: TronWeb;
        tron?: Tron;
    }
}
export interface TronLinkAdapterConfig {
    /**
     * The icon of your dapp. Used when open TronLink app in mobile device browsers.
     */
    dappIcon?: string;
    /**
     * The name of your dapp. Used when open TronLink app in mobile device browsers.
     */
    dappName?: string;
}

export const TronLinkAdapterName = 'TronLink' as AdapterName<'TronLink'>;

export class TronLinkAdapter extends Adapter {
    name = TronLinkAdapterName;
    url = 'https://www.tronlink.org/';
    icon =
        'data:image/png;base64,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';

    config: TronLinkAdapterConfig;
    private _state: AdapterState = AdapterState.NotFound;
    private _connecting: boolean;
    private _wallet: TronLinkWallet | Tron | null;
    private _address: string | null;
    private _supportTronLink = false;
    // https://github.com/tronprotocol/tips/blob/master/tip-1193.md
    private _supportNewTronProtocol = false;

    constructor(config: TronLinkAdapterConfig = {}) {
        super();
        this.config = config;
        this._connecting = false;
        this._wallet = null;
        this._address = null;

        const check = () => {
            if (window.tron) {
                this._supportTronLink = true;
                this._supportNewTronProtocol = true;
                this._wallet = window.tron;
                if (this._wallet.tronWeb && this._wallet.tronWeb.defaultAddress?.base58) {
                    // now is connected
                    this._state = AdapterState.Connected;
                    this._address = this._wallet.tronWeb.defaultAddress?.base58 || '';
                    this._listenTronEvent();
                } else {
                    this._state = AdapterState.Disconnect;
                }
                this.emit('stateChanged', this._state);
                return true;
            } else if (window.tronLink) {
                this._supportTronLink = true;
                this._wallet = window.tronLink;
                this._listenTronLink();
                if (this._wallet.ready === true) {
                    // if dapp has connected to tronlink,
                    // then TronLink is connected automatically when reload the dapp
                    this._address = this._wallet.tronWeb.defaultAddress?.base58 || '';
                    this._state = AdapterState.Connected;
                    this.emit('connect', this._address);
                } else {
                    this._state = AdapterState.Disconnect;
                }
                this.emit('stateChanged', this._state);
                return true;
            } else if (window.tronWeb) {
                // fake tronLink
                this._wallet = {
                    ready: true,
                    tronWeb: window.tronWeb,
                    request: () => Promise.resolve(true) as any,
                } as TronLinkWallet;
                if (window.tronWeb.ready) {
                    this._address = this._wallet.tronWeb.defaultAddress?.base58 || '';
                    this._state = AdapterState.Connected;
                } else {
                    this._wallet.ready = false;
                    this._state = AdapterState.Disconnect;
                }
                this.emit('stateChanged', this._state);
                return true;
            }
            return false;
        };
        if (isInBrowser()) {
            check();
            // `window.tronLink.ready` is false even when dom loaded
            // so delay the check function
            setTimeout(() => checkAdapterState(check), 200);
        }
    }

    get address() {
        return this._address;
    }

    get state() {
        return this._state;
    }

    get connecting() {
        return this._connecting;
    }

    async connect(): Promise<void> {
        try {
            this.checkIfOpenTronLink();
            if (this.connected || this.connecting) return;
            if (this.state === AdapterState.NotFound) {
                isInBrowser() && window.open(this.url, '_blank');
                throw new WalletNotFoundError();
            }
            // lower version only support window.tronWeb, no window.tronLink
            if (!this._wallet || !this._supportTronLink) return;
            this._connecting = true;
            if (this._supportNewTronProtocol) {
                const wallet = this._wallet as Tron;
                try {
                    const res = await wallet.request({ method: 'eth_requestAccounts' });
                    this._address = res[0];
                    this._state = AdapterState.Connected;
                    this._listenTronEvent();
                } catch (error: any) {
                    let message = error?.message || 'Connect TronLink wallet failed.';
                    if (error.code === -32002) {
                        message =
                            'The same DApp has already initiated a request to connect to TronLink wallet, and the pop-up window has not been closed.';
                    }
                    if (error.code === 4001) {
                        message = 'The user rejected connection.';
                    }
                    throw new WalletConnectionError(message, error);
                }
            } else {
                const wallet = this._wallet as TronLinkWallet;
                try {
                    const res = await wallet.request({ method: 'tron_requestAccounts' });
                    if (!res) {
                        // 1. wallet is locked
                        // 2. tronlink is first installed and there is no wallet account
                        throw new WalletConnectionError('TronLink wallet is locked or no wallet account is avaliable.');
                    }
                    if (res.code === 4000) {
                        throw new WalletConnectionError(
                            'The same DApp has already initiated a request to connect to TronLink wallet, and the pop-up window has not been closed.'
                        );
                    }
                    if (res.code === 4001) {
                        throw new WalletConnectionError('The user rejected connection.');
                    }
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }

                this._address = wallet.tronWeb.defaultAddress?.base58 || '';
                this._state = AdapterState.Connected;

                this._listenTronLink();
            }
            this.emit('stateChanged', this._state);
            this.emit('connect', this._address);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.state === AdapterState.NotFound) {
            return;
        }
        if (this._supportNewTronProtocol) {
            this._onDisconnect();
        } else {
            this._state = AdapterState.Disconnect;
            this.emit('disconnect');
            this.emit('stateChanged', this._state);
        }
    }

    async signTransaction(transaction: Transaction, privateKey?: string): Promise<SignedTransaction> {
        try {
            this.checkIfOpenTronLink();
            if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
            const wallet = this._wallet;
            if (!wallet) throw new WalletDisconnectedError();

            try {
                return await wallet.tronWeb.trx.sign(transaction, privateKey);
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new WalletSignTransactionError(error.message, error);
                } else {
                    throw new WalletSignTransactionError(error, new Error(error));
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: string, privateKey?: string): Promise<string> {
        try {
            this.checkIfOpenTronLink();
            if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
            const wallet = this._wallet;
            if (!wallet) throw new WalletDisconnectedError();

            try {
                return await wallet.tronWeb.trx.signMessageV2(message, privateKey);
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new WalletSignTransactionError(error.message, error);
                } else {
                    throw new WalletSignTransactionError(error, new Error(error));
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async switchChain(chainId: string) {
        if (this.state === AdapterState.NotFound) {
            isInBrowser() && window.open(this.url, '_blank');
            throw new WalletNotFoundError();
        }
        if (!this._supportNewTronProtocol) {
            throw new WalletSwitchChainError('The operation is not supported.');
        }
        const wallet = this._wallet as Tron;
        try {
            await wallet.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (e: any) {
            throw new WalletSwitchChainError(e.message, e);
        }
    }

    private _listenTronLink() {
        window.addEventListener('message', this._tronLinkMessageHandler);
    }
    private _stopListenTronLink() {
        window.removeEventListener('message', this._tronLinkMessageHandler);
    }
    private _tronLinkMessageHandler = (e: TronLinkMessageEvent) => {
        const message = e.data?.message;
        if (!message) {
            return;
        }
        if (message.action === 'accountsChanged') {
            setTimeout(() => {
                this._address = (message.data as AccountsChangedEventData).address;
                this.emit('accountsChanged', this._address);
                if ((this._wallet as TronLinkWallet)?.ready) {
                    this._state = AdapterState.Connected;
                    this.emit('connect', this._address as string);
                } else {
                    this._state = AdapterState.Disconnect;
                    this.emit('disconnect');
                }
                this.emit('stateChanged', this._state);
            }, 200);
        } else if (message.action === 'setNode') {
            this.emit('chainChanged', { chainId: (message.data as NetworkChangedEventData)?.node?.chainId || '' });
        } else if (message.action === 'connect') {
            // connect event is emitted in `connect()` method
        } else if (message.action === 'disconnect') {
            this._state = AdapterState.Disconnect;
            this._stopListenTronLink();
            this.emit('disconnect');
            this.emit('stateChanged', this._state);
        }
    };

    private checkIfOpenTronLink() {
        const { dappName = '', dappIcon = '' } = this.config;
        if (openTronLink({ dappIcon, dappName })) {
            throw new WalletNotFoundError();
        }
    }

    // following code is for TIP-1193
    private _listenTronEvent() {
        const wallet = this._wallet as Tron;
        wallet.on('connect', this._onConnect);
        wallet.on('chainChanged', this._onChainChanged);
        wallet.on('accountsChanged', this._onAccountsChanged);
        wallet.on('disconnect', this._onDisconnect);
    }
    private _onConnect = () => {
        const wallet = this._wallet as Tron;
        this._address = wallet.tronWeb.defaultAddress?.base58 || '';
        this._state = AdapterState.Connected;
        this.emit('connect', this._address);
        this.emit('stateChanged', this._state);
    };
    private _onChainChanged: TronChainChangedCallback = (data) => {
        this.emit('chainChanged', data);
    };
    private _onAccountsChanged: TronAccountsChangedCallback = (data) => {
        if (data.length === 0) {
            // change to a new address and it's disconnected, data will be empty
            this._onDisconnect();
        } else {
            this._address = data[0] as string;
        }
        this.emit('accountsChanged', this._address || '');
    };
    private _onDisconnect = () => {
        const wallet = this._wallet as Tron;
        this._state = AdapterState.Disconnect;
        this._address = null;
        wallet.removeListener('connect', this._onConnect);
        wallet.removeListener('chainChanged', this._onChainChanged);
        wallet.removeListener('accountsChanged', this._onAccountsChanged);
        wallet.removeListener('disconnect', this._onDisconnect);
        this.emit('disconnect');
        this.emit('stateChanged', this._state);
    };
}
