(()=>{
  'use strict';
  const root=document.documentElement,C=window.ALVOLO,M=window.ALVOLO_MENU;
  const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
  const hero=$('#home'),menu=$('#speisekarte'),dough=$('#konzept'),reels=$('#erleben'),place=$('#pizzeria');
  const dialog=$('#utility-dialog'),title=$('#utility-title'),content=$('#utility-content');
  const preferenceKey='alvolo.preferences.v1',motionKey='alvolo.motion.paused';
  let preferences={dish:false,deals:false,map:false},manualPause=false;
  try{const saved=JSON.parse(localStorage.getItem(preferenceKey)||'{}');for(const k of Object.keys(preferences))preferences[k]=saved[k]===true;manualPause=localStorage.getItem(motionKey)==='1';}catch{}
  const savePreferences=()=>{try{localStorage.setItem(preferenceKey,JSON.stringify(preferences));}catch{}};
  const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
  const link=(text,href,className,external=false)=>{const a=node('a',text,className);a.href=href;if(external){a.target='_blank';a.rel='noopener noreferrer';}return a;};
  const button=(text,fn,className='button')=>{const b=node('button',text,className);b.type='button';b.addEventListener('click',fn);return b;};
  const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:Number.isInteger(n)?0:2}).format(n);
  let returnFocus=null,cleanup=()=>{},galleryIndex=0,galleryImage=null,galleryCount=null;
  function resetDialog(){cleanup();cleanup=()=>{};content.replaceChildren();dialog.dataset.mode='';galleryImage=null;galleryCount=null;}
  function openDialog(heading,trigger,mode='info'){
    if(!dialog.showModal)return false;
    resetDialog();title.textContent=heading;dialog.dataset.mode=mode;if(!dialog.open){returnFocus=trigger||document.activeElement;dialog.showModal();}
    return true;
  }
  function close(){dialog.close();}
  $('#utility-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>{resetDialog();returnFocus?.focus();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});

  /* Menu: seleção factual + PDF original completo. */
  let currentCategory=M.categories.find(c=>c.id==='pizza');
  const dishChoice=$('#dish-choice'),description=$('#dish-description'),macro=$('#menu-macro');
  function updateDish(){const item=currentCategory.items[Number(dishChoice.value)||0];description.textContent=item.description||'Alle Angaben findest du in der vollständigen Karte.';}
  function chooseCategory(id,focus=false){
    const cat=M.categories.find(c=>c.id===id);if(!cat)return;currentCategory=cat;
    dishChoice.replaceChildren(...cat.items.map((item,i)=>{const option=node('option',item.name+' · '+money(item.price));option.value=String(i);return option;}));
    $$('.category-rail [data-category]').forEach(b=>{const on=b.dataset.category===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
    const tab=$('#category-'+id);if(tab)$('#menu-selection').setAttribute('aria-labelledby',tab.id);
    macro.src=cat.image;updateDish();
    if(motionEnabled&&macro.animate)macro.animate([{opacity:.4},{opacity:1}],{duration:450,easing:'ease-out'});
  }
  const mainTabs=$$('.category-rail [data-category]');
  mainTabs.forEach((b,i)=>{b.addEventListener('click',()=>chooseCategory(b.dataset.category));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%mainTabs.length;else if(e.key==='ArrowLeft')n=(i+mainTabs.length-1)%mainTabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=mainTabs.length-1;else return;e.preventDefault();chooseCategory(mainTabs[n].dataset.category,true);});});
  dishChoice.addEventListener('change',updateDish);
  const normal=s=>s.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  function showMenu(trigger){
    if(!openDialog('Unsere Speisekarte',trigger,'menu'))return false;
    content.append(node('p','Eine Auswahl aus unserer offiziellen Karte. Die vollständige Speisekarte mit allen Gerichten, Getränken und Extras findest du im PDF.','menu-explanation'));
    const tools=node('div',undefined,'menu-tools'),label=node('label','Gericht suchen','sr-only'),search=node('input');search.id='menu-search';search.type='search';search.placeholder='Gericht oder Zutat suchen';label.htmlFor=search.id;
    const select=node('select');select.setAttribute('aria-label','Kategorie filtern');const all=node('option','Alle Kategorien');all.value='all';select.append(all);
    M.categories.forEach(c=>{const o=node('option',c.label);o.value=c.id;select.append(o);});
    tools.append(label,search,select);const results=node('div',undefined,'menu-results');results.setAttribute('aria-live','polite');
    function draw(){results.replaceChildren();let count=0;for(const c of M.categories){if(select.value!=='all'&&select.value!==c.id)continue;const items=c.items.filter(i=>normal(i.name+' '+i.description).includes(normal(search.value.trim())));if(!items.length)continue;const group=node('section',undefined,'menu-group');group.append(node('h3',c.label));for(const i of items){count++;const item=node('article',undefined,'menu-item'),header=node('header');header.append(node('span',i.name),node('span',money(i.price),'price'));item.append(header);if(i.description)item.append(node('p',i.description));group.append(item);}results.append(group);}if(!count)results.append(node('p','In dieser Auswahl wurde nichts gefunden. Schau auch in die vollständige PDF-Karte.','no-result'));}
    search.addEventListener('input',draw);select.addEventListener('change',draw);draw();
    const actions=node('div',undefined,'dialog-actions');actions.append(link('Vollständige Karte als PDF ↗','Speisekarte-Al-Volo-Original.pdf','button button-red',true),link('Bei Fragen anrufen','tel:'+C.phone));
    content.append(tools,results,actions,node('p','Alle Preise in Euro inklusive Mehrwertsteuer. Fotos auf der Startseite zeigen Aufnahmen aus der Pizzeria und sind nicht jedem ausgewählten Gericht einzeln zugeordnet.','video-note'));search.focus();return true;
  }

  /* Externe Dienste erst auf Wunsch laden; echte Dienste, keine Scheinintegrationen. */
  function dishUrl(){const params=new URLSearchParams({eid:C.dish.eid,tagid:'hors-'+C.dish.eid,width:'100%',height:'650',foregroundColor:'#0A0A0A',backgroundColor:'#F4E7CF',linkColor:'#C41E3A',errorColor:'#C41E3A',primaryButtonForegroundColor:'#F4E7CF',primaryButtonBackgroundColor:'#C41E3A',secondaryButtonForegroundColor:'#C41E3A',secondaryButtonBackgroundColor:'#F4E7CF'});return C.dish.base+C.dish.eid+'?'+params;}
  function service(type,trigger){
    const info={dish:{heading:'Tisch reservieren',provider:'DISH',explanation:'Datum, Uhrzeit und Personenanzahl wählst du direkt bei DISH. Deine Reservierung wird dort bearbeitet.',url:dishUrl(),fallback:dishUrl(),frameTitle:'Tischreservierung bei DISH',className:'external-frame'},deals:{heading:'Mittagstisch & Deals',provider:'GezerView',explanation:'Hier öffnest du die aktuelle Anzeige der Pizzeria. Angebote und Verfügbarkeit kommen direkt aus dem bestehenden Display.',url:C.deals,fallback:C.deals,frameTitle:'Aktuelle Anzeige der Pizzeria Al Volo',className:'external-frame deals-frame'},map:{heading:'Hier findest du uns',provider:'Google Maps',explanation:C.address,url:C.mapEmbed,fallback:C.map,frameTitle:'Standort Pizzeria Al Volo in Hamburg',className:'external-frame map-frame'}}[type];
    if(!openDialog(info.heading,trigger,'service'))return false;
    const wrap=node('div',undefined,'dialog-body');wrap.append(node('p',info.explanation));const stage=node('div');wrap.append(stage);
    function load(){preferences[type]=true;savePreferences();stage.replaceChildren();const iframe=node('iframe');iframe.src=info.url;iframe.title=info.frameTitle;iframe.className=info.className;iframe.referrerPolicy='strict-origin-when-cross-origin';if(type==='deals')iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;stage.append(iframe);cleanup=()=>{iframe.src='about:blank';iframe.remove();};}
    if(preferences[type])load();else{const gate=node('div',undefined,'external-gate');gate.append(node('p','Beim Laden wird eine Verbindung zu '+info.provider+' hergestellt. Du kannst deine Auswahl später unter Einstellungen ändern.'),button(info.provider+' laden',load,'button button-red'));stage.append(gate);}
    const fallback=node('div',undefined,'external-fallback');fallback.append(link('Extern öffnen ↗',info.fallback,undefined,true),link('Telefonisch: '+C.phoneDisplay,'tel:'+C.phone));wrap.append(node('p','Falls die Anzeige nicht erscheint, öffne sie direkt beim Anbieter oder ruf uns an.','service-status'),fallback);content.append(wrap);return true;
  }
  function showSettings(trigger){
    if(!openDialog('Deine Einstellungen',trigger,'settings'))return false;
    const body=node('div',undefined,'dialog-body');body.append(node('p','Fotos, Schriftarten und die drei Originalvideos werden mit dieser Website ausgeliefert. Die folgenden externen Inhalte lädst du nur auf Wunsch.'));
    const list=node('div',undefined,'settings-list'),inputs={};for(const [key,name,detail]of[['dish','DISH-Reservierung','Buchungssystem für Tischreservierungen.'],['deals','GezerView','Aktuelle Mittagskarte und Angebote.'],['map','Google Maps','Eingebettete Standortkarte.']]){const label=node('label'),input=node('input');input.type='checkbox';input.checked=preferences[key];inputs[key]=input;const text=node('span',name);text.append(node('small',detail));label.append(input,text);list.append(label);}
    body.append(list,button('Auswahl speichern',()=>{for(const k of Object.keys(inputs))preferences[k]=inputs[k].checked;savePreferences();close();},'button button-red'),node('p','Deine Auswahl wird lokal in deinem Browser gespeichert. Datenschutzhinweise findest du auf der offiziellen Seite der Pizzeria.','video-note'));content.append(body);return true;
  }

  function showStory(trigger,teig=false){
    if(!openDialog(teig?'Al Volo für zu Hause':'Zeit für echten Geschmack',trigger,'story'))return false;
    const body=node('div',undefined,'dialog-body');body.append(node('h3',teig?'Dein Ofen. Unser Teig.':'Steinofen. Frische. 48 Stunden.'));
    const text=teig?'Den originalen Al-Volo-Pizzateig gibt es direkt in der Pizzeria zum Mitnehmen. Frag vor Ort oder telefonisch nach der aktuellen Verfügbarkeit.':'Seit 2012 ist Al Volo am Eppendorfer Weg zu Hause. Unser Teig ruht 48 Stunden, bevor er von Hand geformt und im Steinofen gebacken wird. Dazu kommen frische Zutaten und die Freude an italienischer Küche.';
    body.append(node('p',text));const actions=node('div',undefined,'dialog-actions');actions.append(link(teig?'Nach Teig fragen':'Anrufen','tel:'+C.phone,'button button-red'),link('Lieber liefern lassen? Zu Wolt ↗',C.wolt,undefined,true));body.append(actions);content.append(body);return true;
  }

  function showVideo(id,trigger){
    const item=C.videos.find(v=>v.id===Number(id));if(!item||!openDialog(item.title,trigger,'video'))return false;
    const video=node('video');video.className='video-player';video.src=item.src;video.poster=item.poster;video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label','Originalvideo der Pizzeria Al Volo');content.append(video,node('p','Originalvideo der Pizzeria. Ton und Wiedergabe steuerst du am Player.','video-note'));cleanup=()=>{video.pause();video.removeAttribute('src');video.load();};video.play().catch(()=>{});return true;
  }
  function showGallery(trigger){
    if(!openDialog('Impressionen',trigger,'gallery'))return false;
    const grid=node('div',undefined,'gallery-grid');C.gallery.forEach((image,i)=>{const b=button('',()=>viewGallery(i));b.setAttribute('aria-label','Originalfoto '+(i+1)+' vergrößern');const img=node('img');img.src=image.src;img.alt=image.alt;img.loading='lazy';b.append(img);grid.append(b);});content.append(grid);return true;
  }
  function updateGallery(){galleryImage.src=C.gallery[galleryIndex].src;galleryImage.alt=C.gallery[galleryIndex].alt;galleryCount.textContent=(galleryIndex+1)+' / '+C.gallery.length;}
  function viewGallery(index){content.replaceChildren();dialog.dataset.mode='gallery-viewer';galleryIndex=index;const frame=node('div',undefined,'gallery-viewer');galleryImage=node('img');frame.append(galleryImage);const controls=node('div',undefined,'gallery-controls');galleryCount=node('span');galleryCount.setAttribute('aria-live','polite');controls.append(button('← Zurück',()=>{galleryIndex=(galleryIndex+C.gallery.length-1)%C.gallery.length;updateGallery();}),galleryCount,button('Weiter →',()=>{galleryIndex=(galleryIndex+1)%C.gallery.length;updateGallery();}));content.append(frame,controls,button('Alle Fotos',()=>showGallery(returnFocus),'text-link'));updateGallery();}

  const actions={menu:showMenu,book:t=>service('dish',t),deals:t=>service('deals',t),map:t=>service('map',t),settings:showSettings,story:t=>showStory(t),dough:t=>showStory(t,true),gallery:showGallery};
  document.addEventListener('click',e=>{const a=e.target.closest('[data-action],[data-video]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const fn=a.dataset.video?t=>showVideo(a.dataset.video,t):actions[a.dataset.action];if(fn&&dialog.showModal){e.preventDefault();fn(a);}});
  $$('.mobile-nav nav a').forEach(a=>a.addEventListener('click',()=>a.closest('details').removeAttribute('open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.mobile-nav[open]').forEach(d=>{d.removeAttribute('open');$('summary',d).focus();});if(dialog.open&&dialog.dataset.mode==='gallery-viewer'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();galleryIndex=(galleryIndex+(e.key==='ArrowRight'?1:C.gallery.length-1))%C.gallery.length;updateGallery();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('video',content).forEach(v=>v.pause());});

  /* Movimento: coordenadas normalizadas; nenhuma ampliação global do board. */
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)'),connection=navigator.connection,toggle=$('#motion-toggle');
  let motionEnabled=false,raf=0,observer=null,intro=[],opened=false,px=0,py=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const progress=r=>clamp((innerHeight-r.top)/(innerHeight+r.height));
  const vars=new Map([[hero,['--person-y','--headline-y','--food-x','--food-y','--seal-r']],[menu,['--macro-x','--macro-y','--macro-r','--gesture-r']],[dough,['--chef-y','--line-r']],[reels,['--reel-x']],[place,['--place-y','--place-food-x']]]);
  function stopIntro(){intro.forEach(a=>a.cancel());intro=[];}
  function clearMotion(){cancelAnimationFrame(raf);raf=0;stopIntro();vars.forEach((names,el)=>names.forEach(name=>el.style.removeProperty(name)));}
  function update(){
    raf=0;if(!motionEnabled||document.hidden)return;
    const mobile=innerWidth<=720,u=mobile?0.3:Math.min(1,innerWidth/1024);
    const hr=hero.getBoundingClientRect(),mr=menu.getBoundingClientRect(),dr=dough.getBoundingClientRect(),rr=reels.getBoundingClientRect(),pr=place.getBoundingClientRect();
    if(hr.bottom>0&&hr.top<innerHeight){const p=clamp(-hr.top/hr.height);hero.style.setProperty('--person-y',(p*8*u-py*.3)+'px');hero.style.setProperty('--headline-y',(-p*4*u)+'px');hero.style.setProperty('--food-x',(-p*10*u+px)+'px');hero.style.setProperty('--food-y',(-p*4*u+py)+'px');hero.style.setProperty('--seal-r',(-p*3*u)+'deg');if(scrollY>35&&intro.length)stopIntro();}
    if(mr.bottom>0&&mr.top<innerHeight){const p=progress(mr);menu.style.setProperty('--macro-x',((p-.5)*14*u)+'px');menu.style.setProperty('--macro-y',((p-.5)*8*u)+'px');menu.style.setProperty('--macro-r',((p-.5)*2*u)+'deg');menu.style.setProperty('--gesture-r',(-12+p*20*u)+'deg');}
    if(dr.bottom>0&&dr.top<innerHeight){const p=progress(dr);dough.style.setProperty('--chef-y',((p-.5)*12*u)+'px');dough.style.setProperty('--line-r',((p-.5)*5*u)+'deg');}
    if(rr.bottom>0&&rr.top<innerHeight)reels.style.setProperty('--reel-x',((progress(rr)-.5)*12*u)+'px');
    if(pr.bottom>0&&pr.top<innerHeight){const p=progress(pr);place.style.setProperty('--place-y',((p-.5)*8*u)+'px');place.style.setProperty('--place-food-x',((p-.5)*12*u)+'px');}
  }
  function request(){if(motionEnabled&&!raf&&!document.hidden)raf=requestAnimationFrame(update);}
  function reveal(){observer?.disconnect();if(!motionEnabled||!('IntersectionObserver'in window)){$$('[data-reveal]').forEach(e=>e.classList.add('is-visible'));return;}observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12});$$('[data-reveal]').forEach(e=>observer.observe(e));}
  async function opening(){if(opened||!motionEnabled||scrollY>30)return;opened=true;await Promise.allSettled([document.fonts?.ready??Promise.resolve(),$('.hero-portrait img').decode?.()??Promise.resolve()]);if(!motionEnabled||scrollY>30||!hero.animate)return;const portrait=$('.hero-portrait');intro.push(portrait.animate([{clipPath:'circle(0% at 42% 40%)',opacity:.35},{clipPath:'circle(110% at 42% 40%)',opacity:1}],{duration:1250,easing:'cubic-bezier(.22,.7,.2,1)'}));$$('h1 span',hero).forEach((line,i)=>intro.push(line.animate([{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:100+i*90,easing:'ease-out'})));Promise.allSettled(intro.map(a=>a.finished)).then(()=>{intro=[];});}
  function setMotion(){clearMotion();const forced=reduced.matches||Boolean(connection?.saveData);motionEnabled=!forced&&!manualPause;root.classList.toggle('js-motion',motionEnabled);root.classList.toggle('motion-off',!motionEnabled);toggle.disabled=forced;toggle.setAttribute('aria-pressed',String(!motionEnabled));toggle.setAttribute('aria-label',forced?'Bewegung nach deinen Einstellungen reduziert':motionEnabled?'Animationen pausieren':'Animationen fortsetzen');$('span',toggle).textContent=motionEnabled?'Ⅱ':'▷';reveal();request();opening();}
  root.classList.add('js');setMotion();chooseCategory('pizza');
  toggle.addEventListener('click',()=>{manualPause=motionEnabled;try{localStorage.setItem(motionKey,manualPause?'1':'0');}catch{}setMotion();});
  reduced.addEventListener?.('change',setMotion);connection?.addEventListener?.('change',setMotion);
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
  hero.addEventListener('pointermove',e=>{if(!motionEnabled||!fine.matches||innerWidth<=720)return;const r=$('.hero-canvas').getBoundingClientRect();px=Math.max(-3,Math.min(3,((e.clientX-r.left)/r.width-.5)*6));py=Math.max(-3,Math.min(3,((e.clientY-r.top)/r.height-.5)*6));request();},{passive:true});hero.addEventListener('pointerleave',()=>{px=0;py=0;request();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;stopIntro();}else request();});
})();
