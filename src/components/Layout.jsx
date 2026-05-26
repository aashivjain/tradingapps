import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-navy flex flex-col">
      {/* Navbar */}
      <nav className="bg-dark-charcoal border-b border-dark-secondary fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-sm font-bold text-neon-cyan border border-neon-cyan rounded px-2 py-1">QG</div>
            <span className="text-xl font-bold text-text-primary group-hover:gradient-cyan-lime transition-smooth">
              QuantGames
            </span>
          </Link>
          <div className="flex gap-6">
            <Link
              to="/"
              className="text-text-secondary hover:text-neon-cyan transition-smooth text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/mock-exchange"
              className="text-text-secondary hover:text-neon-cyan transition-smooth text-sm font-medium"
            >
              Mock Exchange
            </Link>
            <Link
              to="/p2p-exchange"
              className="text-text-secondary hover:text-neon-cyan transition-smooth text-sm font-medium"
            >
              Peer Exchange
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content with padding for navbar */}
      <main className="flex-1 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-charcoal border-t border-dark-secondary py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-text-secondary text-sm">
          <p>QuantGames Platform © 2026 | Built with React + Vite</p>
          <p className="mt-2 text-text-muted">A hub for quant trading games and educational tools</p>
        </div>
      </footer>
    </div>
  )
}
