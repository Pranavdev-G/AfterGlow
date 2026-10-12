import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
const AuthContext=createContext(null);
function collectionIds(items){return (items||[]).map(x=>typeof x==='string'?x:x.slug||x.id||String(x._id));}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function AuthProvider({children}){
 const [user,setUser]=useState(null);const [health,setHealth]=useState({loading:true,online:false,demoMode:false,mongoConnected:false,message:'Connecting to the catalogue API…'});const [booting,setBooting]=useState(true);
 const enrich=async(account,persisted=false)=>{if(!account)return null;if(persisted&&!account.demo){try{const collections=await api('/me/collections');const watchlist=collectionIds(collections.watchlist),favourites=collectionIds(collections.favourites);account={...account,watchlist,favourites};localStorage.setItem('afterglow-watchlist',JSON.stringify(watchlist));localStorage.setItem('afterglow-favourites',JSON.stringify(favourites));}catch{/* Local cache remains a usable fallback if the collection route is unavailable. */}}setUser(account);return account;};
 useEffect(()=>{let live=true;const start=async()=>{let liveHealth={loading:false,online:false,demoMode:false,mongoConnected:false,message:'API unavailable — browser catalogue remains available.'};for(let attempt=0;attempt<16;attempt++){try{const data=await api('/health');liveHealth={loading:false,online:true,demoMode:Boolean(data.demoMode),mongoConnected:Boolean(data.mongoConnected),message:data.message};break;}catch{if(attempt<15)await delay(350);}}if(live)setHealth(liveHealth);const token=localStorage.getItem('afterglow-token');if(token){try{const result=await api('/auth/me');if(live)await enrich(result.user,liveHealth.mongoConnected&&!result.user.demo);}catch{localStorage.removeItem('afterglow-token');}}if(live)setBooting(false);};start();return()=>{live=false;};},[]);
 const signIn=async(path,credentials)=>{const result=await api(path,{method:'POST',body:credentials});localStorage.setItem('afterglow-token',result.token);return enrich(result.user,Boolean(result.persisted));};
 const login=credentials=>signIn('/auth/login',credentials);
 const adminLogin=credentials=>signIn('/auth/admin-login',credentials);
 const demoLogin=async role=>{const result=await api('/auth/demo',{method:'POST',body:{role}});localStorage.setItem('afterglow-token',result.token);return enrich(result.user,false);};
 const register=async details=>{const result=await api('/auth/register',{method:'POST',body:details});if(result.token)localStorage.setItem('afterglow-token',result.token);return enrich(result.user,Boolean(result.persisted));};
 const logout=async()=>{try{await api('/auth/logout',{method:'POST'});}catch{/* Stateless JWT; clear local session regardless. */}localStorage.removeItem('afterglow-token');setUser(null);};
 const value=useMemo(()=>({user,health,booting,login,adminLogin,demoLogin,register,logout,setUser}),[user,health,booting]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
