export function formatDate(d){
if(!d) return ''
const dt = new Date(d)
return dt.toLocaleDateString()
}