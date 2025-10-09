import React from 'react'
import { Link } from 'react-router-dom'


export default function StoryCard({ story }) {
    return (
        <article className="card">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold"><Link to={`/stories/${story.id}`}>{story.title}</Link></h3>
                    <p className="text-sm text-gray-600 mt-1">{story.excerpt || story.body?.slice(0, 120)}</p>
                    <div className="mt-3 text-xs text-gray-500">By {story.authorName || 'Unknown'} • {story.date}</div>
                </div>
            </div>
        </article>
    )
}