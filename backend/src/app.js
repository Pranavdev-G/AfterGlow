import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMongoConnected } from './config/db.js';
import apiRoutes from './routes/index.js';

const app=express();
app.disable('x-powered-by');
// Preserve Manus Preview embedding: avoid frame-ancestor/X-Frame-Options self/deny policies here; the published deployment must apply an embedding-compatible CSP.
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'},contentSecurityPolicy:false,frameguard:false}));
app.use(express.json({limit:'1mb'}));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'afterglow-api',mongoConnected:isMongoConnected(),demoMode:process.env.DEMO_MODE==='true',message:isMongoConnected()?'MongoDB connected':process.env.DEMO_MODE==='true'?'Demonstration mode — data is temporary and is not stored in MongoDB.':'Database unavailable; persistence is disabled.'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:50,standardHeaders:true,legacyHeaders:false}));
app.use('/api',apiRoutes);

if(process.env.NODE_ENV==='production'){
 const frontendDist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../frontend/dist');
 app.use(express.static(frontendDist,{index:false,etag:true,maxAge:'7d'}));
 app.use((req,res,next)=>{
  if(!['GET','HEAD'].includes(req.method)||req.path==='/api'||req.path.startsWith('/api/')||path.extname(req.path))return next();
  return res.sendFile(path.join(frontendDist,'index.html'));
 });
}

app.use((req,res)=>res.status(404).json({message:'API route not found.'}));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);const status=err.status||400;console.error(`[api] ${req.method} ${req.path}: ${err.message}`);res.status(status).json({message:status>=500?'The server could not complete this request.':err.message});});
export default app;
