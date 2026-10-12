import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';
export function signToken(user){return jwt.sign({sub:String(user.id||user._id),role:user.role,email:user.email,demo:Boolean(user.demo)},process.env.JWT_SECRET,{expiresIn:'8h',issuer:'afterglow-api'});}
export async function authenticate(req,res,next){
 const value=req.headers.authorization||'';const token=value.startsWith('Bearer ')?value.slice(7):null;if(!token)return res.status(401).json({message:'Sign in to continue.'});
 try{const claims=jwt.verify(token,process.env.JWT_SECRET,{issuer:'afterglow-api'});if(claims.demo&&process.env.DEMO_MODE==='true'){req.user={id:claims.sub,email:claims.email,role:claims.role,demo:true};return next();}if(!isMongoConnected())return res.status(503).json({message:'MongoDB is unavailable; only explicitly enabled demonstration access can authenticate.'});const user=await User.findById(claims.sub).select('_id name email role');if(!user)return res.status(401).json({message:'Account not found.'});req.user={id:String(user._id),name:user.name,email:user.email,role:user.role,demo:false};next();}
 catch{return res.status(401).json({message:'Session is invalid or has expired. Please sign in again.'});}
}
export const allowRoles=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({message:'Your account is not authorized for this operation.'});
