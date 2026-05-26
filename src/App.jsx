import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MockExchange from './pages/MockExchange'
import P2PExchange from './pages/P2PExchange'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mock-exchange" element={<MockExchange />} />
          <Route path="/p2p-exchange" element={<P2PExchange />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
