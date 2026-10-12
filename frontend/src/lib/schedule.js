export const statusTone = status => ({'NOW PLAYING':'badge-live',UPCOMING:'badge-muted','STARTING SOON':'badge-warn',COMPLETED:'badge-muted','UNDER MAINTENANCE':'badge-warn',AVAILABLE:'badge-ok'}[String(status||'').toUpperCase()]||'badge-muted');
export function todayLocal(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function addDays(value,count){const d=new Date(`${value}T12:00:00`);d.setDate(d.getDate()+count);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function niceDate(value){return new Date(`${value}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});}
