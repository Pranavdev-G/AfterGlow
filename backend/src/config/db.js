import mongoose from 'mongoose';
let connected=false;
export const isMongoConnected=()=>connected&&mongoose.connection.readyState===1;
export const mongoConnectionTimeoutMs=(environment=process.env.NODE_ENV)=>environment==='production'?15000:3500;
export async function connectMongo(uri){
 if(!uri){console.warn('[database] MONGODB_URI is not configured.');return false;}
 const timeoutMs=mongoConnectionTimeoutMs();
 try{await mongoose.connect(uri,{serverSelectionTimeoutMS:timeoutMs,connectTimeoutMS:timeoutMs});connected=true;mongoose.connection.on('disconnected',()=>{connected=false;console.warn('[database] MongoDB disconnected.');});mongoose.connection.on('connected',()=>{connected=true;});console.log('[database] MongoDB connected.');return true;}
 catch(error){connected=false;console.warn(`[database] MongoDB connection failed (${error.name||'Error'}). Check URI validity, TLS, network access and availability; credential details are omitted.`);return false;}
}
