import { useState, useEffect } from 'react'


export function useAuth(){
const [user, setUser] = useState(null)
useEffect(() => {
// TODO: read token from localStorage and fetch /auth/me
}, [])
return { user, setUser }
}