import { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CuisineTypesProvider } from '@/contexts/CuisineTypesContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { LoadingScreen } from '@/components/LoadingScreen'

// Lazy load pages
const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })))
const Explore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })))
const Search = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })))
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail').then(module => ({ default: module.RestaurantDetail })))
const Submit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })))

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard').then(module => ({ default: module.AdminDashboard })))
const AdminRestaurants = lazy(() => import('@/pages/Admin/Restaurants').then(module => ({ default: module.AdminRestaurants })))
const AdminReports = lazy(() => import('@/pages/Admin/Reports').then(module => ({ default: module.AdminReports })))
const AdminCuisineTypes = lazy(() => import('@/pages/Admin/CuisineTypes').then(module => ({ default: module.AdminCuisineTypes })))

function App() {
  return (
    <AuthProvider>
      <CuisineTypesProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/submit" element={<Submit />} />
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="restaurants" element={<AdminRestaurants />} />
                  <Route path="cuisine-types" element={<AdminCuisineTypes />} />
                  <Route path="reports" element={<AdminReports />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </CuisineTypesProvider>
    </AuthProvider>
  )
}

export default App
