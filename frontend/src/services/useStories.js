import { useQuery } from '@tanstack/react-query'
import api from '../services/api'


export function useStories() {
    return useQuery(['stories'], async () => {
        const res = await api.get('/stories')
        return res.data
    })
}