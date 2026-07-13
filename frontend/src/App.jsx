import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./services/useAuth";

import Header from "./components/Header";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Create from "./pages/Create";
import Circles from "./pages/Circles";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Choose from "./pages/Choose";
import TreePage from "./pages/TreePage";
import CreateStory from "./components/CreateStory";
import PrivateGallery from "./pages/PrivateGallery";
import StoryView from "./pages/StoryView";
import Profile from "./pages/Profile";
import PersonProfile from "./pages/PersonProfile";
import Vault from "./components/Vault";
import TimeCapsule from "./components/TimeCapsule";
import CreatePost from "./pages/CreatePost";

// Layout for public pages
const StandardLayout = () => (
  <div className="container mx-auto px-4 py-6">
    <Outlet />
  </div>
);

// 🟢 Protected Route Wrapper
// This ensures the route exists in the manifest but redirects if not logged in
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

export default function App() {
  const { user, loading } = useAuth(); // Ensure your useAuth hook provides a loading state

  // Prevent "No routes matched" by waiting for the auth service to initialize
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 w-full p-3 bg-gray-50">
          <Routes>
            {/* 1. Root Redirect */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Navigate to="/auth/login" />}
            />

            {/* 2. Public Routes */}
            <Route element={<StandardLayout />}>
              <Route
                path="/auth/login"
                element={!user ? <Login /> : <Navigate to="/home" />}
              />
              <Route
                path="/auth/signup"
                element={!user ? <Signup /> : <Navigate to="/home" />}
              />
            </Route>

            {/* 3. Private Routes - Always defined, but access is controlled */}
            <Route path="/home" element={<ProtectedRoute user={user}><Home /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute user={user}><Create /></ProtectedRoute>} />
            <Route path="/circles" element={<ProtectedRoute user={user}><Circles /></ProtectedRoute>} />
            <Route path="/choose" element={<ProtectedRoute user={user}><Choose /></ProtectedRoute>} />
            <Route path="/join" element={<ProtectedRoute user={user}><Join /></ProtectedRoute>} />
            <Route path="/create-story" element={<ProtectedRoute user={user}><CreateStory /></ProtectedRoute>} />
            <Route path="/family-tree" element={<ProtectedRoute user={user}><TreePage /></ProtectedRoute>} />
            <Route path="/private" element={<ProtectedRoute user={user}><PrivateGallery /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute user={user}><Vault /></ProtectedRoute>} />
            <Route path="/time-capsule" element={<ProtectedRoute user={user}><TimeCapsule /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute user={user}><CreatePost /></ProtectedRoute>} />

            {/* Profile Routes */}
            <Route path="/profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
            <Route path="/person/:id" element={<ProtectedRoute user={user}><PersonProfile /></ProtectedRoute>} />

            {/* Story View Routes */}
            <Route path="/stories/:id" element={<ProtectedRoute user={user}><StoryView /></ProtectedRoute>} />
            <Route
              path="/stories/:id/edit"
              element={<ProtectedRoute user={user}><StoryView initialEditMode={true} /></ProtectedRoute>}
            />

            {/* 4. Catch-all for undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}