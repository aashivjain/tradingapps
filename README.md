# QuantGames

QuantGames is a React + Vite project for building trading simulations and exchange workflows.

## Features

- Mock exchange with limit order entry and portfolio tracking
- Peer-to-peer exchange page backed by a shared WebSocket order book
- Resting orders with price-time matching
- Optional bot participants for local liquidity testing
- Real quote polling for tracked stock symbols

## Tech Stack

- React 18
- Vite
- Zustand
- React Router
- Tailwind CSS
- Framer Motion
- ws (WebSocket server)

## Project Structure

```
tradingapps/
├── server/                 # Local websocket exchange server
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # React hooks
│   ├── pages/              # Route pages
│   ├── stores/             # Zustand stores
│   └── utils/              # Data/service helpers
├── package.json
└── README.md
```

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Run peer exchange server:

```bash
npm run server
```

Main URLs:

- Frontend: http://localhost:5173
- Peer exchange page: http://localhost:5173/p2p-exchange
- WebSocket server: ws://localhost:8787

## Build and Checks

```bash
npm run lint
npm run build
npm run preview
```

## Environment Variables

Optional `.env.local` values:

```env
VITE_FMP_API_KEY=your_api_key
VITE_EXCHANGE_WS_URL=ws://localhost:8787
```

## Notes

- WebSockets are free to run locally.
- Cloud deployment may have hosting and bandwidth costs.
- This project is for simulation and education, not financial advice.

## License

MIT
