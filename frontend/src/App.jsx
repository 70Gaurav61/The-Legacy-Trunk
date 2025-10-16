import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import FamilyTree from "./components/FamilyTree";

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />

        <main className="container py-6">
          <Routes>
            {/* If user exists → go to dashboard, else login */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Navigate to="/auth/login" />}
            />

            {/* Public routes */}
            {!user && (
              <>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
              </>
            )}

            {/* Private routes (only if user exists) */}
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
                <Route path="/family-tree" element={<FamilyTree />} />
              </>
            )}

            {/* Catch all unmatched routes */}
            {/* <Route path="*" element={<Navigate to="/" />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
