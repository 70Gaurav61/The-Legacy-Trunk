import React from 'react'
import Timeline from '../components/Timeline'


const sampleEvents = [
    { id: 'e1', title: 'Founding Day', description: 'When the family started...', date: '1920-03-12' },
    { id: 'e2', title: 'First Caravan', description: 'The first touring troupe...', date: '1935-07-20' }
]


export default function TimelinePage() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Timeline</h2>
            <Timeline events={sampleEvents} />
        </div>
    )
}