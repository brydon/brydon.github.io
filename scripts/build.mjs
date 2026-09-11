import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {PLACES,NAV} from '../js/places.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Keep the static checkout runnable without a framework or development bundler.
await mkdir(path.join(root,'js/vendor'),{recursive:true});
for(const name of ['three.module.min.js','three.core.min.js'])await cp(path.join(root,'node_modules/three/build',name),path.join(root,'js/vendor',name));
await cp(path.join(root,'node_modules/three/LICENSE'),path.join(root,'js/vendor/THREE-LICENSE.txt'));
await writeFile(path.join(root,'js/vendor/CSS3DRenderer.js'),(await readFile(path.join(root,'node_modules/three/examples/jsm/renderers/CSS3DRenderer.js'),'utf8')).replace("from 'three'","from './three.module.min.js'"));
await writeFile(path.join(root,'js/vendor/SVGLoader.js'),(await readFile(path.join(root,'node_modules/three/examples/jsm/loaders/SVGLoader.js'),'utf8')).replace("from 'three'","from './three.module.min.js'"));
const nav=NAV.map(([id,label])=>`<a href="/${id}.html" data-place="${id}">${label}</a>`).join('')+'<a href="/cv.pdf" target="_blank" rel="noopener noreferrer">CV ↗</a>';
const home=(await readFile(path.join(root,'templates/home.html'),'utf8')).replaceAll('{{NAV}}',nav);
await writeFile(path.join(root,'index.html'),home);
// The reading version keeps the original site's copy: its nav labels, order, page titles and nameplate.
const READING_NAV=[['home','Home'],['research','Research'],['teaching','Teaching'],['blog','Blog'],['code','Code'],['about','About'],['contact','Contact']];
const readingNav=READING_NAV.map(([id,label])=>`<a href="/${id}.html" data-place="${id}">${label}</a>`).join('')+'<a href="/cv.pdf" target="_blank" rel="noopener noreferrer">CV</a>';
for(const place of PLACES){
 const content=await readFile(path.join(root,'content',place.page+'.html'),'utf8');
 const title=place.id==='contact'?'Brydon Eastman - Contact':'Brydon Eastman';
 const page=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#142b2a"><meta name="description" content="${place.short} — Brydon Eastman's research, code, and life beyond the work."><title>${title}</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/styles/switchback.css"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Silkscreen&display=swap" rel="stylesheet"></head>
<body class="reading-page"><a class="skip-link" href="#content">Skip to content</a><header class="site-header"><a class="wordmark" href="/">BRYDON EASTMAN<span class="brand-dot" aria-hidden="true">.</span></a><nav aria-label="Main navigation">${readingNav}</nav><a class="back-to-world" href="/">Back to Switchback ↗</a></header><div class="reading-landscape" aria-hidden="true"></div><main id="content" class="reading-main"><div class="reading-heading"><h1>Brydon Eastman</h1></div><article class="prose">${content}</article></main><footer class="reading-footer"><a href="/">← Back to the valley</a><span>Brydon Eastman · <a href="/contact.html">Say hello</a></span></footer><script type="module" src="/js/reading.mjs"></script></body></html>`;
 await writeFile(path.join(root,place.page+'.html'),page);
}
if(process.argv.includes('--dist')){
 const dist=path.join(root,'dist');await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
 for(const file of ['index.html','desktop.html',...PLACES.map(p=>p.page+'.html'),'CNAME','.nojekyll','favicon.ico','main.css','myscroll.js','cv.pdf','rl_poster.pdf','rl_poster_video.mp4'])await cp(path.join(root,file),path.join(dist,file));
 for(const dir of ['styles','js','content','images','.well-known','AMATH_353','math1mp','covid19'])await cp(path.join(root,dir),path.join(dist,dir),{recursive:true});
}
console.log('Built Switchback and 7 reading pages from shared content.');
