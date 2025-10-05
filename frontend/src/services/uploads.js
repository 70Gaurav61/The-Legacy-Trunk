import api from './api'


export async function getPresign(filename, contentType){
const res = await api.post('/media/presign', { filename, contentType })
return res.data // { url, key }
}