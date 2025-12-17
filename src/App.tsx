import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Future routes */}
        {/* <Route path="/explore" element={<Explore />} /> */}
        {/* <Route path="/restaurant/:id" element={<RestaurantDetail />} /> */}
      </Routes>
    </Router>
  )
}

export default App
