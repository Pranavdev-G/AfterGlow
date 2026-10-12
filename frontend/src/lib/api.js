export async function api(path, options = {}) {
  const token = localStorage.getItem('afterglow-token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`/api${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  let payload = {};
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) throw Object.assign(new Error(payload.message || `Request failed (${response.status})`), { status: response.status, payload });
  return payload;
}

export function readSaved(kind) {try { return JSON.parse(localStorage.getItem(`afterglow-${kind}`) || '[]'); } catch { return []; }}
export function setSaved(kind,values){localStorage.setItem(`afterglow-${kind}`,JSON.stringify(values));window.dispatchEvent(new CustomEvent('afterglow:saved',{detail:{kind,values}}));return values;}
export function toggleSaved(kind, id) {const values=readSaved(kind);return setSaved(kind,values.includes(id)?values.filter(item=>item!==id):[...values,id]);}
export async function saveContent(kind,id,user,health){const values=toggleSaved(kind,id);if(user&&!user.demo&&health?.mongoConnected){try{const result=await api(`/me/collections/${kind}/${encodeURIComponent(id)}`,{method:'POST'});const synced=result.saved?Array.from(new Set([...values,id])):values.filter(x=>x!==id);setSaved(kind,synced);return{values:synced,persisted:Boolean(result.persisted),error:null};}catch(error){return{values,persisted:false,error};}}return{values,persisted:false,error:null};}
export function onSaved(listener){const handler=event=>listener(event.detail);window.addEventListener('afterglow:saved',handler);return()=>window.removeEventListener('afterglow:saved',handler);}
