const bundledPosters = Object.freeze({
  interstellar: '/posters/interstellar.jpg',
  'spider-man': '/posters/spider-man.jpg',
  hulk: '/posters/hulk.jpg',
  'iron-man': '/posters/iron-man.jpg',
  'ok-kanmani': '/posters/ok-kanmani.jpg',
  'hi-nanna': '/posters/hi-nanna.webp',
  'avengers-endgame': '/posters/avengers-endgame.jpg',
  dune: '/posters/dune.jpg',
  avatar: '/posters/avatar.webp',
  'lord-of-the-rings': '/posters/lord-of-the-rings.jpg',
  baahubali: '/posters/baahubali.webp',
  'doctor-doom': '/posters/doctor-doom.webp',
});

export function stablePosterUrl(item) {
  const id = String(item?.id || item?.slug || '');
  if (bundledPosters[id]) return bundledPosters[id];
  const source = item?.posterUrl;
  if (typeof source !== 'string' || !source || source.startsWith('/manus-storage/')) return null;
  return source;
}
