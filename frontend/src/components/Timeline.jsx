import React from 'react'


export default function Timeline({events = []}){
return (
<div className="space-y-4">
{events.map(ev => (
<div key={ev.id} className="flex gap-4 items-start">
<div className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />
<div className="flex-1 bg-white rounded p-3 shadow">
<div className="text-sm text-gray-500">{ev.date}</div>
<div className="font-semibold mt-1">{ev.title}</div>
<div className="text-sm mt-2 text-gray-600">{ev.description}</div>
</div>
</div>
))}
</div>
)
}