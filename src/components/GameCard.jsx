import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function GameCard({ title, description, icon, path, comingSoon }) {
  return (
    <Link to={path} className={comingSoon ? 'pointer-events-none' : ''}>
      <motion.div
        className="card card-hover h-full flex flex-col cursor-pointer group relative"
        whileHover={!comingSoon ? { y: -8 } : {}}
        transition={{ duration: 0.3 }}
      >
        {comingSoon && (
          <div className="absolute inset-0 bg-dark-navy/80 rounded-lg flex items-center justify-center backdrop-blur-sm z-10">
            <span className="text-neon-lime font-bold text-sm">Coming Soon</span>
          </div>
        )}

        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-neon-cyan transition-smooth">
          {title}
        </h3>
        <p className="text-text-secondary text-sm flex-1 mb-4">{description}</p>

        <div className="flex items-center gap-2 text-neon-cyan text-sm font-semibold group-hover:gap-3 transition-all">
          <span>Play Now</span>
          <span>→</span>
        </div>
      </motion.div>
    </Link>
  )
}
