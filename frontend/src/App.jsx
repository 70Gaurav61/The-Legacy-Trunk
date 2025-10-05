import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Create from './pages/Create'
import TimelinePage from './pages/TimelinePage'
import Circles from './pages/Circles'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <main className="container py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/create" element={<Create />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}