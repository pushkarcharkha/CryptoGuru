# 🧠 CryptoGuru AI — Your Intelligent Crypto Co-Pilot

**CryptoGuru** is a full-stack, AI-powered crypto trading terminal that combines natural language intelligence with real-time market data, on-chain execution, and professional-grade analytics. Built for traders who demand speed, insight, and control — all from a single HUD-style interface.

---

## ✨ Features at a Glance

| Module | Description |
|---|---|
| 🤖 **AI Agent** | Natural language terminal powered by Groq (Llama 3.3 70B) |
| 📊 **Chart Analysis** | AI-annotated charts with auto-detected S/R, EMAs, trendlines & patterns |
| ⚡ **Paper Futures** | Simulated leverage trading with stop-loss & take-profit |
| 📡 **News & Sentiment** | Real-time crypto news + Fear & Greed Index |
| 🎓 **Learn Hub** | Interactive crypto academy with quizzes, simulators & an AI tutor |
| 📈 **Backtest Engine** | Strategy scanner with real BTC OHLC data from CoinGecko |
| 🔔 **Price Alerts** | Set custom alerts — get notified when targets are hit |
| 🔁 **DEX Swap** | Non-custodial PancakeSwap V2 integration on BNB Smart Chain |
| 💼 **Portfolio & Wallet** | Multi-chain wallet management (BSC, Ethereum, Polygon, Sepolia) |
| 📋 **Signal Feed** | Community trading signals with copy-trade & AI analysis |
| 🛡️ **Strategy Builder** | Create custom automation rules with indicator & pattern conditions |
| 📓 **Trade Journal** | Full trade history with AI-powered summaries and performance analysis |

---

## 🤖 AI Agent — The Brain

CryptoGuru's AI is not a chatbot — it's an **agentic system** that can reason, execute, and learn.

- **Natural Language Execution** — `"Swap 0.1 BNB for USDT"`, `"Analyze the BTC chart"`, `"What's the market sentiment?"`
- **Context-Aware** — Understands your wallet balance, open positions, trade history, and watchlist
- **Auto Tool Routing** — Switches between price fetching, chart rendering, news lookup, and transaction prep
- **User Memory** — Remembers your preferences, risk profile, and trading style across sessions
- **Multi-Language** — Supports English and Hindi

---

## 📊 AI Chart Analysis

Powered by `lightweight-charts` v5 with real-time data from Binance WebSocket + CoinGecko.

- **Auto-Detection**: Support/Resistance zones, EMA 20/50 crossovers, trendlines
- **Pattern Recognition**: AI identifies chart patterns and overlays them visually
- **Buy/Sell Signals**: Annotated directly on the chart with actionable arrows
- **Multi-Timeframe**: Switch between different time periods for analysis
- **AI Commentary**: Get a written analysis with confidence levels and trade setups

---

## 📈 Backtest Engine

Test strategies against **real historical BTC data** fetched live from CoinGecko.

- **Real OHLC Data** — Daily candles constructed from CoinGecko's market chart API
- **EMA Crossover Strategy** — EMA(9) / EMA(21) signal generation
- **Configurable** — Set investment amount ($) and period (30/90/180/365 days)
- **Performance Metrics** — Profit, ROI, win rate, total trades (winners/losers)
- **Visual Results** — Candlestick chart with BUY/SELL markers + equity curve
- **Right Panel Summary** — Strategy info, performance breakdown displayed alongside

---

## ⚡ Paper Futures Trading

Practice leveraged trading risk-free with a $1,000 virtual balance.

- **Long & Short** positions on major crypto pairs
- **Adjustable Leverage** up to 125x
- **Stop-Loss & Take-Profit** orders
- **Real-time PnL** tracking using live market prices
- **Liquidation Engine** with realistic price calculations
- **Full Trade History** with closed position journal

---

## 🎓 Learn Hub — Crypto Academy

A structured learning system for traders at every level.

