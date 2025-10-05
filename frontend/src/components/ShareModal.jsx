import React from 'react'


export default function ShareModal({ open, onClose, onShare }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded p-6 w-full max-w-md">
                <h3 className="font-semibold">Share Story</h3>
                <p className="text-sm text-gray-600 mt-2">Choose a circle to share with</p>
                <div className="mt-4">
                    {/* Placeholder: replace with dynamic list */}
                    <select className="w-full border rounded p-2">
                        <option>Family - Adults</option>
                        <option>All Members</option>
                    </select>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => { onShare && onShare(); onClose && onClose() }}>Share</button>
                </div>
            </div>
        </div>
    )
}