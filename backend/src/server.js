import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../');
if(process.env.NODE_ENV!=='production')dotenv.config({path:path.join(root,'.env')});
const production=process.env.NODE_ENV==='production';
if(!process.env.DEMO_MODE)process.env.DEMO_MODE=production?'false':'true';
process.env.TZ=process.env.APP_TIMEZONE||process.env.TZ||'Asia/Kolkata';
if(!process.env.JWT_SECRET){
 if(production){console.error('[startup] JWT_SECRET is required in production.');process.exit(1);}
 process.env.JWT_SECRET='local-demo-secret-change-before-production';
 console.warn('[startup] Using a development-only JWT secret; set JWT_SECRET before deployment.');
}
if(production&&process.env.DEMO_MODE==='true'){
 console.error('[startup] DEMO_MODE must be false in production.');
 process.exit(1);
}
if(production&&!process.env.MONGODB_URI){
 console.error('[startup] MONGODB_URI is required in production.');
 process.exit(1);
}
const {default:app}=await import('./app.js');
const {connectMongo,isMongoConnected}=await import('./config/db.js');
const port=Number(production?(process.env.PORT||3000):(process.env.API_PORT||5000));
const start=async()=>{
 const connected=await connectMongo(process.env.MONGODB_URI);
 if(!connected&&!production&&process.env.DEMO_MODE!=='true'){
  console.error('[startup] MongoDB unavailable and DEMO_MODE is disabled; refusing to start without persistence.');
  process.exit(1);
 }
 if(!connected&&production){
  console.error('[startup] MongoDB is unavailable in production; refusing to serve without persistence.');
  process.exit(1);
 }
 const server=app.listen(port,'0.0.0.0',()=>console.log(`[startup] Express listening on 0.0.0.0:${port} (${isMongoConnected()?'MongoDB':'temporary demo mode'}).`));
 server.on('error',err=>{console.error(`[startup] Could not bind application port ${port}: ${err.message}`);process.exit(1);});
};
start();