- **Curated Curriculum** — Beginner → Intermediate → Advanced modules
- **Interactive Lessons** — Theory + real-world examples + actionable rules
- **Chart Simulators** — Practice identifying patterns on historical data
- **Quizzes** — Test your knowledge with instant feedback
- **AI Tutor** — Dedicated right-panel assistant for real-time Q&A on any lesson

---

## 📡 News & Sentiment

Stay ahead of the market with real-time intelligence.

- **Live News Feed** — Aggregated from CoinDesk, CoinTelegraph, Decrypt
- **Fear & Greed Index** — Market psychology gauge from Alternative.me
- **AI Summarization** — Ask the AI to break down trending news

---

## 🔔 Smart Alerts

- Set price alerts: *"Alert me when BTC crosses $80,000"*
- Strategy-based alerts from the Strategy Builder
- Native browser notifications when targets are hit

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite 7 |
| **Styling** | Vanilla CSS (Glassmorphism, dark theme, responsive) |
| **Charts** | Lightweight Charts v5 (TradingView) |
| **3D / Animations** | Three.js, GSAP, Locomotive Scroll |
| **Icons** | Lucide React |
| **Blockchain** | Ethers.js v6 + MetaMask / Web3 wallets |
| **AI Engine** | Groq LPU™ (Llama 3.3 70B) — sub-second inference |
| **Auth & DB** | Supabase (Auth + PostgreSQL) |
| **Payments** | Razorpay + Stripe integration |
| **DEX** | PancakeSwap V2 Router (BNB Smart Chain) |
| **Data** | CoinGecko API, Binance WebSocket, RSS2JSON, Alternative.me |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) or any Web3 browser wallet
- [Groq API Key](https://console.groq.com/) (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/pushkarcharkha/CryptoCopilot.git
cd CryptoCopilot

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### AI Activation
1. Launch the app and go to **Settings** (gear icon)
2. Paste your **Groq API Key** (stored locally in `localStorage`)

### Run Development

```bash
npm run dev
```

### Run with Payment Server

```bash
npm run dev:full
```

---

## 📂 Project Structure

```
CryptoGuru/
├── src/
│   ├── App.tsx                  # Main app layout & state management
│   ├── LandingPage.tsx          # 3D animated landing page
│   ├── components/
│   │   ├── ChatPanel.tsx        # AI chat interface with quick actions
│   │   ├── RightPanel.tsx       # Multi-view right panel (portfolio, chart, etc.)
│   │   ├── TechnicalAnalysisChart.tsx  # AI-annotated chart component
│   │   ├── BacktestDashboard.tsx       # Backtest engine with real data
│   │   ├── LearnPanel.tsx       # Academy learning interface
│   │   ├── FuturesPanel.tsx     # Paper futures trading
│   │   ├── SignalFeed.tsx       # Community signal feed
│   │   ├── NewsSentimentPanel.tsx      # News & Fear/Greed
│   │   ├── StrategyBuilderModal.tsx    # Custom strategy automation
│   │   └── ...                  # TopBar, Sidebar, Modals
│   ├── hooks/
│   │   ├── useGroqChat.ts       # AI engine + message handling
│   │   ├── useWallet.ts         # Multi-chain wallet management
│   │   ├── useFutures.ts        # Paper futures logic
│   │   ├── useCrypto.ts         # Live price feeds
│   │   ├── useNews.ts           # News aggregation
│   │   ├── useUserMemory.ts     # AI memory system
│   │   ├── useStrategies.ts     # Strategy automation
│   │   └── ...                  # Alerts, Signals, Watchlist, etc.
│   ├── data/
│   │   └── academyCurriculum.ts # Full learning curriculum
│   └── types.ts                 # TypeScript type definitions
├── server/
│   └── payments.cjs             # Payment server (Razorpay/Stripe)
├── backtesting/
│   └── data/                    # Historical BTC data files
└── public/                      # Static assets
```

---

## 🛡️ Security & Privacy

- **Non-Custodial** — Private keys never leave your wallet (MetaMask handles all signing)
- **Local-First** — API keys, watchlists, and preferences stored in browser `localStorage`
- **Zero Tracking** — No prompt logging, no trade surveillance, no analytics

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
