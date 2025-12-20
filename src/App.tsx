import { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CuisineTypesProvider } from '@/contexts/CuisineTypesContext'
import { PetPoliciesProvider } from '@/contexts/PetPoliciesContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/AdminLayout'
import { LoadingScreen } from '@/components/LoadingScreen'
import { FeedbackButton } from '@/components/Feedback'

// Lazy load pages
const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })))
const Explore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })))
const Search = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })))
const RestaurantDetail = lazy(() => import('@/pages/RestaurantDetail').then(module => ({ default: module.RestaurantDetail })))
const Submit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })))
const Profile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })))

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard').then(module => ({ default: module.AdminDashboard })))
const AdminRestaurants = lazy(() => import('@/pages/Admin/Restaurants').then(module => ({ default: module.AdminRestaurants })))
const AdminReports = lazy(() => import('@/pages/Admin/Reports').then(module => ({ default: module.AdminReports })))
const AdminCuisineTypes = lazy(() => import('@/pages/Admin/CuisineTypes').then(module => ({ default: module.AdminCuisineTypes })))
const AdminPetPolicies = lazy(() => import('@/pages/Admin/PetPolicies').then(module => ({ default: module.AdminPetPolicies })))
const AdminFeedback = lazy(() => import('@/pages/Admin/Feedback').then(module => ({ default: module.AdminFeedback })))
const AdminReviews = lazy(() => import('@/pages/Admin/Reviews').then(module => ({ default: module.AdminReviews })))

function App() {
  return (
    <AuthProvider>
      <CuisineTypesProvider>
        <PetPoliciesProvider>
          <Router>
            <Toaster position="top-right" richColors />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="restaurants" element={<AdminRestaurants />} />
                    <Route path="cuisine-types" element={<AdminCuisineTypes />} />
                    <Route path="pet-policies" element={<AdminPetPolicies />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="reviews" element={<AdminReviews />} />
                  </Route>
                </Route>


                {/* Catch all - Handle OAuth redirects or redirect to home */}
                <Route path="*" element={<AuthCallback />} />
              </Routes>
            </Suspense>
            
            {/* Global Feedback Button */}
            <FeedbackButton />
          </Router>
        </PetPoliciesProvider>
      </CuisineTypesProvider>
    </AuthProvider>
  )
}

function AuthCallback() {
  const { user } = useAuth()
  
  // If user is already authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />
  }

  // If URL contains auth params (access_token, etc.), show loading
  // HashRouter treats the hash fragment as the path
  const hash = window.location.hash
  if (hash && (hash.includes('access_token') || hash.includes('error_description'))) {
    return <LoadingScreen />
  }

  // Check the router location pathname as well just in case
  const path = window.location.hash.slice(1) // remove #
  if (path.startsWith('/access_token') || path.startsWith('access_token')) {
     return <LoadingScreen />
  }

  // Otherwise, if it's just a random 404, redirect to home
  return <Navigate to="/" replace />
}

export default App
