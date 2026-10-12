import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../');
dotenv.config({path:path.join(root,'.env')});
if(!process.env.MONGODB_URI){console.error('MONGODB_URI is required. Copy .env.example to .env and configure local MongoDB.');process.exit(1);}
process.env.TZ=process.env.APP_TIMEZONE||process.env.TZ||'Asia/Kolkata';
const {connectMongo}=await import('../src/config/db.js');
if(!await connectMongo(process.env.MONGODB_URI)){console.error('MongoDB connection failed; no seed records were written.');process.exit(1);}
const {Content,Theatre,Screen,Screening,Submission,User}=await import('../src/models/index.js');
const {demoContent}=await import('../src/data/catalog.js');
const {demoTheatres,getScreeningsForDate,localDate}=await import('../src/data/demoStore.js');
const names=['Cosmic Galaxy Cinemas','Infinity Multiplex','Dragon Realm Screens','Starforge Cinemas','Eclipse Grand Theatre','Nova Universe Multiplex','Titan Cinemas','Aurora Fantasy Screens','Quantum Galaxy Theatre','Celestial Prime Cinemas'];
const locations=['Vesper Reach · Fictional','Orion Vale · Fictional','Ashen Crown · Fictional','Emberfall · Fictional','Solstice Arc · Fictional','Nova Harbor · Fictional','Titan Ridge · Fictional','Aurora Spires · Fictional','Quantum Crossing · Fictional','Celestial Gate · Fictional'];
const titles=demoContent.map(x=>({...x,slug:x.id,approvedForScheduling:x.approvedForScheduling??!x.sampleOnly}));
const submissionSeed=[{title:'Doctor Doom: The Latverian Chronicle',productionCompany:'Copper Crown Pictures',releaseDate:'2027-10-15',status:'Pending Review',contentId:'doctor-doom',genre:'Fantasy',language:'English',duration:130,description:'Fictional demonstration submission; release details are unverified.'},{title:'The Last Starship',productionCompany:'Nebula Forge Studio',releaseDate:'2026-12-04',status:'Pending Review',genre:'Sci-Fi',language:'English',duration:124,description:'Fictional demonstration submission.'},{title:'Kingdom of Ash',productionCompany:'Mythic Lantern Films',releaseDate:'2026-08-12',status:'Approved',contentId:'kingdom-of-ash',genre:'Fantasy',language:'Telugu',duration:146,description:'Fictional demonstration submission approved for screen scheduling.'},{title:'Red Comet',productionCompany:'Orbit & Oak',releaseDate:'2026-06-18',status:'Rejected',genre:'Action',language:'English',duration:112,description:'Fictional demonstration submission rejected in sample review.'}];
try{
 await Content.deleteMany({sampleOnly:true});
 await Content.bulkWrite(titles.map(x=>({updateOne:{filter:{slug:x.slug},update:{$set:x},upsert:true}})));
 const theatresBySlug=new Map(),screensById=new Map();
 for(let t=0;t<names.length;t++){const slug=`theatre-${t+1}`;const theatre=await Theatre.findOneAndUpdate({slug},{name:names[t],slug,location:locations[t],operationalStatus:(t===4||t===7)?'Partial maintenance':'Operational',fictional:true,sampleData:true},{upsert:true,new:true});theatresBySlug.set(slug,theatre);
  for(let s=0;s<3;s++){const screenId=`T${String(t+1).padStart(2,'0')}-S${String(s+1).padStart(2,'0')}`;const maintenance=(t===4&&s===2)||(t===7&&s===1);const screen=await Screen.findOneAndUpdate({screenId},{screenId,theatreId:theatre._id,name:`Screen ${String(s+1).padStart(2,'0')}`,number:s+1,capacity:132+((t*19+s*37)%168),type:['Standard','3D','IMAX-style'][(t+s)%3],operationalStatus:maintenance?'Under Maintenance':'Operational',maintenanceWindows:[]},{upsert:true,new:true});screensById.set(screenId,screen);}
 }
 const contentBySlug=new Map((await Content.find()).map(x=>[x.slug,x]));
 const scheduleSeeds=[];const base=new Date(`${localDate()}T12:00:00`);
 for(let offset=-6;offset<=14;offset++){const day=new Date(base);day.setDate(base.getDate()+offset);for(const entry of getScreeningsForDate(localDate(day))){const theatre=theatresBySlug.get(entry.theatreId),content=contentBySlug.get(entry.contentId);if(!theatre||!screensById.has(entry.screenId))continue;scheduleSeeds.push({screenId:entry.screenId,theatreId:theatre._id,contentId:content?._id||null,date:entry.date,startTime:entry.startTime,endTime:entry.endTime,startAt:new Date(entry.startAt),endAt:new Date(entry.endAt),duration:entry.duration||110,maintenance:Boolean(entry.maintenance),sampleData:true});}}
 await Screening.deleteMany({sampleData:true});
 if(scheduleSeeds.length)await Screening.insertMany(scheduleSeeds);
 await Submission.deleteMany({sample:true});await Submission.insertMany(submissionSeed.map(x=>({...x,sample:true})));
 const email=process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();const password=process.env.SEED_ADMIN_PASSWORD;if(email||password){if(!email||!password||password.length<14)throw new Error('SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 14 characters must both be provided.');const passwordHash=await bcrypt.hash(password,12);await User.findOneAndUpdate({email},{name:'Administrator',email,passwordHash,role:'admin'},{upsert:true,new:true});console.log(`Seeded privileged Administrator account: ${email}`);}
 console.log(`Seeded ${titles.length} catalogue entries, ${names.length} fictional theatres, 30 screens, ${scheduleSeeds.length} sample screening/maintenance blocks, and ${submissionSeed.length} fictional submissions.`);
}catch(error){console.error(`Seed failed: ${error.message}`);process.exitCode=1;}finally{await mongoose.disconnect();}
