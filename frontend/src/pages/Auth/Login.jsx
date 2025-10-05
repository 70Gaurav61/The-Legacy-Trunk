import React, { useState } from 'react'


export default function Login(){
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')


function onSubmit(e){
e.preventDefault()
// TODO: call backend
alert('Login (mock)')
}


return (
<div className="max-w-md">
<h2 className="text-2xl font-bold mb-4">Login</h2>
<form onSubmit={onSubmit} className="space-y-4">
<div>
<label className="block text-sm font-medium">Email</label>
<input className="mt-1 block w-full border rounded p-2" value={email} onChange={e => setEmail(e.target.value)} />
</div>
<div>
<label className="block text-sm font-medium">Password</label>
<input type="password" className="mt-1 block w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} />
</div>
<div>
<button className="px-4 py-2 rounded bg-indigo-600 text-white">Sign in</button>
</div>
</form>
</div>
)
}