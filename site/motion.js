/* Al Volo — scroll choreography (GSAP 3.13 + ScrollTrigger, vendored in vendor/).
   Built only while motion is on (app.js decides: reduced motion, Save-Data and the pause button
   turn it off) and reverted completely when it goes off, so the static page is always the base.
   One thread runs through the page: the seal. It opens the page as an iris, every scene's round
   window opens like it, and its ring in the sticky bar fills as the visitor goes down the page. */
(()=>{
  'use strict';
  const root=document.documentElement,g=window.gsap,ST=window.ScrollTrigger;
  const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
  if(!g||!ST){root.classList.remove('intro');return;}
  g.registerPlugin(ST);
  ST.config({ignoreMobileResize:true});

  const desk=()=>innerWidth>720;
  // one canvas unit in px, as in styles.css (--u)
  const U=()=>desk()?Math.min(1,innerWidth/1024,innerHeight/760):1;
  let ctx=null,mode=null,splits=[],clones=[];

  /* Split headings into words (or the hero title into letters) that rise out of their own mask. */
  function words(el){
    if(!el)return[];
    if(!el.dataset.split){
      splits.push([el,el.innerHTML]);el.dataset.split='w';
      const walk=n=>[...n.childNodes].forEach(c=>{
        if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(t);return;}const w=document.createElement('span'),i=document.createElement('span');w.className='w';i.className='wi';i.textContent=t;w.append(i);f.append(w);});c.replaceWith(f);}
        else if(c.nodeType===1&&c.tagName!=='BR')walk(c);
      });
      walk(el);
    }
    return $$('.wi',el);
  }
  function letters(h1){
    if(!h1.dataset.split){
      splits.push([h1,h1.innerHTML]);h1.dataset.split='c';
      h1.setAttribute('aria-label',[...h1.children].map(s=>s.textContent).join(' '));
      [...h1.children].forEach(line=>{
        const text=line.textContent;line.textContent='';line.setAttribute('aria-hidden','true');
        text.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){line.append(t);return;}const w=document.createElement('span');w.style.display='inline-block';[...t].forEach(ch=>{const c=document.createElement('span');c.className='c';c.textContent=ch;w.append(c);});line.append(w);});
      });
    }
    return $$('.c',h1);
  }
  function unsplit(){splits.forEach(([el,html])=>{el.innerHTML=html;delete el.dataset.split;if(el.id==='hero-title')el.removeAttribute('aria-label');});splits=[];}

  /* Inline films: loaded on first use, played only while their scene is on screen. */
  const wanted=new Set();
  function play(v){if(!v)return;wanted.add(v);if(!v.getAttribute('src')&&v.dataset.src)v.src=v.dataset.src;v.muted=true;if(!document.hidden){const p=v.play();if(p)p.catch(()=>{});}}
  function pause(v){if(!v)return;wanted.delete(v);if(!v.paused)v.pause();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('main video').forEach(v=>v.pause());else wanted.forEach(v=>{const p=v.play();if(p)p.catch(()=>{});});});

  /* Eyebrow slides in, heading words rise; replays when the visitor scrolls back up and down again. */
  function textIn(scope,start='top 78%'){
    const s=$(scope);if(!s)return;
    const tl=g.timeline({scrollTrigger:{trigger:s,start,toggleActions:'play none none reverse'}});
    $$('.eyebrow',s).forEach(e=>tl.from(e,{autoAlpha:0,x:-28,duration:.6,ease:'power3.out'},0));
    $$('h2.split',s).forEach(h=>tl.from(words(h),{yPercent:118,rotation:5,duration:.95,stagger:.07,ease:'power4.out'},.05));
  }
  /* A one-shot moment that waits for its trigger and rewinds when the visitor goes back above it. */
  function onArrive(trigger,start,tl){
    const st=ST.create({trigger,start,onEnter:()=>tl.restart(),onLeaveBack:()=>tl.pause(0)});
    if(st.scroll()>st.start)tl.progress(1);
  }

  /* 1 — Hero: the seal opens the page, then the scene folds back into a circle as you leave it. */
  function heroIntro(chars){
    if(!root.classList.contains('intro')||scrollY>40){root.classList.remove('intro');return;}
    const cover=$('.intro-cover'),seal=$('.header .seal'),title=$('#hero-title');
    const nav=[...$$('.desktop-nav>*'),$('.mobile-nav')],rest=$$('.hero-kicker,.hero-lead,.hero-actions>*,.hero-hours>*');
    const r=seal.getBoundingClientRect(),dx=innerWidth/2-(r.left+r.width/2),dy=innerHeight/2-(r.top+r.height/2);
    const big=Math.min(2.4,Math.min(innerWidth,innerHeight)*.34/r.width);
    g.set(cover,{visibility:'visible','--iris':'0px'});
    g.set('.header',{visibility:'visible'});
    g.set(seal,{x:dx,y:dy,scale:big,rotation:-220,autoAlpha:0});
    g.set(nav,{autoAlpha:0,y:-14});
    g.set(chars,{yPercent:120,rotation:8});
    g.set(rest,{autoAlpha:0,y:22});
    g.set('.hero-food',{x:()=>-300*U(),rotation:-10,autoAlpha:0});
    g.set('.hero-portrait img',{yPercent:5});
    title.classList.add('is-revealing');
    root.classList.remove('intro');
    const skip=()=>{if(scrollY>40)tl.progress(1);};
    const tl=g.timeline({paused:true,defaults:{ease:'power3.out'},onComplete:()=>{g.set(cover,{clearProps:'all'});title.classList.remove('is-revealing');removeEventListener('scroll',skip);}});
    tl.to(seal,{autoAlpha:1,rotation:0,duration:.95,ease:'back.out(1.5)'},.1)
      .to(cover,{'--iris':()=>Math.hypot(innerWidth,innerHeight)/2+60+'px',duration:1.1,ease:'power2.inOut'},'+=.08')
      .to(seal,{x:0,y:0,scale:1,duration:1.05,ease:'power3.inOut'},'<')
      .to('.hero-portrait img',{yPercent:0,duration:1.5},'<')
      .to(chars,{yPercent:0,rotation:0,duration:.9,stagger:.03,ease:'power4.out'},'-=.6')
      .to('.hero-food',{x:0,rotation:0,autoAlpha:1,duration:1.15},'<+.15')
      .to(rest,{autoAlpha:1,y:0,duration:.6,stagger:.06},'-=.85')
      .to(nav,{autoAlpha:1,y:0,duration:.5,stagger:.05},'<');
    addEventListener('scroll',skip,{passive:true});
    // the title waits for its typeface (never longer than 0.7 s)
    Promise.race([document.fonts?.ready,new Promise(r=>setTimeout(r,700))]).then(()=>tl.play());
    return ()=>removeEventListener('scroll',skip);
  }
  function heroScene(cleanups){
    const title=$('#hero-title'),lines=[...title.children],chars=letters(title);
    const stop=heroIntro(chars);if(stop)cleanups.push(stop);
    g.timeline({scrollTrigger:{trigger:'#home',start:'top top',end:'bottom top',scrub:.8,invalidateOnRefresh:true}})
      .to(lines[0],{xPercent:-26,ease:'none'},0).to(lines[1],{xPercent:18,ease:'none'},0).to(lines[2],{xPercent:-14,ease:'none'},0)
      .to('.hero-copy',{y:()=>-70*U(),autoAlpha:.1,ease:'power2.in'},0)
      .fromTo('.hero-portrait',{clipPath:'circle(140% at 60% 40%)'},{clipPath:'circle(22% at 60% 40%)',y:()=>120*U(),ease:'none'},0)
      .to('.hero-underlay img',{y:()=>130*U(),ease:'none'},0)
      .to('.hero-food img',{x:()=>130*U(),y:()=>40*U(),rotation:8,ease:'none'},0)
      .to('.header .seal img',{rotation:-150,ease:'none'},0)
      .to('.hero-hours',{y:()=>-50*U(),autoAlpha:0,ease:'power2.in'},0);
    if(desk()&&matchMedia('(pointer:fine)').matches){
      const hero=$('#home'),px=g.quickTo('.hero-portrait img','x',{duration:1,ease:'power3'}),ux=g.quickTo('.hero-underlay img','x',{duration:1.3,ease:'power3'});
      const move=e=>{const k=e.clientX/innerWidth-.5;px(k*-20);ux(k*12);};
      hero.addEventListener('pointermove',move,{passive:true});
      cleanups.push(()=>hero.removeEventListener('pointermove',move));
    }
  }

  /* 2 — Menu: the ellipse opens like the seal, the camera pans over the pizza, the basil swings in. */
  function menuScene(){
    textIn('#speisekarte .menu-copy','top 80%');
    g.timeline({scrollTrigger:{trigger:'#speisekarte',start:'top 88%',end:'bottom 20%',scrub:.8,invalidateOnRefresh:true}})
      .fromTo('.macro-viewport',{clipPath:'ellipse(0% 0% at 50% 50%)',rotation:-12},{clipPath:'ellipse(72% 72% at 50% 50%)',rotation:0,duration:.32,ease:'power2.out'},0)
      .fromTo('#menu-macro',{x:()=>-70*U()},{x:()=>60*U(),duration:1,ease:'none'},0)
      .fromTo('.ingredient-gesture',{rotation:-40,x:()=>-90*U(),autoAlpha:0},{rotation:6,x:0,autoAlpha:1,duration:.35,ease:'back.out(1.3)'},.08)
      .fromTo('.ingredient-gesture .stem',{strokeDasharray:160,strokeDashoffset:160},{strokeDashoffset:0,duration:.25},.1)
      .fromTo('.brush-mark',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.18},.28)
      .to('.ingredient-gesture',{rotation:-8,duration:.5,ease:'sine.inOut'},.5);
    g.from('.category-rail button',{y:18,autoAlpha:0,stagger:.05,duration:.5,ease:'power3.out',scrollTrigger:{trigger:'.category-rail',start:'top 92%',toggleActions:'play none none reverse'}});
  }

  /* 3 — 48 Stunden: the number and the clock run with the scroll, the chef's window opens. */
  function konzeptScene(){
    const num=$('.dough-number'),c={v:0};
    g.timeline({scrollTrigger:{trigger:'#konzept',start:'top 85%',end:'top 32%',scrub:.6}})
      .fromTo(c,{v:0},{v:48,ease:'power1.out',onUpdate:()=>{num.textContent=String(Math.round(c.v));}},0)
      .fromTo('.clock-fill',{strokeDashoffset:100},{strokeDashoffset:0,ease:'none'},0)
      .fromTo('.chef-window',{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(72% at 50% 50%)',ease:'power2.out',duration:.6},0)
      .from('.dough-l1',{xPercent:-30,autoAlpha:0,duration:.5},.3)
      .from('.dough-l2',{xPercent:-20,autoAlpha:0,duration:.5},.42)
      .from('.dough-actions>*',{y:24,autoAlpha:0,stagger:.08,duration:.4},.55);
    g.fromTo('.chef-window img',{y:()=>-60*U()},{y:()=>60*U(),ease:'none',scrollTrigger:{trigger:'#konzept',start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
    g.timeline({scrollTrigger:{trigger:'#konzept',start:'top 65%',end:'center 35%',scrub:.7}})
      .fromTo('.tomato-vine .vine',{strokeDasharray:240,strokeDashoffset:240},{strokeDashoffset:0,duration:.5},0)
      .from('.tomato-vine .tomato',{y:-80,autoAlpha:0,rotation:-25,duration:.45,stagger:.1,ease:'bounce.out',transformOrigin:'50% 0%'},.2)
      .to('.tomato-vine',{rotation:4,duration:.6,ease:'sine.inOut'},.3);
  }

  /* 4 — Unser Konzept: three columns land at different speeds, each photo turns open like the seal. */
  function pillarsScene(){
    textIn('#unser-konzept .pillars-head');
    $$('.pillar').forEach((p,i)=>{
      g.timeline({scrollTrigger:{trigger:desk()?'#unser-konzept':p,start:'top 88%',end:desk()?'center 55%':'top 45%',scrub:.7,invalidateOnRefresh:true}})
        .from(p,{y:()=>(desk()?90+i*70:60)*U(),ease:'none'},0)
        .fromTo($('.pillar-photo',p),{clipPath:'circle(0% at 50% 50%)',rotation:-120},{clipPath:'circle(60% at 50% 50%)',rotation:0,ease:'power2.out',duration:.6},0)
        .from($('h3',p),{x:()=>-60*U(),rotation:-8,autoAlpha:0,duration:.5},.2)
        .fromTo($('.pillar-tag svg',p),{rotation:-270},{rotation:0,duration:1,ease:'none'},0)
        .from([$('p',p),$('a',p)],{autoAlpha:0,y:20,stagger:.08,duration:.35},.45);
    });
  }

  /* 5 — Über Al Volo: pinned; the six reasons travel sideways, each photo drifts in its frame. */
  function aboutScene(){
    textIn('#ueber-uns .about-head','top 80%');
    if(!desk())return;
    const wrap=$('.about-track-wrap'),track=$('.about-track'),cards=$$('.feature');
    const dist=()=>Math.max(0,track.scrollWidth-wrap.clientWidth);
    const first=cards.filter(c=>c.getBoundingClientRect().left<innerWidth*.92);
    g.from(first,{y:()=>80*U(),rotation:4,autoAlpha:0,stagger:.1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'#ueber-uns',start:'top 70%',toggleActions:'play none none reverse'}});
    const tween=g.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#ueber-uns',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.7,anticipatePin:1,invalidateOnRefresh:true,onUpdate:s=>window.ALVOLO_ABOUT?.(s.progress)}});
    cards.forEach(card=>{
      g.fromTo($('figure img',card),{xPercent:-6},{xPercent:6,ease:'none',scrollTrigger:{trigger:card,containerAnimation:tween,start:'left right',end:'right left',scrub:true}});
      if(!first.includes(card))g.from(card,{rotation:7,y:()=>60*U(),transformOrigin:'0% 100%',ease:'power2.out',scrollTrigger:{trigger:card,containerAnimation:tween,start:'left 100%',end:'left 62%',scrub:true}});
    });
  }

  /* 6 — Pizza · Pasta · Passione: pinned; the words drift apart while the films pour into them. */
  function passioneScene(){
    const vids=$$('#passione video'),lines=$$('.vline');
    let st={trigger:'#passione',start:'top 80%',end:'bottom 45%',scrub:.7};
    if(desk()){const pin=ST.create({trigger:'#passione',start:'top top',end:'+=85%',pin:true,anticipatePin:1});st={trigger:'#passione',start:'top 65%',end:()=>pin.end,scrub:.7};}
    g.timeline({scrollTrigger:st})
      .fromTo(lines[0],{xPercent:12},{xPercent:-5,ease:'none',duration:1},0)
      .fromTo(lines[1],{xPercent:-12},{xPercent:5,ease:'none',duration:1},0)
      .fromTo(lines[2],{xPercent:8},{xPercent:-3,ease:'none',duration:1},0)
      .fromTo(vids[0],{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.36,ease:'power1.inOut'},.04)
      .fromTo(vids[1],{clipPath:'inset(0% 0% 0% 100%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.36,ease:'power1.inOut'},.3)
      .fromTo(vids[2],{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.36,ease:'power1.inOut'},.56)
      .from('.vtag',{autoAlpha:0,y:24,rotation:-14,stagger:.25,duration:.2},.12)
      .from('.passione-note',{autoAlpha:0,y:30,duration:.2},.8);
    ST.create({trigger:'#passione',start:'top bottom',end:'bottom top',onToggle:s=>vids.forEach(v=>s.isActive?play(v):pause(v))});
  }

  /* 7 — Vom Teig zum Tisch: pinned stories; the scroll moves from film to film like a story bar. */
  function storiesScene(cleanups){
    textIn('#erleben .reels-copy','top 78%');
    g.from('.reels-lead,.reels-text,.checks li,.reels-copy .button',{x:-30,autoAlpha:0,stagger:.07,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.reels-copy',start:'top 70%',toggleActions:'play none none reverse'}});
    const cards=$$('.story'),bars=$$('.story-bars i'),vids=cards.map(c=>$('video',c));
    let active=-1,inView=false;
    const fill=(k,f)=>bars[k].style.setProperty('--f',Math.max(0,Math.min(1,f)).toFixed(3));
    function activate(i){
      if(i===active)return;active=i;
      cards.forEach((c,k)=>{
        const on=k===i;c.classList.toggle('is-active',on);
        if(desk())g.to(c,{rotation:on?0:k<i?-7:7,y:on?0:()=>22*U(),x:on?0:()=>(k<i?-14:14)*U(),filter:on?'brightness(1)':'brightness(.5)',zIndex:on?3:k<i?1+k:2-(k-i),duration:.7,ease:'power3.out',overwrite:'auto'});
        if(on&&inView)play(vids[k]);else pause(vids[k]);
        if(!desk())fill(k,k<i?1:0);
      });
    }
    if(desk()){
      g.set(cards,{transformOrigin:'50% 100%'});
      const pin=ST.create({trigger:'#erleben',start:'top top',end:'+=170%',pin:true,anticipatePin:1,onUpdate:s=>{bars.forEach((b,k)=>fill(k,s.progress*3-k));activate(Math.min(2,Math.floor(s.progress*3)));}});
      g.fromTo('.reels-background',{y:()=>40*U()},{y:()=>-60*U(),ease:'none',scrollTrigger:{trigger:'#erleben',start:'top bottom',end:()=>pin.end,scrub:true,invalidateOnRefresh:true}});
      bars.forEach((b,k)=>fill(k,pin.progress*3-k));
    }else{
      // phones: the card most in view plays; its bar follows the film
      const row=$('.story-row');
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=.6)activate(cards.indexOf(e.target));}),{root:row,threshold:[.6]});
      cards.forEach(c=>io.observe(c));
      const time=e=>{const k=vids.indexOf(e.target);if(k===active&&e.target.duration)fill(k,e.target.currentTime/e.target.duration);};
      vids.forEach(v=>v.addEventListener('timeupdate',time));
      cleanups.push(()=>{io.disconnect();vids.forEach(v=>v.removeEventListener('timeupdate',time));});
      bars.forEach((b,k)=>fill(k,0));
    }
    ST.create({trigger:'#erleben',start:'top bottom',end:'bottom top',onToggle:s=>{inView=s.isActive;vids.forEach((v,k)=>inView&&k===active?play(v):pause(v));}});
    activate(0);
  }

  /* 8 — Mittagstisch: the restaurant's display turns as you pass and switches on when it arrives. */
  function dealsScene(){
    textIn('#mittagstisch .deals-copy');
    g.from('.deals-copy p:not(.eyebrow),.deals-actions>*',{y:24,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.deals-copy',start:'top 75%',toggleActions:'play none none reverse'}});
    g.fromTo('.screen',{rotationY:-24,rotationX:5,x:()=>110*U(),transformPerspective:1100},{rotationY:16,rotationX:-2,x:()=>-10*U(),ease:'none',scrollTrigger:{trigger:'#mittagstisch',start:'top bottom',end:'bottom top',scrub:.8,invalidateOnRefresh:true}});
    const on=g.timeline({paused:true});
    on.fromTo('.screen-flash',{opacity:1,scaleY:.008},{scaleY:1,duration:.24,ease:'power4.in'})
      .fromTo('.screen-glass img',{autoAlpha:0,filter:'brightness(2.6) saturate(0)'},{autoAlpha:1,filter:'brightness(1) saturate(1)',duration:1,ease:'power2.out'},.2)
      .to('.screen-flash',{opacity:0,duration:.55,ease:'power2.out'},.22)
      .fromTo('.screen-live',{autoAlpha:0,scale:.5},{autoAlpha:1,scale:1,duration:.45,ease:'back.out(2.2)'},.85)
      .fromTo('.screen-live i',{opacity:1},{opacity:.15,duration:.4,repeat:5,yoyo:true,ease:'none'},1.1);
    onArrive('.screen','top 72%',on);
  }

  /* 9 — Ein Stück Hamburg: the façade rises in an arch, the pizza window rolls in like a wheel. */
  function placeScene(){
    textIn('#pizzeria .place-canvas','top 80%');
    g.timeline({scrollTrigger:{trigger:'#pizzeria',start:'top 92%',end:'bottom 25%',scrub:.8,invalidateOnRefresh:true}})
      .fromTo('.place-background',{clipPath:'inset(100% 0% 0% 0% round 50% 50% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0% round 0% 0% 0% 0%)',duration:.4,ease:'power2.out'},0)
      .fromTo('.place-background',{y:()=>70*U()},{y:()=>-40*U(),duration:1,ease:'none'},0)
      .fromTo('.place-pizza',{x:()=>260*U(),rotation:200},{x:0,rotation:0,duration:.5,ease:'power3.out'},.05)
      .fromTo('.place-pizza img',{x:()=>-50*U()},{x:()=>50*U(),duration:1,ease:'none'},0);
    g.from('.place-actions a,.gift-link',{y:20,autoAlpha:0,stagger:.05,duration:.5,ease:'power3.out',scrollTrigger:{trigger:'.place-actions',start:'top 92%',toggleActions:'play none none reverse'}});
  }

  /* 10 — Impressionen: two endless bands of photos run against each other with the scroll. */
  function galleryScene(){
    textIn('#impressionen .gallery-head');
    const tracks=$$('.marquee-track');
    // a deep clone would start every photo download while still detached (lazy loading ignored);
    // the copy gets its src only once it sits in the band, so it waits for the band like the originals
    tracks.forEach(t=>{const items=[...t.children];for(let k=0;k<2;k++)items.forEach(n=>{
      const c=n.cloneNode(false),from=$('img',n),img=document.createElement('img');
      for(const a of from.attributes)if(a.name!=='src')img.setAttribute(a.name,a.value);
      img.alt='';c.append(img);c.setAttribute('aria-hidden','true');c.tabIndex=-1;c.classList.add('is-clone');
      t.append(c);img.src=from.getAttribute('src');clones.push(c);});});
    const third=t=>t.scrollWidth/3,s={trigger:'#impressionen',start:'top bottom',end:'bottom top',scrub:.6,invalidateOnRefresh:true};
    g.fromTo(tracks[0],{x:()=>-third(tracks[0])*.15},{x:()=>-third(tracks[0])*.95,ease:'none',scrollTrigger:s});
    g.fromTo(tracks[1],{x:()=>-third(tracks[1])*.95},{x:()=>-third(tracks[1])*.15,ease:'none',scrollTrigger:{...s}});
  }

  /* 11 — Bewertungen: the score counts up, the stars fill, the three steps follow the scroll. */
  function reviewsScene(){
    textIn('#bewertungen .rating');textIn('#bewertungen .reward');
    g.from('.reward>p:not(.eyebrow),.rating-cta>*',{y:24,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'#bewertungen',start:'top 55%',toggleActions:'play none none reverse'}});
    const val=$('.rating-value'),r={v:0};
    g.timeline({scrollTrigger:{trigger:'#bewertungen',start:'top 80%',end:'top 25%',scrub:.6}})
      .fromTo(r,{v:0},{v:4.7,ease:'power2.out',onUpdate:()=>{val.textContent=r.v.toFixed(1).replace('.',',');}},0)
      .fromTo('.stars-full',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 5.3% 0% 0%)',ease:'power1.inOut'},0)
      .from('.stars-empty svg',{scale:0,rotation:-120,stagger:.06,duration:.3,ease:'back.out(2)'},0);
    const tl=g.timeline({scrollTrigger:{trigger:'.steps',start:'top 92%',end:'bottom 55%',scrub:.6,invalidateOnRefresh:true}});
    $$('.step').forEach((s,i)=>tl.from(s,{y:()=>70*U(),rotation:i===1?3:-3,autoAlpha:0,duration:.3,ease:'back.out(1.4)'},i*.22).from($('.step-icon',s),{scale:0,rotation:-140,duration:.22,ease:'back.out(2)'},i*.22+.08));
    tl.to('.step-gift .gift-lid',{y:-3.2,rotation:-18,svgOrigin:'3 10.4',duration:.18,ease:'back.out(3)'},'>');
  }

  /* 12 — Dein Platz wartet: the table opens like curtains, the booking card slides onto it. */
  function bookingScene(){
    textIn('#reservieren .booking-head');
    g.timeline({scrollTrigger:{trigger:'#reservieren',start:'top 90%',end:'bottom 35%',scrub:.8,invalidateOnRefresh:true}})
      .fromTo('.booking-background',{clipPath:'inset(0% 50% 0% 50%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.42,ease:'power2.inOut'},0)
      .fromTo('.booking-background',{y:()=>60*U()},{y:()=>-30*U(),duration:1,ease:'none'},0)
      .fromTo('.swoosh',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.2},.25)
      .fromTo('.booking-card',{y:()=>140*U(),rotation:6},{y:0,rotation:0,duration:.42,ease:'power3.out'},.06)
      .from('.booking-steps a',{x:()=>50*U(),autoAlpha:0,stagger:.05,duration:.15},.22)
      .from('.booking-contact>*',{y:26,autoAlpha:0,stagger:.05,duration:.15},.2);
  }

  /* 13 — Hier finden Sie uns: the façade opens from the pin, the pin drops, the hours flip into place. */
  function visitScene(){
    textIn('#kontakt .visit-copy');
    g.from('.visit-copy address,.flap,.visit-actions>*,.visit-links li',{y:22,autoAlpha:0,stagger:.06,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.visit-copy',start:'top 75%',toggleActions:'play none none reverse'}});
    g.fromTo('.visit-photo img',{clipPath:'circle(0% at 47% 27%)'},{clipPath:'circle(125% at 47% 27%)',ease:'power2.inOut',scrollTrigger:{trigger:'#kontakt',start:'top 85%',end:'center 50%',scrub:.7}});
    const tl=g.timeline({paused:true});
    tl.fromTo('.visit-pin',{y:()=>-170*U(),autoAlpha:0},{y:0,autoAlpha:1,duration:1,ease:'bounce.out'},0)
      .fromTo('.visit-pulse',{scale:.3,autoAlpha:.9},{scale:2.6,autoAlpha:0,duration:1.4,repeat:2,ease:'power1.out'},.65);
    const tiles=$$('.flap .tile:not(.sp)'),pool='0123456789:–MoSUhr';
    tiles.forEach((t,i)=>{const n=5+i%4;for(let j=0;j<n;j++){const at=.15+i*.04+j*.075;tl.call(()=>{t.textContent=j===n-1?t.dataset.c:pool[(Math.random()*pool.length)|0];},null,at).fromTo(t,{rotationX:-80},{rotationX:0,duration:.07,ease:'power1.out',immediateRender:false},at);}});
    onArrive('.visit-photo','top 72%',tl);
  }

  /* 14 — Footer: the name fills in as the page reaches its end. */
  function footerScene(){
    g.fromTo('.wordmark-fill',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top 85%',end:'bottom bottom',scrub:.6}});
    g.fromTo('.wordmark',{xPercent:-7},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.site-footer',start:'top bottom',end:'bottom bottom',scrub:.6}});
    g.from('.footer-cols>div',{y:30,autoAlpha:0,stagger:.08,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.footer-cols',start:'top 96%',toggleActions:'play none none reverse'}});
  }

  function build(){
    if(ctx)return;
    mode=desk();
    ctx=g.context(()=>{
      const cleanups=[];
      // created in page order, so every trigger measures the pins above it
      heroScene(cleanups);menuScene();konzeptScene();pillarsScene();aboutScene();passioneScene();
      storiesScene(cleanups);dealsScene();placeScene();galleryScene();reviewsScene();bookingScene();visitScene();footerScene();
      return ()=>cleanups.forEach(f=>f());
    });
    ST.refresh();
    document.fonts?.ready.then(()=>{if(ctx)ST.refresh();});
  }
  function kill(){
    if(!ctx){root.classList.remove('intro');return;}
    ctx.revert();ctx=null;
    unsplit();clones.forEach(c=>c.remove());clones=[];
    $$('main video').forEach(pause);
    $('.dough-number').textContent='48';$('.rating-value').textContent='4,7';
    $$('.flap .tile:not(.sp)').forEach(t=>{t.textContent=t.dataset.c;});
    $$('.story').forEach(c=>c.classList.remove('is-active'));$$('.story-bars i').forEach(b=>b.style.removeProperty('--f'));
    window.ALVOLO_ABOUT?.(0);
    root.classList.remove('intro');
  }

  document.addEventListener('alvolo:motion',e=>{if(e.detail?.enabled)build();else kill();});
  addEventListener('resize',()=>{if(ctx&&desk()!==mode){kill();build();}});
  if(window.ALVOLO_MOTION?.enabled)build();else root.classList.remove('intro');
})();
