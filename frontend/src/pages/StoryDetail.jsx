import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import ShareModal from '../components/ShareModal'


export default function StoryDetail(){
const { id } = useParams()
const [openShare, setOpenShare] = useState(false)


// TODO: fetch story by id
const story = { id, title: 'Sample Story', body: 'Full story content goes here...', date: '1960-01-01', authorName: 'Ava' }


return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-2xl font-bold">{story.title}</h2>
<div>
<button className="px-3 py-1 rounded border mr-2">Edit</button>
<button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => setOpenShare(true)}>Share</button>
</div>
</div>
<div className="card">
<div className="text-sm text-gray-500">By {story.authorName} • {story.date}</div>
<div className="mt-3 text-gray-800">{story.body}</div>
</div>


<ShareModal open={openShare} onClose={() => setOpenShare(false)} onShare={() => alert('Shared (mock)')} />
</div>
)
}