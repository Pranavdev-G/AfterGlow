import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Star } from 'lucide-react';
import { onSaved, readSaved, saveContent } from '../lib/api.js';
import { stablePosterUrl } from '../lib/posters.js';
import { useAuth } from '../state/AuthContext.jsx';
import { notify } from './Layout.jsx';

const tones = {
  cosmos: ['#362218', '#cd6819'], crimson: ['#371216', '#b82f25'],
  verdant: ['#142b18', '#6d9a41'], gold: ['#3a2910', '#d89c22'],
  emerald: ['#102923', '#3b9b72'], rose: ['#321b25', '#ca6b8e'],
  violet: ['#291a30', '#9363a3'], ember: ['#351a10', '#e0681b'],
  desert: ['#362514', '#c98943'], oceanic: ['#102833', '#4590a2'],
  forest: ['#1b2b1c', '#748845'], royal: ['#382410', '#c68a2b'],
};

export function PosterArtwork({ item, detail = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const colors = tones[item.tone] || tones.cosmos;
  const imageUrl = stablePosterUrl(item);
  useEffect(() => setImageFailed(false), [item.id, imageUrl]);

  const hasPhoto = Boolean(imageUrl && !imageFailed);
  const isFictionalSample = Boolean(
    item.sampleOnly || /sample|unverified/i.test(item.status || '') ||
    item.id === 'doctor-doom' || item.id === 'kingdom-of-ash'
  );
  const posterTitle = item.posterTitle || item.title;

  return (
    <div className={`poster ${hasPhoto ? 'has-photo' : ''} ${detail ? 'poster-detail' : ''}`} style={{ '--poster-a': colors[0], '--poster-glow': colors[1] }}>
      {hasPhoto && (
        <img
          className="poster-image"
          src={imageUrl}
          alt={isFictionalSample ? `Original fictional concept artwork for ${posterTitle}; not an official movie poster` : `Promotional poster artwork for ${posterTitle}`}
          loading={detail ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="poster-top">
        <span>{isFictionalSample ? 'Fictional sample' : hasPhoto ? 'Poster artwork' : item.type === 'show' ? 'Series' : 'Feature'}</span>
        <span>{item.year}</span>
      </div>
      {!hasPhoto && (
        <div className="poster-copy">
          <div className="poster-title">{item.title}</div>
          <div className="poster-sub">{item.genre}{item.language ? ` · ${item.language}` : ''}</div>
        </div>
      )}
      <div className="poster-bottom">
        <span className={hasPhoto ? 'poster-label' : 'sample-mark'}>
          {isFictionalSample ? 'FICTIONAL SAMPLE · CONCEPT ART · NOT OFFICIAL' : hasPhoto ? 'PROMOTIONAL ARTWORK' : 'SAMPLE ART · NOT OFFICIAL'}
        </span>
        {item.rating && <span className="poster-rating"><Star size={10} fill="currentColor"/> {item.rating}</span>}
      </div>
    </div>
  );
}

export function PosterCard({ item, compact = false, onChanged }) {
  const { user, health, setUser } = useAuth();
  const [watch, setWatch] = useState(() => user && !user.demo && health.mongoConnected ? (user.watchlist || []).includes(item.id) : readSaved('watchlist').includes(item.id));
  const [fav, setFav] = useState(() => user && !user.demo && health.mongoConnected ? (user.favourites || []).includes(item.id) : readSaved('favourites').includes(item.id));

  useEffect(() => {
    if (user && !user.demo && health.mongoConnected) {
      setWatch((user.watchlist || []).includes(item.id));
      setFav((user.favourites || []).includes(item.id));
    }
  }, [user, health.mongoConnected, item.id]);

  useEffect(() => onSaved(({ kind, values }) => {
    if (kind === 'watchlist') setWatch(values.includes(item.id));
    if (kind === 'favourites') setFav(values.includes(item.id));
  }), [item.id]);

  const toggle = async (kind, event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = await saveContent(kind, item.id, user, health);
    if (kind === 'watchlist') setWatch(result.values.includes(item.id));
    else setFav(result.values.includes(item.id));
    if (result.persisted && setUser) setUser(prev => prev ? { ...prev, [kind]: result.values } : prev);
    onChanged?.(kind, result.values.includes(item.id));
    if (result.error) notify(`${item.title} changed in this browser, but database sync failed: ${result.error.message}`, 'error');
    else notify(`${item.title} ${result.values.includes(item.id) ? 'added to' : 'removed from'} ${kind === 'watchlist' ? 'Watchlist' : 'Favourites'}${result.persisted ? ' in your account' : ' in this browser (temporary demo data)'}.`);
  };

  return (
    <article className={`poster-card ${compact ? 'compact' : ''}`}>
      <Link to={`/content/${item.id}`} aria-label={`Open ${item.title} details`}>
        <PosterArtwork item={item}/>
      </Link>
      <div className="card-info">
        <Link to={`/content/${item.id}`} className="card-title">{item.title}</Link>
        <div className="card-meta">{item.year} · {item.genre} · {item.language}{item.seasons ? ` · ${item.seasons} seasons` : ''}</div>
        <div className="card-actions">
          <button className={`mini-action ${watch ? 'is-active' : ''}`} onClick={e => toggle('watchlist', e)} aria-label={watch ? 'Remove from Watchlist' : 'Add to Watchlist'}><Bookmark size={12} fill={watch ? 'currentColor' : 'none'}/>{watch ? 'Saved' : 'Watchlist'}</button>
          <button className={`mini-action ${fav ? 'is-active' : ''}`} onClick={e => toggle('favourites', e)} aria-label={fav ? 'Remove from Favourites' : 'Add to Favourites'}><Heart size={12} fill={fav ? 'currentColor' : 'none'}/></button>
        </div>
      </div>
    </article>
  );
}

export function ContentGrid({ items, empty = 'No titles match these filters.' }) {
  if (!items.length) return <div className="empty-state"><Bookmark size={24}/><div><h3>Nothing in this orbit</h3><p>{empty}</p></div></div>;
  return <div className="poster-grid">{items.map(item => <PosterCard key={item.id} item={item}/>)}</div>;
}

export function PosterRail({ items }) {
  return <div className="poster-rail">{items.map(item => <PosterCard key={item.id} item={item} compact/>)}</div>;
}
