import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Home } from '@/pages/Home'
import { RestaurantDetail } from '@/pages/RestaurantDetail'
import { Explore } from '@/pages/Explore'
import { Submit } from '@/pages/Submit'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/submit" element={<Submit />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
