# QuantGames Platform

A web-based platform for learning and exploring quantitative trading, market mechanics, and financial engineering through interactive games and simulations.

## 🚀 Features

- **Mock Exchange**: Trade stocks with $100k virtual cash
- **Real-time Price Simulation**: Prices update every 3 seconds
- **Portfolio Management**: Track holdings, PnL, and cash balance
- **Order History**: View all past trades
- **Dark Theme UI**: Deep navy and charcoal with neon accents
- **Smooth Animations**: Framer Motion for seamless transitions
- **Expandable Platform**: Architecture ready for more games

## 📁 Project Structure

```
quantgames/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── GameCard.jsx
│   │   ├── TradePanel.jsx
│   │   ├── Portfolio.jsx
│   │   ├── OrderBook.jsx
│   │   └── PnLDisplay.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   └── MockExchange.jsx
│   ├── stores/          # Zustand state management
│   │   └── tradeStore.js
│   ├── utils/           # Utility functions (for future)
│   ├── hooks/           # Custom React hooks (for future)
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles + Tailwind
├── public/              # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v6

## 🎨 Design System

### Colors
- **Dark Navy**: `#0a0e27`
- **Charcoal**: `#1a1f3a`
- **Neon Cyan**: `#00d9ff`
- **Neon Lime**: `#00ff88`
- **Neon Magenta**: `#ff006e`
- **Neon Purple**: `#b700ff`

### Typography
- **Font**: Inter (Google Fonts)
- **Smooth scrolling** enabled globally

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aashivjain/tradingapps.git
cd tradingapps
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🤝 Peer Exchange (Shared Order Book)

Run the websocket exchange server in one terminal:

```bash
npm run server
```

Run the web app in another terminal:

```bash
npm run dev
```

Open the Peer Exchange page at:

`http://localhost:5173/p2p-exchange`

### Notes

- WebSockets do not cost anything when you run locally on your own machine.
- Hosting this server in the cloud may incur normal hosting/network costs.
- Bots are OFF by default in Peer Exchange; if you are alone, orders should rest unless you enable bots.

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Home Page
- Browse all available games and tools
- Click cards to navigate to games
- "Coming Soon" games show placeholders

### Mock Exchange
1. Select a stock from the dropdown
2. Enter quantity to buy/sell
3. Monitor real-time price updates
4. View portfolio value and PnL
5. Track all orders in history

## 🗺️ Roadmap

### Phase 1 (Current): Foundation ✅
- Home page with game navigation
- Mock Exchange with buy/sell mechanics
- Dark theme with neon accents
- Smooth animations

### Phase 2: Enhancement
- Options Pricer tool
- Risk Calculator (VaR, Sharpe ratio)
- Arbitrage Finder
- Persistence (localStorage)
- Backend API integration

### Phase 3: Expansion
- More quant trading games
- Educational content
- Leaderboards
- Social features

## 🔧 Development

### Adding a New Game
1. Create a new page in `src/pages/YourGame.jsx`
2. Add a route in `src/App.jsx`
3. Add a game card in `src/pages/Home.jsx`
4. Create components as needed in `src/components/`

### Managing State
Use Zustand stores in `src/stores/`. Example:
```javascript
import { useYourStore } from '../stores/yourStore'

// In component:
const value = useYourStore(state => state.value)
```

### Styling
- Use Tailwind classes from `tailwind.config.js`
- Custom colors: `text-neon-cyan`, `bg-dark-navy`, etc.
- Animations: `animate-fade-in`, `animate-slide-up`, etc.
- Shadows: `shadow-glow-cyan`, `shadow-glow-lime`, etc.

## 📝 Environment Variables

Create a `.env.local` file for environment-specific settings:
```
VITE_API_URL=http://localhost:3000
```

## 🐛 Debugging

- Use React DevTools extension
- Check browser console for Zustand state: `window.__ZUSTAND_DEBUG_STORE__`
- Enable verbose logging in development

## 📄 License

MIT License - Feel free to use for personal and commercial projects

## 👤 Author

Aashiv Jain  
GitHub: [@aashivjain](https://github.com/aashivjain)

## 🤝 Contributing

Contributions welcome! Please feel free to submit PRs or open issues.

---

**Note**: This is a simulation/educational platform. Not financial advice. Always do your own research before trading!
