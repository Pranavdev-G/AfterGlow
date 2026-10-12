import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, Film, RotateCcw, Sparkles } from 'lucide-react';
import { catalogue, shows, genres, languages, yearOptions } from '../data/catalog.js';
import { CatalogueFilters, PageHeading } from '../components/Controls.jsx';
import { ContentGrid } from '../components/PosterCard.jsx';
import { api } from '../lib/api.js';

export default function CataloguePage({type='movie'}){
 const [params,setParams]=useSearchParams();const location=useLocation();
 const [items,setItems]=useState(type==='show'?shows:catalogue);const [query,setQuery]=useState(params.get('q')||'');const [genre,setGenre]=useState(params.get('genre')||'All genres');const [language,setLanguage]=useState('All languages');const [year,setYear]=useState('All years');const [sort,setSort]=useState('title');
 useEffect(()=>{setQuery(params.get('q')||'');setGenre(params.get('genre')||'All genres');},[location.search,type]);
 useEffect(()=>{api(`/catalog?type=${type}`).then(r=>r.items?.length&&setItems(r.items)).catch(()=>setItems(type==='show'?shows:catalogue));},[type]);
 const results=useMemo(()=>items.filter(item=>item.type===type&&item.title.toLowerCase().includes(query.toLowerCase())&&(genre==='All genres'||item.genre===genre)&&(language==='All languages'||item.language===language)&&(year==='All years'||String(item.year)===year)).sort((a,b)=>sort==='year'?b.year-a.year:sort==='rating'?(b.rating||0)-(a.rating||0):a.title.localeCompare(b.title)),[items,type,query,genre,language,year,sort]);
 const setSearch=value=>{setQuery(value);const next=new URLSearchParams(params);if(value)next.set('q',value);else next.delete('q');setParams(next,{replace:true});};
 return <div className="page-wrap"><PageHeading eyebrow={type==='show'?'Long-form worlds':'The catalogue'} title={type==='show'?<>Series & <span>shows</span></>:<>Find your <span>next story.</span></>} description={type==='show'?'Series, seasons, languages and worlds to explore. Demonstration catalogue; no streaming is provided.':'Search the sample collection, narrow by genre or language, and open a title for details and screening information.'} action={<span className="role-chip"><Film size={12}/>{results.length} titles</span>}/>
 <div className="catalog-toolbar"><label className="searchbox"><input className="field" placeholder={`Search ${type==='show'?'series':'movies'}…`} value={query} onChange={e=>setSearch(e.target.value)}/></label><select className="select" value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(g=><option key={g}>{g}</option>)}</select><select className="select" value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(g=><option key={g}>{g}</option>)}</select><select className="select" value={year} onChange={e=>setYear(e.target.value)}>{yearOptions.map(g=><option key={g}>{g}</option>)}</select><select className="select" value={sort} onChange={e=>setSort(e.target.value)}><option value="title">Title A–Z</option><option value="year">Release year</option><option value="rating">Rating</option></select><button className="ghost-button" onClick={()=>{setSearch('');setGenre('All genres');setLanguage('All languages');setYear('All years');setSort('title')}}><RotateCcw size={13}/> Clear filters</button></div>
 <div className="filter-line">{[...new Set(results.map(x=>x.genre))].map(g=><button className={`filter-chip ${genre===g?'active':''}`} key={g} onClick={()=>setGenre(genre===g?'All genres':g)}>{g}</button>)}</div>
 <div className="section-head tight"><div><h2 className="section-title">{type==='show'?'Series library':'Movie library'} <span className="orange">/ {results.length}</span></h2><div className="section-note">Sort by title, year, or rating · use clear filters to reset</div></div><ArrowDownUp size={16} color="#ff9d42"/></div>
 <ContentGrid items={results} empty="Try another title, year, language or genre."/>
 <div className="data-note" style={{marginTop:22}}><Sparkles size={12}/> Movie promotional artwork is shown where available; fictional demo titles retain clearly labelled concept art.</div>
 </div>;
}
