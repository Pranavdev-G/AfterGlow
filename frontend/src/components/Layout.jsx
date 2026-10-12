import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bookmark, CalendarDays, Clapperboard, Film, Heart, Home, LogIn, LogOut, Menu, Search, ShieldCheck, Sparkles, X, Building2, Bell, Settings2 } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';

const primary = [
  { to: '/', label: 'Discover', icon: Home },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/shows', label: 'Series', icon: Clapperboard },
];
const userMobile = [
  primary[0], primary[1],
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { to: '/favourites', label: 'Favourites', icon: Heart },
];
const adminMobile = [
  primary[0],
  { to: '/theatres', label: 'Screens', icon: Building2 },
  { to: '/production', label: 'Schedule', icon: CalendarDays },
  { to: '/admin', label: 'Manage', icon: Settings2 },
];

export function AppLayout() {
  const { user, health, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const authPage = !user && ['/login', '/register', '/admin-login'].includes(location.pathname);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname]);

  const roleLinks = user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Command', icon: ShieldCheck },
        { to: '/admin/submissions', label: 'Releases', icon: Bell },
        { to: '/theatres', label: 'Theatres', icon: Building2 },
        { to: '/production', label: 'Production', icon: CalendarDays },
        { to: '/reports', label: 'Reports', icon: BarChart3 },
      ]
    : user
      ? [
          { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
          { to: '/favourites', label: 'Favourites', icon: Heart },
        ]
      : [];

  const submitSearch = event => {
    event.preventDefault();
    navigate(`/movies?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const signOut = async () => {
    await logout();
    navigate('/login');
  };

  const footerLinks = user?.role === 'admin'
    ? <><Link to="/movies">Catalogue</Link><Link to="/theatres">Theatres</Link><Link to="/reports">Reports</Link></>
    : <><Link to="/movies">Catalogue</Link><Link to="/watchlist">Watchlist</Link><Link to="/login">Account</Link></>;

  return <div className="app-shell">
    <header className={authPage ? 'topbar auth-topbar' : 'topbar'}>
      <Link className="brand" to="/" aria-label="Afterglow home"><span className="brand-mark"><img src="/afterglow-mark.svg" width="30" height="30" alt=""/></span><span className="brand-name">AFTER<span>GLOW</span></span></Link>
      {user && <nav className="navlinks" aria-label="Primary navigation">
        {primary.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}>{item.label}</NavLink>)}
        {roleLinks.map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
      </nav>}
      <div className="top-actions">
        {user && (searchOpen
          ? <form className="searchbox hide-mobile" style={{maxWidth:220}} onSubmit={submitSearch}><Search size={14}/><input className="field" autoFocus placeholder="Find a title…" value={query} onChange={e=>setQuery(e.target.value)}/></form>
          : <button className="icon-button hide-mobile" aria-label="Search movies" onClick={()=>setSearchOpen(true)}><Search size={15}/></button>)}
        {user && health.demoMode && <span className="role-chip hide-mobile"><span className="status-dot"/>Demo</span>}
        {user
          ? <><span className="role-chip hide-mobile">{user.role === 'admin' ? 'administrator' : 'user'}</span><button className="icon-button" onClick={signOut} aria-label="Log out"><LogOut size={15}/><span className="hide-mobile">Exit</span></button></>
          : <div className="auth-entry-links"><Link className="ghost-button" to="/login"><LogIn size={14}/> User sign-in</Link><Link className="ghost-button admin-entry" to="/admin-login"><ShieldCheck size={14}/> Admin</Link></div>}
        {user && <button className="icon-button mobile-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>}
      </div>
    </header>

    {user && menuOpen && <div className="mobile-menu" role="dialog" aria-label="Navigation menu">{[...primary,...roleLinks].map(item=><NavLink key={item.to} to={item.to}><item.icon size={16}/>{item.label}</NavLink>)}<button onClick={signOut}><LogOut size={16}/>Sign out</button></div>}
    {(health.demoMode || (!health.online && !health.loading)) && <div className="demo-banner"><Sparkles size={13}/><span><b>Demonstration data</b> · {health.online ? 'MongoDB is not connected. Changes are temporary and are not saved to the database.' : 'The API is unavailable. This browser-only sample catalogue cannot save changes.'}</span></div>}
    <main><Outlet/></main>
    <footer className="footer"><div><span className="brand-name">AFTER<span>GLOW</span></span><div style={{marginTop:6}}>Cinematic discovery · Curated stories · Sample data</div></div><div className="footer-links">{footerLinks}</div><div>© 2026 Afterglow · Not affiliated with film studios</div></footer>
    {user && <nav className="mobile-nav" aria-label="Mobile navigation">{(user.role === 'admin' ? adminMobile : userMobile).map(item=><NavLink key={item.to} to={item.to} end={item.to === '/'}><item.icon size={17}/><span>{item.label}</span></NavLink>)}</nav>}
  </div>;
}

export function ProtectedRoute({ roles, children }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <div className="page-wrap"><div className="empty-state"><Sparkles/><p>Entering the archive…</p></div></div>;
  if (!user) return <Navigate to={roles?.includes('admin') ? '/admin-login' : '/login'} replace state={{from:location.pathname}} />;
  if (roles && !roles.includes(user.role)) return <div className="page-wrap"><div className="empty-state"><ShieldCheck/><div><h3>Role access is restricted</h3><p>Your account does not have permission for this workspace.</p><Link className="text-link" to="/">Return to discovery →</Link></div></div></div>;
  return children;
}

export function ToastHub() {
  const [toasts,setToasts]=useState([]);
  useEffect(()=>{const onToast=e=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,...e.detail}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3800);};window.addEventListener('afterglow:toast',onToast);return()=>window.removeEventListener('afterglow:toast',onToast);},[]);
  return <div className="toast-stack" aria-live="polite">{toasts.map(t=><div className={`toast ${t.kind||''}`} key={t.id}><Sparkles size={15}/><span>{t.message}</span></div>)}</div>;
}
export const notify = (message, kind='') => window.dispatchEvent(new CustomEvent('afterglow:toast',{detail:{message,kind}}));
