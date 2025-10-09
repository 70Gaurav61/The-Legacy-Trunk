import React from 'react'
import { Link } from 'react-router-dom'


export default function Home() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome to Legacy Trunk</h1>
                    <p className="text-sm text-gray-600 mt-1">A private home for your family stories, photos, and memories.</p>
                </div>
                <div>
                    <Link to="/create" className="px-4 py-2 rounded bg-indigo-600 text-white">Create Story</Link>
                </div>
            </div>


            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="font-semibold">Recent Stories</h3>
                    <p className="text-sm text-gray-500 mt-2">View or continue editing recent contributions.</p>
                </div>
                <div className="card">
                    <h3 className="font-semibold">Timeline</h3>
                    <p className="text-sm text-gray-500 mt-2">Explore important family events mapped in time.</p>
                </div>
                <div className="card">
                    <h3 className="font-semibold">Circles</h3>
                    <p className="text-sm text-gray-500 mt-2">Manage who can see which stories.</p>
                </div>
            </section>
        </div>
    )
}