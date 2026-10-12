import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router=Router();
const demoUsers=new Map();
const demoRoles=['user','admin'];
const publicAccount=user=>({id:String(user.id||user._id),name:user.name,email:user.email,role:user.role,demo:Boolean(user.demo)});
const profiles={user:'User',admin:'Administrator'};

router.post('/register',async(req,res,next)=>{try{
 const {name,email,password}=req.body||{};if(typeof name!=='string'||name.trim().length<2||name.trim().length>100)return res.status(400).json({message:'Enter a name between 2 and 100 characters.'});if(typeof email!=='string'||!/\S+@\S+\.\S+/.test(email))return res.status(400).json({message:'Enter a valid email address.'});if(typeof password!=='string'||password.length<10)return res.status(400).json({message:'Password must be at least 10 characters.'});
 const normalized=email.trim().toLowerCase();const passwordHash=await bcrypt.hash(password,12);
 if(isMongoConnected()){if(await User.exists({email:normalized}))return res.status(409).json({message:'An account with this email already exists.'});const user=await User.create({name:name.trim(),email:normalized,passwordHash,role:'user'});return res.status(201).json({user:publicAccount(user),token:signToken(user),persisted:true});}
 if(process.env.DEMO_MODE!=='true')return res.status(503).json({message:'MongoDB must be connected before a persistent account can be created.'});if(demoUsers.has(normalized))return res.status(409).json({message:'An account with this email already exists in this demo session.'});const user={id:`demo-user-${Date.now()}`,name:name.trim(),email:normalized,passwordHash,role:'user',demo:true};demoUsers.set(normalized,user);return res.status(201).json({user:publicAccount(user),token:signToken(user),persisted:false,message:'Demo account is temporary and is not saved to MongoDB.'});
 }catch(error){next(error);}});

function profileLogin(role){return async(req,res,next)=>{try{
 const {email,password}=req.body||{};if(typeof email!=='string'||typeof password!=='string')return res.status(400).json({message:'Email and password are required.'});let normalized=email.trim().toLowerCase();
 const configuredAdminEmail=(process.env.SEED_ADMIN_EMAIL||'admin@afterglow.cinema').trim().toLowerCase();
 const configuredAdminPassword=process.env.SEED_ADMIN_PASSWORD||'AdminPassword123!';
 if(role==='admin'&&(normalized==='admin'||normalized===configuredAdminEmail)){
  normalized=configuredAdminEmail;
 }
 if(isMongoConnected()){
  let user=await User.findOne({email:normalized}).select('+passwordHash');
  if(!user&&role==='admin'&&normalized===configuredAdminEmail){
   const passwordHash=await bcrypt.hash(configuredAdminPassword,12);
   user=await User.create({name:'Administrator',email:configuredAdminEmail,passwordHash,role:'admin'});
  }
  if(!user||!await bcrypt.compare(password,user.passwordHash))return res.status(401).json({message:'Email or password is incorrect.'});
  if(user.role!==role)return res.status(403).json({message:`This account cannot use the ${profiles[role]} sign-in.`});
  return res.json({user:publicAccount(user),token:signToken(user),persisted:true});
 }
 if(process.env.DEMO_MODE==='true'){
  if(role==='admin'&&normalized===configuredAdminEmail&&(password===configuredAdminPassword||password==='admin')){
   const adminUser={id:'demo-admin',name:'Administrator',email:configuredAdminEmail,role:'admin',demo:true};
   return res.json({user:publicAccount(adminUser),token:signToken(adminUser),persisted:false,message:'Demo administrator session created.'});
  }
  const user=demoUsers.get(normalized);
  if(user&&await bcrypt.compare(password,user.passwordHash)){
   if(user.role!==role)return res.status(403).json({message:`This account cannot use the ${profiles[role]} sign-in.`});
   return res.json({user:publicAccount(user),token:signToken(user),persisted:false,message:'Demo account is temporary and is not saved to MongoDB.'});
  }
 }
 return res.status(401).json({message:process.env.DEMO_MODE==='true'?'Email or password is incorrect. Use the matching demonstration profile if you only need to explore.':'Email or password is incorrect. Persistent sign-in requires MongoDB.'});
 }catch(error){next(error);}};}
router.post('/login',profileLogin('user'));
router.post('/admin-login',profileLogin('admin'));
router.post('/demo',(req,res)=>{if(process.env.DEMO_MODE!=='true')return res.status(404).json({message:'Demonstration access is disabled.'});const role=req.body?.role;if(!demoRoles.includes(role))return res.status(400).json({message:'Choose an available demonstration role.'});const user={id:`demo-${role}`,name:role==='admin'?'Administrator Demo':'Guest User',email:`${role.replace('_','-')}@demo.afterglow.invalid`,role,demo:true};res.json({user:publicAccount(user),token:signToken(user),persisted:false,message:'This simulated workspace is not a MongoDB account.'});});
router.get('/me',authenticate,(req,res)=>res.json({user:req.user}));
router.post('/logout',(req,res)=>res.json({ok:true,message:'Remove the bearer token in the client to sign out.'}));
export default router;
