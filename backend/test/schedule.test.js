import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEnd, validateNoOverlap, deriveStatus, isValidDate } from '../src/services/schedule.js';
import { maintenanceBlocks } from '../src/services/schedule.js';
import { demoTheatres, getScreeningsForDate } from '../src/data/demoStore.js';

test('calculates a screening end time from content runtime',()=>{const result=calculateEnd('2026-10-12','19:00',120);assert.equal(result.endTime,'21:00');assert.equal(result.endAt.getTime()-result.startAt.getTime(),120*60000);});
test('rejects invalid calendar dates, time, and operating-hour violations',()=>{assert.equal(isValidDate('2026-02-30'),false);assert.throws(()=>calculateEnd('2026-13-12','19:00',90),/valid date/);assert.throws(()=>calculateEnd('2026-10-12','08:30',90),/09:00–23:30/);assert.throws(()=>calculateEnd('2026-10-12','22:30',90),/09:00–23:30/);});
test('rejects same-screen overlaps but allows a boundary-touching screening',()=>{const existing=[{screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T19:00:00'),endAt:new Date('2026-10-12T21:00:00')}];assert.throws(()=>validateNoOverlap({screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T20:00:00'),endAt:new Date('2026-10-12T22:00:00'),existing}),/overlaps another screening/);assert.equal(validateNoOverlap({screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T21:00:00'),endAt:new Date('2026-10-12T22:00:00'),existing}),true);});
test('rejects a maintenance intersection and ignores open availability blocks',()=>{assert.throws(()=>validateNoOverlap({screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T14:00:00'),endAt:new Date('2026-10-12T15:00:00'),maintenanceWindows:[{date:'2026-10-12',startTime:'13:30',endTime:'15:30'}]}),/maintenance/);assert.equal(validateNoOverlap({screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T14:00:00'),endAt:new Date('2026-10-12T15:00:00'),existing:[{screenId:'T01-S01',date:'2026-10-12',startAt:new Date('2026-10-12T09:00:00'),endAt:new Date('2026-10-12T18:00:00'),available:true}]}),true);});
test('derives NOW PLAYING, STARTING SOON, UPCOMING and COMPLETED labels from timestamps',()=>{const now=new Date('2026-10-12T18:00:00Z');const entry=(start,end)=>({startAt:new Date(start),endAt:new Date(end)});assert.equal(deriveStatus(entry('2026-10-12T17:00:00Z','2026-10-12T19:00:00Z'),now),'NOW PLAYING');assert.equal(deriveStatus(entry('2026-10-12T18:20:00Z','2026-10-12T20:00:00Z'),now),'STARTING SOON');assert.equal(deriveStatus(entry('2026-10-12T19:00:00Z','2026-10-12T21:00:00Z'),now),'UPCOMING');assert.equal(deriveStatus(entry('2026-10-12T16:00:00Z','2026-10-12T17:00:00Z'),now),'COMPLETED');assert.equal(deriveStatus({maintenance:true,startAt:now,endAt:now},now),'UNDER MAINTENANCE');assert.equal(deriveStatus({available:true,startAt:now,endAt:now},now),'AVAILABLE');});
test('seeds ten fictional theatres, thirty screens, coherent non-overlapping slots, and no pending Doctor Doom bookings',()=>{assert.equal(demoTheatres.length,10);assert.equal(demoTheatres.reduce((n,t)=>n+t.screens.length,0),30);const day='2026-10-12';const entries=getScreeningsForDate(day);assert.ok(entries.some(x=>x.maintenance));assert.ok(entries.some(x=>x.title==='Interstellar'));assert.ok(entries.some(x=>x.title==='Spider-Man'));assert.ok(entries.some(x=>x.title==='Iron Man'));assert.ok(entries.some(x=>x.title==='Hulk'));assert.ok(entries.some(x=>x.title==='Ok Kanmani'));assert.ok(entries.some(x=>x.title==='Hi Nanna'));assert.ok(entries.some(x=>x.title==='Dune'));assert.ok(entries.some(x=>x.title==='Avatar'));assert.ok(entries.some(x=>x.title==='Baahubali'));assert.ok(entries.every(x=>x.contentId!=='doctor-doom'));const grouped=new Map();for(const x of entries.filter(y=>!y.maintenance)){const list=grouped.get(x.screenId)||[];list.push(x);grouped.set(x.screenId,list);}for(const values of grouped.values()){values.sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));for(let i=1;i<values.length;i++)assert.ok(new Date(values[i].startAt)>=new Date(values[i-1].endAt),'sample runs must not overlap');}});


test('projects persistent maintenance windows and avoids duplicate full-day records',()=>{
 const date='2026-10-12';
 const windowScreen={screenId:'T01-S01',name:'Screen 01',operationalStatus:'Operational',theatreId:{slug:'theatre-1',name:'Cosmic Galaxy Cinemas',sampleData:true},maintenanceWindows:[{date,startTime:'13:00',endTime:'14:30',reason:'Lamp replacement'}]};
 const unavailable={screenId:'T02-S03',name:'Screen 03',operationalStatus:'Under Maintenance',theatreId:{slug:'theatre-2',name:'Infinity Multiplex',sampleData:true},maintenanceWindows:[]};
 const existing=[{screenId:'T02-S03',maintenance:true,startAt:new Date(`${date}T09:00:00`),endAt:new Date(`${date}T23:30:00`)}];
 const blocks=maintenanceBlocks(date,[windowScreen,unavailable],existing);
 assert.equal(blocks.length,1);
 assert.equal(blocks[0].screenId,'T01-S01');
 assert.equal(blocks[0].startTime,'13:00');
 assert.equal(blocks[0].endTime,'14:30');
 assert.equal(blocks[0].duration,90);
 assert.equal(blocks[0].title,'Lamp replacement');
 assert.equal(blocks[0].status,'UNDER MAINTENANCE');
 assert.equal(blocks[0].sampleData,true);
});
