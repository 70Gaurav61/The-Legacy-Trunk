import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // 🟢 Added Outlet
import { useAuth } from "./services/useAuth";

import Header from "./components/Header";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Create from "./pages/Create";
import TimelinePage from "./pages/TimelinePage";
import Circles from "./pages/Circles";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Choose from "./pages/Choose";
import TreePage from "./pages/TreePage";
import CreateStory from "./pages/CreateStory";
import PrivateGallery from "./pages/PrivateGallery";

// 🟢 1. Create a Layout for standard pages (Restores the container look)
const StandardLayout = () => (
  <div className="container mx-auto px-4 py-6">
    <Outlet />
  </div>
);

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* 🟢 2. REMOVED "container" from here. Now Main is full width. */}
        <main className="flex-1 w-full p-3 bg-gray-50">
          <Routes>
            {/* Redirect logic */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Navigate to="/auth/login" />}
            />

            {/* Public Routes (Wrapped in StandardLayout to keep them centered) */}
            {!user && (
              <Route element={<StandardLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
              </Route>
            )}

            {/* Private Routes */}
            {user && (
              <>

                <Route path="/home" element={<Home />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:id" element={<StoryDetail />} />
                <Route path="/create" element={<Create />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/circles" element={<Circles />} />
                <Route path="/choose" element={<Choose />} />
                <Route path="/join" element={<Join />} />
                <Route path="/create-story" element={<CreateStory />} />
                <Route path="/family-tree" element={<TreePage />} />
                <Route path="/private" element={<PrivateGallery />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}