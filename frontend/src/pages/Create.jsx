import React, { useState } from 'react'
import MediaUploader from '../components/MediaUploader'


export default function Create() {
    const [form, setForm] = useState({ title: '', body: '', tags: '' })
    const [files, setFiles] = useState([])


    function onSubmit(e) {
        e.preventDefault()
        // TODO: send to API + upload files
        console.log('Create story', form, files)
        alert('Saved (mock)')
    }


    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Create Story</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input className="mt-1 block w-full border rounded p-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Body</label>
                    <textarea rows={6} className="mt-1 block w-full border rounded p-2" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Tags (comma separated)</label>
                    <input className="mt-1 block w-full border rounded p-2" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>


                <div>
                    <label className="block text-sm font-medium">Media</label>
                    <div className="mt-2">
                        <MediaUploader onFiles={(f) => setFiles(f)} />
                        {files.length > 0 && <div className="mt-3 text-sm">{files.length} file(s) ready</div>}
                    </div>
                </div>


                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                    <button type="button" className="px-4 py-2 rounded border">Cancel</button>
                </div>
            </form>
        </div>
    )
}