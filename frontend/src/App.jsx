import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/useAuth";

import Header from "./components/Header";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Create from "./pages/Create";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Choose from "./pages/Choose";
import TreePage from "./pages/TreePage";
import CreateStory from "./components/CreateStory";
import PrivateGallery from "./pages/PrivateGallery";
import StoryView from "./pages/StoryView";
import Profile from "./pages/Profile";
import PersonProfile from "./pages/PersonProfile";
import Landing from "./pages/Landing";
import Vault from "./components/Vault";
import TimeCapsule from "./components/TimeCapsule";
import CreatePost from "./pages/CreatePost";

//1. Create a Layout for standard pages (Restores the container look)
const StandardLayout = () => (
  <div className="container mx-auto px-4 py-6">
    <Outlet />
  </div>
);

// 1. Basic Auth Route (Must be logged in, family doesn't matter)
const AuthRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
};

// 2. Family Route (Must be logged in AND have a family)
const FamilyRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!user.families || user.families.length === 0) return <Navigate to="/choose" replace />;
  return children;
};

// 3. Public Only Route (Must NOT be logged in - for Login/Signup)
const PublicOnlyRoute = ({ user, children }) => {
  if (user) {
    return user.families?.length > 0 ? <Navigate to="/home" replace /> : <Navigate to="/choose" replace />;
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
              element={<PublicOnlyRoute user={user}><Landing /></PublicOnlyRoute>}
            />

            {/* 2. Public Routes */}
            <Route element={<StandardLayout />}>
              <Route path="/auth/login" element={<PublicOnlyRoute user={user}><Login /></PublicOnlyRoute>} />
              <Route path="/auth/signup" element={<PublicOnlyRoute user={user}><Signup /></PublicOnlyRoute>} />
            </Route>

            {/* 3. Family Routes (Requires Auth AND Family) */}
            <Route path="/home" element={<FamilyRoute user={user}><Home /></FamilyRoute>} />
            <Route path="/create-story" element={<FamilyRoute user={user}><CreateStory /></FamilyRoute>} />
            <Route path="/family-tree" element={<FamilyRoute user={user}><TreePage /></FamilyRoute>} />
            <Route path="/private" element={<FamilyRoute user={user}><PrivateGallery /></FamilyRoute>} />
            <Route path="/vault" element={<FamilyRoute user={user}><Vault /></FamilyRoute>} />
            <Route path="/time-capsule" element={<FamilyRoute user={user}><TimeCapsule /></FamilyRoute>} />
            <Route path="/create-post" element={<FamilyRoute user={user}><CreatePost /></FamilyRoute>} />

            {/* Profile Routes */}
            <Route path="/profile" element={<FamilyRoute user={user}><Profile /></FamilyRoute>} />
            <Route path="/profile/:id" element={<FamilyRoute user={user}><Profile /></FamilyRoute>} />
            <Route path="/person/:id" element={<FamilyRoute user={user}><PersonProfile /></FamilyRoute>} />

            {/* Story View Routes */}
            <Route path="/stories/:id" element={<FamilyRoute user={user}><StoryView /></FamilyRoute>} />
            <Route path="/stories/:id/edit" element={<FamilyRoute user={user}><StoryView initialEditMode={true} /></FamilyRoute>} />

            {/* 4. Auth Only Routes (Requires Auth, but NO Family needed) */}
            <Route path="/choose" element={<AuthRoute user={user}><Choose /></AuthRoute>} />
            <Route path="/join" element={<AuthRoute user={user}><Join /></AuthRoute>} />
            <Route path="/create" element={<AuthRoute user={user}><Create /></AuthRoute>} />

            {/* 4. Catch-all for undefined routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}