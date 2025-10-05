import React from 'react'
import StoryCard from '../components/StoryCard'


const sample = [
{ id: '1', title: 'Origins of the Trunk', excerpt: 'How the family began its tradition...', authorName: 'Ava', date: '1950-04-12' },
{ id: '2', title: 'The Midnight Circus', excerpt: 'A story of a lost dog and a caravan...', authorName: 'Luca', date: '1975-10-02' }
]


export default function Stories(){
return (
<div className="space-y-4">
<h2 className="text-2xl font-bold">Stories</h2>
<div className="space-y-3">
{sample.map(s => <StoryCard key={s.id} story={s} />)}
</div>
</div>
)
}