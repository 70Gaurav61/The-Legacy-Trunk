import React from 'react'
import { Link, NavLink } from 'react-router-dom'


export default function Header() {
    return (
        <header className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 text-white py-4 shadow">
            <div className="container flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold">Legacy Trunk</Link>
                <nav className="flex items-center gap-4">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'underline' : ''}>Home</NavLink>
                    <NavLink to="/stories" className={({ isActive }) => isActive ? 'underline' : ''}>Stories</NavLink>
                    <NavLink to="/timeline" className={({ isActive }) => isActive ? 'underline' : ''}>Timeline</NavLink>
                    <NavLink to="/create" className={({ isActive }) => isActive ? 'underline' : ''}>Create</NavLink>
                    <NavLink to="/circles" className={({ isActive }) => isActive ? 'underline' : ''}>Circles</NavLink>
                    <NavLink to="/auth/login" className="ml-4">Login</NavLink>
                </nav>
            </div>
        </header>
    )
}