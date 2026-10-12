import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Clock3, Heart, MapPin, Star } from 'lucide-react';
import { allContent, findContent } from '../data/catalog.js';
import { PosterCard, PosterArtwork } from '../components/PosterCard.jsx';
import { Badge } from '../components/Controls.jsx';
import { api, readSaved, saveContent } from '../lib/api.js';
import { notify } from '../components/Layout.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function ContentDetailPage() {
  const { id } = useParams();
  const { user, health, setUser } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [item, setItem] = useState(() => findContent(id));
  const [screenings, setScreenings] = useState([]);
  const [saved, setSaved] = useState(() => readSaved('watchlist').includes(id));
  const [fav, setFav] = useState(() => readSaved('favourites').includes(id));

  useEffect(() => {
    api(`/catalog/${id}`).then(r => r.item && setItem(r.item)).catch(() => setItem(findContent(id)));
    if (isAdmin) api(`/screenings?contentId=${encodeURIComponent(id)}&limit=5`).then(r => setScreenings((r.items || []).filter(x => !x.available))).catch(() => setScreenings([]));
    else setScreenings([]);
  }, [id, isAdmin]);

  useEffect(() => {
    if (user && !user.demo && health.mongoConnected) {
      setSaved((user.watchlist || []).includes(id));
      setFav((user.favourites || []).includes(id));
    }
  }, [user, health.mongoConnected, id]);

  if (!item) return <div className="page-wrap"><div className="empty-state"><div><h3>Title not found</h3><Link to="/movies" className="text-link">Back to catalogue →</Link></div></div></div>;

  const related = allContent.filter(c => c.id !== item.id && (c.genre === item.genre || c.type === item.type)).slice(0, 5);
  const toggle = async kind => {
    const result = await saveContent(kind, item.id, user, health);
    if (kind === 'watchlist') setSaved(result.values.includes(item.id));
    else setFav(result.values.includes(item.id));
    if (result.persisted && setUser) setUser(prev => prev ? { ...prev, [kind]: result.values } : prev);
    if (result.error) notify(`${item.title} changed in this browser, but database sync failed: ${result.error.message}`, 'error');
    else notify(`${item.title} ${result.values.includes(item.id) ? 'saved to' : 'removed from'} ${kind === 'watchlist' ? 'Watchlist' : 'Favourites'}${result.persisted ? ' in your account' : ' in this browser (temporary demo data)'}.`);
  };

  return (
    <div className="page-wrap">
      <Link to={item.type === 'show' ? '/shows' : '/movies'} className="text-link"><ArrowLeft size={14}/> Back to catalogue</Link>
      <section className="content-backdrop detail-page-backdrop">
        <div className="detail-row">
          <div className="detail-poster">
            <PosterArtwork item={item} detail/>
            {item.posterSourceUrl && <a className="poster-attribution" href={item.posterSourceUrl} target="_blank" rel="noopener noreferrer">Poster source: {item.posterCredit || 'source page'} ↗</a>}
          </div>
          <div className="detail-content">
            <div className="eyebrow">{item.type === 'show' ? 'Series dossier' : 'Feature dossier'} · {item.language}</div>
            <h1>{item.title}</h1>
            <p className="page-subtitle">{item.description}</p>
            <div className="detail-facts">
              <Badge>{item.year}</Badge><Badge>{item.genre}</Badge>
              {item.rating && <Badge tone="badge-live"><Star size={11} fill="currentColor"/> {item.rating}</Badge>}
              <Badge><Clock3 size={11}/> {item.seasons ? `${item.seasons} seasons` : item.duration ? `${item.duration} min` : 'Duration varies'}</Badge>
              {item.status?.includes('Sample') && <Badge tone="badge-warn">Sample / unverified</Badge>}
            </div>
            <p className="tagline">“{item.tagline || 'A story worth discovering.'}”</p>
            {item.director && <p className="small-facts"><b>Director</b> {item.director}{item.cast ? ` · Cast ${item.cast}` : ''}</p>}
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => toggle('watchlist')}><Bookmark size={14} fill={saved ? 'currentColor' : 'none'}/>{saved ? 'In watchlist' : 'Add to watchlist'}</button>
              <button className="btn btn-outline" onClick={() => toggle('favourites')}><Heart size={14} fill={fav ? 'currentColor' : 'none'}/>{fav ? 'Favourited' : 'Add favourite'}</button>
            </div>
          </div>
        </div>
      </section>
      <div className={`detail-info-grid ${isAdmin ? '' : 'detail-info-grid-single'}`}>
        <section>
          <div className="eyebrow">Synopsis</div>
          <h2 className="section-title">A story worth <span className="orange">finding.</span></h2>
          <p className="page-subtitle">{item.description} This entry is included for catalogue and screening-management demonstration only. No video playback is provided.</p>
          <div className="detail-facts"><Badge>{item.language}</Badge><Badge>{item.type === 'show' ? 'Series' : 'Movie'}</Badge><Badge>{item.status || 'Available'}</Badge></div>
        </section>
        {isAdmin && <section className="panel">
          <div className="eyebrow"><MapPin size={13}/> Screening signal</div><h3 className="section-title">Where it plays</h3>
          {screenings.length ? <div className="schedule-list">{screenings.map(s => <div className="schedule-row" key={s.id}><span className="time-range">{s.startTime}</span><div><div className="schedule-title">{s.theatreName} · {s.screenName}</div><div className="schedule-meta">{s.date} · {s.endTime}</div></div><Badge>{s.status}</Badge></div>)}</div> : <p className="page-subtitle">No active screening assignment in the sample schedule. See fictional theatres for the complete demo board.</p>}
          <Link className="text-link" to="/theatres" style={{ marginTop: 12 }}>Browse theatres <ArrowLeft size={12}/></Link>
        </section>}
      </div>
      <div className="section-head"><div><div className="eyebrow">Related to this orbit</div><h2 className="section-title">More <span className="orange">stories</span></h2></div></div>
      <div className="poster-rail">{related.map(c => <PosterCard key={c.id} item={c}/>)}</div>
    </div>
  );
}
