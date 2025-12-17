import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { Home } from '@/pages/Home'
import { RestaurantDetail } from '@/pages/RestaurantDetail'
import { Explore } from '@/pages/Explore'
import { Submit } from '@/pages/Submit'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminDashboard } from '@/pages/Admin/Dashboard'
import { AdminRestaurants } from '@/pages/Admin/Restaurants'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/submit" element={<Submit />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
