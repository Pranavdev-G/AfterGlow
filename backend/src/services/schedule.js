import { demoTheatres, getScreeningsForDate } from '../data/demoStore.js';
export { deriveStatus } from '../data/demoStore.js';
export const OPENS_AT=9*60;
export const CLOSES_AT=23*60+30;
export function parseTime(value){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value||''))return null;const [h,m]=value.split(':').map(Number);return h*60+m;}
export function isValidDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(`${value}T12:00:00`);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
export function calculateEnd(date,startTime,duration){const startMin=parseTime(startTime);if(!isValidDate(date)||startMin===null||!Number.isFinite(Number(duration))||Number(duration)<1)throw Object.assign(new Error('Enter a valid date, start time, and content duration.'),{status:400});const endMin=startMin+Number(duration);if(startMin<OPENS_AT||endMin>CLOSES_AT)throw Object.assign(new Error('Screenings must fit within the screen operating window (09:00–23:30).'),{status:400});const startAt=new Date(`${date}T${startTime}:00`);const endAt=new Date(startAt.getTime()+Number(duration)*60000);return {endTime:`${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`,startAt,endAt};}
export function maintenanceBlocks(date,screens,existing=[]){
 if(!isValidDate(date))return [];
 const blocks=[];
 const covers=(screenId,start,end)=>existing.some(event=>{
  if(event.screenId!==screenId||!event.maintenance)return false;
  const eventStart=new Date(event.startAt).getTime(),eventEnd=new Date(event.endAt).getTime();
  return Number.isFinite(eventStart)&&Number.isFinite(eventEnd)&&eventStart<=start&&eventEnd>=end;
 });
 const makeBlock=(screen,startTime,endTime,reason='Scheduled maintenance window')=>{
  const startMinute=parseTime(startTime),endMinute=parseTime(endTime);
  if(startMinute===null||endMinute===null||startMinute<OPENS_AT||endMinute>CLOSES_AT||endMinute<=startMinute)return null;
  const startAt=new Date(`${date}T${startTime}:00`),endAt=new Date(`${date}T${endTime}:00`);
  return {id:`maintenance-${screen.screenId}-${date}-${startTime}`,screenId:screen.screenId,screenName:screen.name||screen.screenId,theatreId:screen.theatreId?.slug||String(screen.theatreId||''),theatreName:screen.theatreId?.name||'Fictional theatre',date,startTime,endTime,startAt:startAt.toISOString(),endAt:endAt.toISOString(),duration:endMinute-startMinute,title:reason,contentId:null,status:'UNDER MAINTENANCE',maintenance:true,sampleData:Boolean(screen.theatreId?.sampleData)};
 };
 for(const screen of screens){
  const screenId=screen.screenId;
  if(String(screen.operationalStatus||'').toLowerCase().includes('maintenance')){
   const start=new Date(`${date}T09:00:00`).getTime(),end=new Date(`${date}T23:30:00`).getTime();
   if(!covers(screenId,start,end)){const block=makeBlock(screen,'09:00','23:30');if(block)blocks.push(block);}
   continue;
  }
  for(const window of screen.maintenanceWindows||[]){
   if(window.date!==date)continue;
   const startMinute=parseTime(window.startTime),endMinute=parseTime(window.endTime);
   if(startMinute===null||endMinute===null||startMinute<OPENS_AT||endMinute>CLOSES_AT||endMinute<=startMinute)continue;
   const start=new Date(`${date}T${window.startTime}:00`).getTime(),end=new Date(`${date}T${window.endTime}:00`).getTime();
   if(covers(screenId,start,end))continue;
   const block=makeBlock(screen,window.startTime,window.endTime,window.reason||'Scheduled maintenance window');if(block)blocks.push(block);
  }
 }
 return blocks;
}

export function validateNoOverlap({screenId,date,startAt,endAt,maintenanceWindows=[],existing=[]}){const start=new Date(startAt).getTime(),end=new Date(endAt).getTime();if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw Object.assign(new Error('The requested screening window is invalid.'),{status:400});const windows=[...maintenanceWindows.filter(x=>x.date===date).map(x=>({startAt:new Date(`${date}T${x.startTime}:00`),endAt:new Date(`${date}T${x.endTime}:00`),label:'maintenance'})),...existing.filter(x=>x.screenId===screenId&&x.date===date&&!x.maintenance&&!x.available)];const conflict=windows.find(x=>start<new Date(x.endAt).getTime()&&end>new Date(x.startAt).getTime());if(conflict)throw Object.assign(new Error(conflict.label==='maintenance'?'This screen is under maintenance during that time.':'This time overlaps another screening on the selected screen.'),{status:409});return true;}
export function deriveAvailability(date,screenId,screenings){const screen=demoTheatres.flatMap(t=>t.screens).find(s=>s.id===screenId);if(screen?.maintenance)return'UNDER MAINTENANCE';const now=new Date();const active=(screenings||getScreeningsForDate(date)).find(x=>x.screenId===screenId&&new Date(x.startAt)<=now&&now<new Date(x.endAt));return active?'NOW PLAYING':'AVAILABLE';}
