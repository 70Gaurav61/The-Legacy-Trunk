import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './services/useAuth'
import Header from './components/Header'
import Home from './pages/Home'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Create from './pages/Create'
import TimelinePage from './pages/TimelinePage'
import Circles from './pages/Circles'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Choose from './components/Choose'
import CreateFamily from './components/CreateFamily'
import FamilyTree from './components/FamilyTree'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        {user && <Header user={user} />}
        <main className="container py-6">
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:id" element={<StoryDetail />} />
                <Route path="/create" element={<Create />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/circles" element={<Circles />} />
                <Route path="/choose" element={<Choose />} />
                <Route path="/familytree" element={<FamilyTree />} />
                <Route path="/createfamily" element={<CreateFamily />} />
                <Route path="/auth/login" element={<Navigate to="/" />} />
                <Route path="/auth/signup" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/auth/login" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
