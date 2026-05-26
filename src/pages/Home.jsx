import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GameCard from '../components/GameCard'

export default function Home() {
  const games = [
    {
      id: 'mock-exchange',
      title: 'Mock Exchange',
      description: 'Trade stocks in a simulated market. Learn trading mechanics with $100k virtual cash.',
      icon: '📈',
      path: '/mock-exchange',
      comingSoon: false
    },
    {
      id: 'p2p-exchange',
      title: 'Peer Exchange',
      description: 'Shared order book over WebSockets. Place limit orders and trade only when counterparties cross.',
      icon: '🤝',
      path: '/p2p-exchange',
      comingSoon: false
    },
    {
      id: 'options-pricer',
      title: 'Options Pricer',
      description: 'Understand option pricing models and Greeks. Calculate fair values using Black-Scholes.',
      icon: '📊',
      path: '#',
      comingSoon: true
    },
    {
      id: 'risk-calc',
      title: 'Risk Calculator',
      description: 'Calculate VaR, Sharpe ratio, and other portfolio risk metrics. Optimize your allocation.',
      icon: '⚠️',
      path: '#',
      comingSoon: true
    },
    {
      id: 'arbitrage',
      title: 'Arbitrage Finder',
      description: 'Identify and execute arbitrage opportunities across correlated instruments.',
      icon: '🔗',
      path: '#',
      comingSoon: true
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-screen bg-dark-navy text-text-primary">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Background gradient */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan rounded-full mix-blend-screen blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-magenta rounded-full mix-blend-screen blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center mb-20">
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to <span className="gradient-cyan-lime">QuantGames</span>
            </motion.h1>

            <motion.p
              className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              A platform for learning and exploring quantitative trading, market mechanics, and financial engineering through interactive games and simulations.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/mock-exchange"
                className="btn btn-primary text-lg"
              >
                Start Trading
              </Link>
              <button className="btn btn-outline text-lg">
                Explore All Games
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Games Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Featured Games & Tools</h2>
            <p className="text-text-secondary text-lg">Start with trading and more games coming soon</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {games.map(game => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard {...game} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider"></div>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Why QuantGames?</h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { title: 'Learn Trading', desc: 'Master buy/sell mechanics in a risk-free environment' },
              { title: 'Real-time Feedback', desc: 'See PnL calculations and portfolio metrics instantly' },
              { title: 'Expandable Platform', desc: 'New games and tools added regularly' }
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants} className="card card-hover text-center">
                <h3 className="text-xl font-semibold mb-3 text-neon-cyan">{feature.title}</h3>
                <p className="text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
