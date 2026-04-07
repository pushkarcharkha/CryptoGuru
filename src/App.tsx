import { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatPanel from './components/ChatPanel';
import RightPanel from './components/RightPanel';
import SignalFeed from './components/SignalFeed';
import SettingsModal from './components/SettingsModal';
import ExchangeModal from './components/ExchangeModal';
import { useGroqChat } from './hooks/useGroqChat';
import { useWallet, TOKEN_ADDRESSES } from './hooks/useWallet';
import { useCryptoPrices } from './hooks/useCrypto';
import { useContacts } from './hooks/useContacts';
import { usePancakeSwap, BNB_TOKENS, WBNB } from './hooks/usePancakeSwap';
import { useTransactionHistory } from './hooks/useTransactionHistory';
import { useWatchlist } from './hooks/useWatchlist';
import { useNews } from './hooks/useNews';
import { useFutures, SUPPORTED_FUTURES_COINS } from './hooks/useFutures';
import ChartModal from './components/ChartModal';
import { TechnicalAnalysisChart } from './components/TechnicalAnalysisChart';
import { WalletConnectAnimation } from './components/WalletConnectAnimation';
import type { RightPanelView, SidebarFeature, TraderSignal, TransactionPreview, SwapPreview, CoinGeckoCoin } from './types';
import { ethers } from 'ethers';
import { UpgradeModal } from './components/UpgradeModal';
import { supabase } from './lib/supabase';

let chartAnalysisInProgress = false;

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'agent' | 'signals'>('agent');
    const [mobileView, setMobileView] = useState<'chat' | 'panel'>('chat');
    const [rightPanelView, setRightPanelView] = useState<RightPanelView>('prices');
    const [activeFeature, setActiveFeature] = useState<SidebarFeature | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '');
    const [activeCoin, setActiveCoin] = useState<CoinGeckoCoin | null>(null);
    const [chartShouldAnalyze, setChartShouldAnalyze] = useState(false);
    const [transactionPreview, setTransactionPreview] = useState<TransactionPreview | null>(null);
    const [swapPreview, setSwapPreview] = useState<SwapPreview | null>(null);
    const [watchlistCoin, setWatchlistCoin] = useState<CoinGeckoCoin | null>(null);
    const [manualPanelOverride, setManualPanelOverride] = useState<RightPanelView | null>(null);
    const [exchangeOpen, setExchangeOpen] = useState(false);
    const [pendingFuturesPosition, setPendingFuturesPosition] = useState<any | null>(null);

    const [showScanline, setShowScanline] = useState(true);
    const [showWalletAnim, setShowWalletAnim] = useState(false);
    const prevWalletConnected = useRef(false);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [userData, setUserData] = useState<{ id: string, email: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserData({ id: user.id, email: user.email || '' });
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowScanline(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Use ref to break circular dependency with useGroqChat
    const addSystemMessageRef = useRef<((content: string) => void) | null>(null);
    const addSystemMessageProxy = useCallback((content: string) => {
        addSystemMessageRef.current?.(content);
    }, []);

    const { wallet, connectWallet, switchNetwork, refreshBalances, getExplorerUrl, formatAddress } = useWallet();

    useEffect(() => {
        if (wallet.isConnected && !prevWalletConnected.current) {
            setShowWalletAnim(true);
            setTimeout(() => setShowWalletAnim(false), 2300);
        }
        prevWalletConnected.current = wallet.isConnected;
    }, [wallet.isConnected]);

    const { contacts, addContact, removeContact } = useContacts();
    const { history, saveTransaction } = useTransactionHistory();
    const { getSwapQuote, approveToken } = usePancakeSwap();
    const { allCoins, watchlistCoins, watchlistIds, loading: watchlistLoading, lastUpdated: watchlistLastUpdated, toggleWatchlist, isInWatchlist } = useWatchlist();

    const {
        newsData,
        fearGreedData,
        isLoading: newsLoading,
        error: newsError,
        lastUpdated: newsLastUpdated
    } = useNews();

    const { prices, isLoading: pricesLoading } = useCryptoPrices(['bitcoin', 'ethereum', 'solana', 'cardano', 'chainlink', 'binancecoin', 'matic-network', 'avalanche-2', 'tether', 'usd-coin', 'ripple', 'polkadot']);

    const futuresPricesMap = prices ? Object.fromEntries(prices.map(p => [p.id, { usd: p.price }])) : null;
    const { positions: futuresPositions, balance: futuresBalance, openPosition, closePosition, getLivePnL } = useFutures(futuresPricesMap);

    // Helper for auto-switching panels that respects manual overrides
    const setPanelSafe = useCallback((panel: RightPanelView) => {
        if (manualPanelOverride) return;
        setRightPanelView(panel);
    }, [manualPanelOverride]);

    // Define action handler for the AI
    const handleAIAction = useCallback(async (action: string, params: Record<string, string>) => {
        if (action === 'SEND') {
            const { amount, coin, address, name } = params;
            if (amount && coin && address && name) {
                const gasMap: Record<string, string> = {
                    'BNB Smart Chain': '< $0.05',
                    'Polygon Mainnet': '< $0.05',
                    'Ethereum Mainnet': '$2 - $10'
                };
                const estGas = gasMap[wallet.networkName || ''] || 'Low';

                setTransactionPreview({
                    recipientName: name,
                    address,
                    amount,
                    coin: coin.toUpperCase(),
                    estimatedGas: estGas,
                    networkName: wallet.networkName || 'Unknown Network'
                });
                setRightPanelView('transaction');
                setManualPanelOverride('transaction');
            }
        } else if (action === 'SWAP') {
            const { fromToken, toToken, amount } = params;
            if (fromToken && toToken && amount && wallet.address) {
                try {
                    const fromAddr = BNB_TOKENS[fromToken.toUpperCase()] || fromToken;
                    const toAddr = BNB_TOKENS[toToken.toUpperCase()] || toToken;

                    addSystemMessageProxy(`Fetching PancakeSwap quote for **${amount} ${fromToken}**...`);

                    const decimals = 18;
                    const amountWei = ethers.parseUnits(amount, decimals).toString();

                    const estimatedOutputWei = await getSwapQuote(fromAddr, toAddr, amountWei);
                    const estimatedOutput = ethers.formatUnits(estimatedOutputWei, decimals);

                    setSwapPreview({
                        fromToken: fromToken.toUpperCase(),
                        fromTokenAddress: fromAddr,
                        fromAmount: amount,
                        toToken: toToken.toUpperCase(),
                        toTokenAddress: toAddr,
                        toAmount: estimatedOutput,
                        rate: `1 ${fromToken.toUpperCase()} = ${(parseFloat(estimatedOutput) / parseFloat(amount)).toFixed(6)} ${toToken.toUpperCase()}`,
                        estimatedGas: `< $0.15`,
                        slippage: 1,
                        rawSwapData: { amountWei, estimatedOutputWei: estimatedOutputWei.toString() }
                    });
                    setRightPanelView('swap');
                    setManualPanelOverride('swap');
                    setMobileView('panel');
                    addSystemMessageProxy(`Quote received! You'll get approx **${parseFloat(estimatedOutput).toFixed(4)} ${toToken.toUpperCase()}**. Review and confirm on the right.`);
                } catch (err: any) {
                    addSystemMessageProxy(`Swap Error: ${err.message}`);
                }
            }
        } else if (action === 'ADD_CONTACT') {
            const { name, address } = params;
            if (name && address) {
                addContact(name, address);
            }
        } else if (action === 'WATCHLIST_ADD') {
            const { coinId } = params;
            if (coinId) {
                toggleWatchlist(coinId);
                addSystemMessageProxy(`Added **${coinId}** to your watchlist.`);
            }
        } else if (action === 'WATCHLIST_REMOVE') {
            const { coinId } = params;
            if (coinId) {
                toggleWatchlist(coinId);
                addSystemMessageProxy(`Removed **${coinId}** from your watchlist.`);
            }
        } else if (action === 'ANALYZE_CHART') {
            const coinId = params.coinId || 'bitcoin';
            const coin = allCoins.find(c => c.id === coinId || c.symbol === coinId.toLowerCase());
            if (coin) {
                setActiveCoin(coin);
                setChartShouldAnalyze(true);
                setRightPanelView('coin-chart');
                setManualPanelOverride('coin-chart');
                setMobileView('panel');
                addSystemMessageProxy(`Analyzing **${coin.name}** chart...`);
            } else {
                addSystemMessageProxy(`Sorry, I couldn't find a chart for **${coinId}** to analyze.`);
            }
        } else if (action === 'SHOW_CHART') {
            const { coinId } = params;
            if (coinId) {
                const coin = allCoins.find(c => c.id === coinId || c.symbol === coinId.toLowerCase());
                if (coin) {
                    setActiveCoin(coin);
                    setChartShouldAnalyze(false);
                    setRightPanelView('coin-chart');
                    setManualPanelOverride('coin-chart');
                    setMobileView('panel');
                    addSystemMessageProxy(`Opening **${coin.name}** chart...`);
                } else {
                    addSystemMessageProxy(`Sorry, I couldn't find a chart for **${coinId}**.`);
                }
            }
        } else if (action === 'NAVIGATE') {
            const { view } = params;
            if (view === 'watchlist') {
                setPanelSafe('watchlist');
                setMobileView('panel');
                addSystemMessageProxy(`Opening your watchlist.`);
            }
        } else if (action === 'SHOW_NEWS') {
            setRightPanelView('news-sentiment');
            setManualPanelOverride('news-sentiment'); // Hard override when showing news
            setMobileView('panel');
            addSystemMessageProxy(`Opening Market News & Sentiment...`);
        } else if (action === 'FUTURES_OPEN') {
            const { coin, direction, leverage, size } = params;
            if (coin && direction && leverage && size && prices) {
                try {
                    const coinUpper = coin.toUpperCase();
                    const coinId = SUPPORTED_FUTURES_COINS[coinUpper] || allCoins.find(c => c.symbol.toUpperCase() === coinUpper || c.id === coin.toLowerCase())?.id;
                    if (!coinId) throw new Error(`Coin ${coin} is not supported.`);
                    
                    const currentPrice = prices.find(p => p.id === coinId)?.price;
                    if (!currentPrice || currentPrice === 0) {
                        addSystemMessageProxy(`Can't get live price for ${coin} right now. Try again in a moment.`);
                        return;
                    }

                    const lev = parseInt(leverage);
                    const parsedSize = parseFloat(size);
                    const margin = parsedSize / lev;
                    const liquidationPrice = direction.toLowerCase() === 'long'
                      ? currentPrice * (1 - 1/lev)
                      : currentPrice * (1 + 1/lev);

                    setPendingFuturesPosition({
                        coin: coin.toUpperCase(),
                        direction: direction.toLowerCase(),
                        leverage: lev,
                        size: parsedSize,
                        entryPrice: currentPrice,
                        margin: margin.toFixed(2),
                        liquidationPrice: liquidationPrice.toFixed(2)
                    });
                    
                    setRightPanelView('futures-confirm');
                    setManualPanelOverride('futures-confirm');
                    setMobileView('panel');
                } catch (err: any) {
                    addSystemMessageProxy(`Failed to preview position: ${err.message}`);
                }
            }
        } else if (action === 'FUTURES_CLOSE') {
            const { positionId } = params;
            if (positionId && prices) {
                const id = parseInt(positionId);
                const pos = futuresPositions.find(p => p.id === id);
                if (pos) {
                    const coinId = SUPPORTED_FUTURES_COINS[pos.coin.toUpperCase()];
                    const currentPrice = prices.find(p => p.id === coinId)?.price || 0;
                    closePosition(id, currentPrice);

                    const { pnl, pnlPercent } = getLivePnL(pos, currentPrice);
                    addSystemMessageProxy(`Position Closed: ${pos.coin} ${pos.direction.toUpperCase()} closed at $${currentPrice.toLocaleString()}\nPnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);
                }
            }
        }
    }, [wallet.networkName, wallet.address, getSwapQuote, addSystemMessageProxy, toggleWatchlist, allCoins, manualPanelOverride, setPanelSafe, prices, openPosition, closePosition, futuresPositions, getLivePnL]);

    const handleConfirmFutures = async () => {
        if (!pendingFuturesPosition) return;
        const { coin, direction, leverage, size, entryPrice } = pendingFuturesPosition;
        try {
            const pos = await openPosition(coin, direction, leverage, size, entryPrice);
            setPendingFuturesPosition(null);
            setRightPanelView('futures');
            setManualPanelOverride('futures');
            addSystemMessageProxy(`${pos.direction.toUpperCase()} ${pos.coin} ${pos.leverage}x opened at $${pos.entryPrice.toLocaleString()}. Liq at $${pos.liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Good luck.`);
        } catch (err: any) {
            addSystemMessageProxy(`Failed to open position: ${err.message}`);
        }
    };

    const handleDeclineFutures = () => {
        setPendingFuturesPosition(null);
        setRightPanelView('futures');
        setManualPanelOverride('futures');
        addSystemMessageProxy(`Position cancelled.`);
    };

    const handleCloseFuturesPosition = (id: number) => {
        const pos = futuresPositions.find(p => p.id === id);
        if (pos && prices) {
            const currentPrice = prices.find(p => p.id === pos.coinId)?.price || 0;
            closePosition(id, currentPrice);
            const { pnl, pnlPercent } = getLivePnL(pos, currentPrice);
            addSystemMessageProxy(`Position Closed: ${pos.coin} ${pos.direction.toUpperCase()} closed at $${currentPrice.toLocaleString()}\nPnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);
        }
    };

    const { messages, isLoading, sendMessage, addSystemMessage, addUserMessage, clearMessages } = useGroqChat(apiKey, handleAIAction, () => setShowUpgradeModal(true));

    useEffect(() => {
        addSystemMessageRef.current = addSystemMessage;
    }, [addSystemMessage]);

    const handleAnalysisComplete = useCallback((stats: any) => {
        if (chartAnalysisInProgress) return;
        chartAnalysisInProgress = true;

        try {
            // Hidden message to the AI to trigger the formatted analysis response
            const statsMessage = `Chart analysis complete for ${stats.coinSymbol}. 
Here are the exact values calculated and visualized on the chart:

Current Price: $${stats.currentPrice.toLocaleString()}
Support Level: $${stats.support.toLocaleString()}
Resistance Level: $${stats.resistance.toLocaleString()}
Trendline: $${stats.trendline ? '$' + stats.trendline.toLocaleString() : 'not detected'}
EMA 20: $${stats.ema20.toLocaleString()}
EMA 50: $${stats.ema50.toLocaleString()}
EMA Cross: ${stats.ema20 > stats.ema50 ? 'EMA20 above EMA50 — Bullish' : 'EMA20 below EMA50 — Bearish'}
Buy Signals detected: ${stats.buySignals}
Sell Signals detected: ${stats.sellSignals}

Using ONLY these exact numbers give a professional trading analysis. Include:
- Where price is relative to support and resistance
- What the EMA cross means
- Suggested entry zone, target and stop loss
- Overall trend direction
- Risk level`;

        // Use the ref because we don't want sendMessage to be a dependency (circular)
        // Actually, we can just call sendMessage from the hook since we have it here
        sendMessage(statsMessage, {
            address: wallet.address,
            holdings: wallet.holdings,
            contacts: contacts,
            history: history,
            watchlist: watchlistIds
        }, {
            fearGreed: fearGreedData,
            news: newsData
        }, {
            balance: futuresBalance,
            positions: futuresPositions
        }, 'chart', stats, { hidden: true });
        setMobileView('chat');
        } finally {
            setTimeout(() => { chartAnalysisInProgress = false; }, 5000);
        }
    }, [sendMessage, wallet, contacts, history, watchlistIds, fearGreedData, newsData, futuresBalance, futuresPositions]);

    // Handle sidebar feature click → preset message + panel update
    const handleFeatureClick = useCallback(
        (feature: SidebarFeature, message: string) => {
            setActiveFeature(feature);
            setActiveTab('agent');

            const walletCtx = {
                address: wallet.address,
                holdings: wallet.holdings,
                contacts,
                history,
                watchlist: watchlistIds
            };
            const sentimentCtx = {
                fearGreed: fearGreedData,
                news: newsData
            };
            const futuresCtx = {
                balance: futuresBalance,
                positions: futuresPositions
            };

            // Update right panel based on feature
            if (feature === 'portfolio') {
                setRightPanelView('portfolio');
                setManualPanelOverride('portfolio');
                sendMessage(message, walletCtx, sentimentCtx, futuresCtx, feature);
            } else if (feature === 'wallet') {
                setRightPanelView('contacts');
                setManualPanelOverride('contacts');
                addSystemMessage("Here are your saved contacts. You can add someone by saying 'add [name] [wallet address]'.");
            } else if (feature === 'watchlist') {
                setRightPanelView('watchlist');
                setManualPanelOverride('watchlist');
                sendMessage(message, walletCtx, sentimentCtx, futuresCtx, feature);
            } else if (feature === 'chart') {
                setActiveCoin(null);
                setRightPanelView('coin-chart');
                setManualPanelOverride('coin-chart');
                // Silent - Do not sendMessage
            } else if (feature === 'journal') {
                setRightPanelView('history');
                setManualPanelOverride('history');
                sendMessage(message, walletCtx, sentimentCtx, futuresCtx, feature);
            } else if (feature === 'news-sentiment') {
                setRightPanelView('news-sentiment');
                setManualPanelOverride('news-sentiment');
                // Silent - Do not sendMessage
            } else if (feature === 'futures') {
                setRightPanelView('futures');
                setManualPanelOverride('futures');
                addSystemMessage("You're in paper futures mode. You can open long or short positions with leverage. Try saying 'open a long BTC position with 10x leverage for $100'");
            } else {
                setRightPanelView('prices');
                setManualPanelOverride('prices');
                sendMessage(message, walletCtx, sentimentCtx, futuresCtx, feature);
            }
        },
        [sendMessage, addSystemMessage, wallet.address, wallet.holdings, contacts, history, watchlistIds, allCoins, fearGreedData, newsData, futuresBalance, futuresPositions]
    );

    const handleConfirmTransaction = useCallback(async () => {
        const preview = transactionPreview;
        if (!wallet.isConnected || !window.ethereum || !preview) {
            addSystemMessage("Please connect your wallet first to confirm this transaction.");
            return;
        }

        let txHash = "";
        try {
            addSystemMessage(`Requesting signature for **${preview.amount} ${preview.coin}**...`);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);

            let response;
            const coinUpper = preview.coin.toUpperCase();
            const isNative = ['BNB', 'ETH', 'MATIC', 'AVAX'].includes(coinUpper);

            if (isNative) {
                response = await signer.sendTransaction({
                    to: preview.address,
                    value: ethers.parseEther(preview.amount)
                });
            } else {
                // Token transfer logic
                const chainTokens = TOKEN_ADDRESSES[chainId] || {};
                const tokenAddr = chainTokens[coinUpper];

                if (!tokenAddr) throw new Error(`Contract address for ${coinUpper} not found on this network.`);

                const tokenContract = new ethers.Contract(tokenAddr, [
                    "function transfer(address to, uint256 amount) returns (bool)",
                    "function decimals() view returns (uint8)"
                ], signer);

                const decimals = await tokenContract.decimals().catch(() => 18);
                const amountWei = ethers.parseUnits(preview.amount, decimals);

                response = await tokenContract.transfer(preview.address, amountWei);
            }

            txHash = response.hash;

            addSystemMessageProxy(`Transaction broadcasted! Hash: ${txHash.slice(0, 10)}... (Status: Pending)`);

            saveTransaction({
                type: 'send',
                fromToken: preview.coin,
                fromAmount: preview.amount,
                toAddress: preview.address,
                contactName: preview.recipientName,
                status: 'pending',
                hash: txHash,
                network: wallet.networkName || 'Ethereum Mainnet'
            });

            const { amount, coin, recipientName, address: toAddress } = preview;
            setTransactionPreview(null);

            await response.wait();
            addSystemMessageProxy(`Transaction confirmed! You sent **${amount} ${coin}** to **${recipientName}**. [View on Explorer](${getExplorerUrl(txHash)})`);

            saveTransaction({
                type: 'send',
                fromToken: coin,
                fromAmount: amount,
                toAddress: toAddress,
                contactName: recipientName,
                status: 'success',
                hash: txHash,
                network: wallet.networkName || 'Ethereum Mainnet'
            });

            refreshBalances();

        } catch (err: any) {
            console.error('Transaction Error:', err);
            addSystemMessage(`Error: ${err.message || 'Transaction failed'}`);

            if (txHash && preview) {
                saveTransaction({
                    type: 'send',
                    fromToken: preview.coin,
                    fromAmount: preview.amount,
                    toAddress: preview.address,
                    contactName: preview.recipientName,
                    status: 'failed',
                    hash: txHash,
                    network: wallet.networkName || 'Ethereum Mainnet'
                });
            }
        }
    }, [wallet.isConnected, wallet.networkName, transactionPreview, addSystemMessage, addSystemMessageProxy, getExplorerUrl, refreshBalances, saveTransaction]);

    const handleConfirmSwap = useCallback(async () => {
        if (!wallet.isConnected || !window.ethereum || !swapPreview) {
            addSystemMessageProxy("Please connect your wallet first.");
            return;
        }

        try {
            addSystemMessageProxy(`Preparing swap of **${swapPreview.fromAmount} ${swapPreview.fromToken}** for **${swapPreview.toToken}**...`);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Check for native BNB
            const isFromEth = swapPreview.fromTokenAddress === BNB_TOKENS.BNB;
            const isToEth = swapPreview.toTokenAddress === BNB_TOKENS.BNB;

            const pFrom = isFromEth ? WBNB : swapPreview.fromTokenAddress;
            const pTo = isToEth ? WBNB : swapPreview.toTokenAddress;
            const path = [pFrom, pTo];

            let tx: any;
            const PANCAKESWAP_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
            const ROUTER_ABI = [
                "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
                "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
                "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
            ];

            const router = new ethers.Contract(PANCAKESWAP_ROUTER, ROUTER_ABI, signer);
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins
            const amountIn = swapPreview.rawSwapData.amountWei;
            const minAmountOut = 0; // In production, use slippage

            if (!isFromEth) {
                addSystemMessageProxy(`Checking allowance for **${swapPreview.fromToken}**...`);
                await approveToken(swapPreview.fromTokenAddress, amountIn);
                addSystemMessageProxy(`Token approved! Please sign the swap transaction...`);
            }

            if (isFromEth) {
                tx = await router.swapExactETHForTokens(minAmountOut, path, wallet.address, deadline, { value: amountIn });
            } else if (isToEth) {
                tx = await router.swapExactTokensForETH(amountIn, minAmountOut, path, wallet.address, deadline);
            } else {
                tx = await router.swapExactTokensForTokens(amountIn, minAmountOut, path, wallet.address, deadline);
            }

            const txHash = tx.hash;
            addSystemMessageProxy(`Swap broadcasted! Hash: ${txHash.slice(0, 10)}... (Status: Pending)`);

            saveTransaction({
                type: 'swap',
                fromToken: swapPreview.fromToken,
                fromAmount: swapPreview.fromAmount,
                toToken: swapPreview.toToken,
                toAmount: swapPreview.toAmount,
                status: 'pending',
                hash: txHash,
                network: 'BNB Smart Chain'
            });

            await tx.wait();
            addSystemMessageProxy(`Swap successful! You received **${parseFloat(swapPreview.toAmount).toFixed(4)} ${swapPreview.toToken}**. [View on Explorer](${getExplorerUrl(txHash)})`);

            saveTransaction({
                type: 'swap',
                fromToken: swapPreview.fromToken,
                fromAmount: swapPreview.fromAmount,
                toToken: swapPreview.toToken,
                toAmount: swapPreview.toAmount,
                status: 'success',
                hash: txHash,
                network: 'BNB Smart Chain'
            });

            setSwapPreview(null);
            setRightPanelView('history');
            refreshBalances();

        } catch (err: any) {
            console.error('Swap Error:', err);
            addSystemMessageProxy(`Swap failed: ${err.message}`);

            saveTransaction({
                type: 'swap',
                fromToken: swapPreview?.fromToken || '?',
                fromAmount: swapPreview?.fromAmount || '0',
                toToken: swapPreview?.toToken || '?',
                toAmount: swapPreview?.toAmount || '0',
                status: 'failed',
                hash: '',
                network: 'BNB Smart Chain'
            });
        }
    }, [wallet.isConnected, wallet.address, swapPreview, addSystemMessageProxy, approveToken, getExplorerUrl, refreshBalances, saveTransaction]);

    const handleSendMessage = useCallback(
        (content: string) => {
            // Intercept contacts commands
            if (content.toLowerCase().startsWith('add ') && content.split(' ').length >= 3) {
                const parts = content.split(' ');
                const name = parts[1];
                const addr = parts[2];
                if (ethers.isAddress(addr)) {
                    addContact(name, addr);
                    addSystemMessage(`Saved **${name}** as ${addr.slice(0, 6)}...${addr.slice(-4)}. You can now send funds to ${name} directly by name.`);
                    setRightPanelView('contacts');
                    setMobileView('panel');
                    return;
                }
            }

            if (content.toLowerCase().startsWith('delete contact ')) {
                const name = content.replace(/delete contact /i, '').trim();
                if (contacts[name]) {
                    removeContact(name);
                    addSystemMessage(`Removed **${name}** from your address book.`);
                    setRightPanelView('contacts');
                    return;
                }
            }

            // --- Chart Analysis Fixes ---
            const isChartViewRequest = (msg: string) => {
                const viewOnly = ['show chart', 'open chart', 'show me chart', 'view chart'];
                return viewOnly.some(k => msg.toLowerCase().includes(k)) &&
                    !msg.toLowerCase().includes('analyz') &&
                    !msg.toLowerCase().includes('analysis');
            };

            const isChartAnalysisRequest = (msg: string) => {
                const analysisKeywords = ['analyz', 'analysis', 'technical', 'what do you see', 
                    'check the chart', 'read the chart', 'pattern'];
                return analysisKeywords.some(k => msg.toLowerCase().includes(k));
            };

            let detectedCoin: CoinGeckoCoin | null = null;
            const msgLower = content.toLowerCase();
            for (const coin of allCoins) {
                if (msgLower.includes((coin.symbol || '').toLowerCase()) || msgLower.includes((coin.name || '').toLowerCase())) {
                    detectedCoin = coin;
                    break;
                }
            }

            if (detectedCoin && isChartViewRequest(content)) {
                addUserMessage(content);
                setActiveCoin(detectedCoin);
                setChartShouldAnalyze(false);
                setRightPanelView('coin-chart');
                setManualPanelOverride('coin-chart');
                setMobileView('panel');
                return; // stop here, no AI response
            }

            if (detectedCoin && isChartAnalysisRequest(content)) {
                addUserMessage(content);
                setActiveCoin(detectedCoin);
                setChartShouldAnalyze(true);
                setRightPanelView('coin-chart');
                setManualPanelOverride('coin-chart');
                setMobileView('panel');
                return; // Let TechnicalAnalysisChart component trigger analysis
            }
            // -----------------------------

            // Default AI message
            sendMessage(content, {
                address: wallet.address,
                holdings: wallet.holdings,
                contacts,
                history,
                watchlist: watchlistIds
            }, {
                fearGreed: fearGreedData,
                news: newsData
            }, {
                balance: futuresBalance,
                positions: futuresPositions
            }, activeFeature);
        },
        [sendMessage, addUserMessage, addContact, removeContact, contacts, allCoins, wallet.address, wallet.holdings, history, watchlistIds, fearGreedData, newsData, futuresBalance, futuresPositions, activeFeature]
    );

    const handleConnectWallet = useCallback(() => {
        if (!wallet.isConnected) {
            connectWallet();
        } else {
            setRightPanelView('portfolio');
        }
    }, [wallet.isConnected, connectWallet]);

    const handleOpenExchange = useCallback(() => {
        setExchangeOpen(true);
    }, []);

    const handleSaveSettings = (newKey: string) => {
        setApiKey(newKey);
        localStorage.setItem('groq_api_key', newKey);
        if (newKey) {
            addSystemMessageProxy('Settings saved! I am now ready to chat and fetch news.');
        }
    };

    const handleSignalClick = (signal: TraderSignal) => {
        setActiveTab('agent');
        sendMessage(`Analyze the ${signal.coin} ${signal.direction} signal from ${signal.name}. Is it a good entry?`, {
            address: wallet.address,
            holdings: wallet.holdings,
            contacts,
            history,
            watchlist: watchlistIds
        }, {
            fearGreed: fearGreedData,
            news: newsData
        }, {
            balance: futuresBalance,
            positions: futuresPositions
        }, activeFeature);
    };

    const handleSignalAnalyzeOnly = (signal: TraderSignal) => {
        setActiveTab('agent');
        sendMessage(
            `Analyze only this signal and provide insights: ${signal.coin} ${signal.direction} from ${signal.name}. Do not open or suggest executing any paper futures trade action. Just return analysis with entry zone, stop loss, target, risk, and confidence.`,
            {
                address: wallet.address,
                holdings: wallet.holdings,
                contacts,
                history,
                watchlist: watchlistIds
            },
            {
                fearGreed: fearGreedData,
                news: newsData
            },
            {
                balance: futuresBalance,
                positions: futuresPositions
            },
            activeFeature,
            null,
            { allowActions: false }
        );
    };

    return (
        <div
            className="app-root-wrapper"
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-main)',
            }}
        >
            {showScanline && <div className="scanline" />}
            {showWalletAnim && <WalletConnectAnimation />}

            <TopBar
                prices={prices}
                wallet={wallet}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenExchange={handleOpenExchange}
                onConnectWallet={handleConnectWallet}
                onUpgrade={() => setShowUpgradeModal(true)}
                formatAddress={formatAddress}
            />

            {/* Main Layout */}
            <div className={`app-main-layout mobile-view-${mobileView}`} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div className="app-sidebar">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((v) => !v)}
                    activeFeature={activeFeature}
                    onFeatureClick={handleFeatureClick}
                    onSettingsClick={() => setSettingsOpen(true)}
                />
                </div>

                {/* Center Panel */}
                <div className="app-chat-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    {/* Show chart in center when a coin is selected in Chart Analysis mode */}
                    {activeCoin && (manualPanelOverride === 'coin-chart' || rightPanelView === 'coin-chart') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-panel)', padding: '16px', overflow: 'hidden' }}>
                            {/* Chart header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={activeCoin.image} alt={activeCoin.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
                                            {activeCoin.name} ({activeCoin.symbol.toUpperCase()})
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '15px', color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
                                                ${activeCoin.current_price?.toLocaleString() ?? '0'}
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: (activeCoin.price_change_percentage_24h || 0) >= 0 ? '#10ff88' : '#ff3366'
                                            }}>
                                                {(activeCoin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                                                {(activeCoin.price_change_percentage_24h || 0).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            if (isInWatchlist(activeCoin.id)) {
                                                toggleWatchlist(activeCoin.id);
                                            } else {
                                                toggleWatchlist(activeCoin.id);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            background: isInWatchlist(activeCoin.id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            border: `1px solid ${isInWatchlist(activeCoin.id) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                            color: isInWatchlist(activeCoin.id) ? '#ef4444' : '#10b981',
                                            fontWeight: 600,
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isInWatchlist(activeCoin.id) ? '✕ Remove' : '+ Watchlist'}
                                    </button>
                                    <button
                                        onClick={() => setActiveCoin(null)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-subtle)',
                                            color: 'var(--text-muted)',
                                            fontWeight: 600,
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ✕ Close Chart
                                    </button>
                                </div>
                            </div>

                            {/* Chart fills the rest of the center panel */}
                            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', minHeight: 0 }}>
                                <TechnicalAnalysisChart
                                    coinId={activeCoin.id}
                                    coinSymbol={activeCoin.symbol}
                                    onAnalysisComplete={chartShouldAnalyze ? handleAnalysisComplete : undefined}
                                />
                            </div>
                        </div>
                    ) : activeTab === 'agent' ? (
                        <ChatPanel
                            messages={messages}
                            isLoading={isLoading}
                            onSendMessage={(msg) => { handleSendMessage(msg); setMobileView('chat'); }}
                            onClearChat={clearMessages}
                        />
                    ) : (
                        <SignalFeed onSignalClick={handleSignalClick} onAnalyzeClick={handleSignalAnalyzeOnly} />
                    )}
                </div>

                {/* Right Panel */}
                <div className="app-right-panel">
                <RightPanel
                    view={manualPanelOverride || rightPanelView}
                    prices={prices}
                    pricesLoading={pricesLoading}
                    wallet={wallet}
                    transactionPreview={transactionPreview}
                    contacts={contacts}
                    onContactSendClick={(name) => handleSendMessage(`Send to ${name}`)}
                    onContactDeleteClick={(name) => handleSendMessage(`Delete contact ${name}`)}
                    onConfirmTransactionClick={handleConfirmTransaction}
                    onConfirmSwapClick={handleConfirmSwap}
                    swapPreview={swapPreview}
                    history={history}
                    onSwitchNetwork={switchNetwork}
                    allCoins={allCoins}
                    watchlistCoins={watchlistCoins}
                    onToggleWatchlist={toggleWatchlist}
                    isInWatchlist={isInWatchlist}
                    watchlistLoading={watchlistLoading}
                    watchlistLastUpdated={watchlistLastUpdated}
                    onCoinClick={(coin) => {
                        const currentView = manualPanelOverride || rightPanelView;
                        if (currentView === 'coin-chart') {
                            setActiveCoin(coin);
                            setChartShouldAnalyze(false);
                        } else {
                            setWatchlistCoin(coin);
                        }
                    }}
                    activeCoin={activeCoin}
                    newsData={newsData}
                    fearGreedData={fearGreedData}
                    newsLoading={newsLoading}
                    newsError={newsError}
                    newsLastUpdated={newsLastUpdated}
                    futuresBalance={futuresBalance}
                    futuresPositions={futuresPositions}
                    onCloseFuturesPosition={handleCloseFuturesPosition}
                    futuresPrices={prices ? Object.fromEntries(prices.filter(p => p.id && SUPPORTED_FUTURES_COINS[p.symbol.toUpperCase()]).map(p => [p.id, { usd: p.price }])) : {}}
                    pendingFuturesPosition={pendingFuturesPosition}
                    onConfirmFutures={handleConfirmFutures}
                    onDeclineFutures={handleDeclineFutures}
                />
                
                {/* Mobile Quick Chat - Only visible on Mobile when Panel is active */}
                <div className="mobile-quick-chat-container">
                    <input 
                        type="text" 
                        placeholder="Type a command (e.g. short BTC 10x)..."
                        className="mobile-quick-chat-input"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                handleSendMessage(e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                                setMobileView('chat');
                            }
                        }}
                    />
                    <div style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', pointerEvents: 'none' }}>
                        &#10148;
                    </div>
                </div>

                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="app-bottom-nav">
                {[{ id: 'chat', icon: '💬', label: 'Chat' }, { id: 'portfolio', icon: '💼', label: 'Portfolio' }, { id: 'watchlist', icon: '👁️', label: 'Watch' }, { id: 'chart', icon: '📊', label: 'Charts' }, { id: 'news-sentiment', icon: '📡', label: 'News' }, { id: 'futures', icon: '⚡', label: 'Futures' }].map(f => (
                    <button
                        key={f.id}
                        className={`app-bottom-nav-btn ${(f.id === 'chat' && mobileView === 'chat') || (mobileView === 'panel' && activeFeature === f.id) || (mobileView === 'panel' && f.id === 'portfolio' && !activeFeature) ? 'active' : ''}`}
                        onClick={() => {
                            if (f.id === 'chat') {
                                setMobileView('chat');
                            } else {
                                setMobileView('panel');
                                handleFeatureClick(f.id as any, '');
                            }
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </nav>

            {watchlistCoin && (
                <ChartModal
                    coin={watchlistCoin}
                    onClose={() => setWatchlistCoin(null)}
                />
            )}

            {exchangeOpen && (
                <ExchangeModal
                    prices={prices}
                    onClose={() => setExchangeOpen(false)}
                />
            )}

            {settingsOpen && (
                <SettingsModal
                    apiKey={apiKey}
                    onSave={handleSaveSettings}
                    onClose={() => setSettingsOpen(false)}
                />
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal 
                    onClose={() => setShowUpgradeModal(false)}
                    userId={userData?.id}
                    userEmail={userData?.email}
                />
            )}
        </div>
    );
}

export default App;
