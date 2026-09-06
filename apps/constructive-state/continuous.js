(function(){
  'use strict';
  const D=window.ContinuousDynamics,$=id=>document.getElementById(id),form=$('continuous-settings');
  let c={...D.defaults},t=0,layer=4,raf=null,last=0,active=false,visited=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stages=[
    ['A state is a point in X','X = S¹ × ℝ. Angle θ wraps around; completed work w does not. This cylinder is a space of project states, not the physical tower. The end is the circle w = 1.'],
    ['At that point: a plane of rates','TₓX contains pairs (angular rate, work rate). Its arrows start at this state; they are tendencies, not jumps to another state. The gold arrow is one selected rate.'],
    ['Keep every plane attached to its state','TX collects the tangent planes over all states. Projection π forgets the arrow and returns its base point. Only a few fibres are drawn: the complete bundle is four-dimensional.'],
    ['A section chooses one arrow at every state','vκ : X → TX satisfies π ∘ vκ = idₓ. The teal arrows sample this one smooth field. Change the way to change the whole section—not the underlying cylinder.'],
    ['A trajectory follows the chosen section','γ : [0,T] → X starts at x₀ and obeys γ̇(t) = vκ(γ(t)). Gold is the history traced by one moving state. A section supplies a rule everywhere; this curve visits only some states.']
  ];
  function writeURL(){const u=new URL(location.href);for(const[k,v]of Object.entries(c))u.searchParams.set('c'+k,v);history.replaceState(null,'',u);}
  function fill(){for(const[k,v]of Object.entries(c))form.elements.namedItem(k).value=String(v);}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=null;$('continuous-play').textContent='Play trajectory';}
  function play(){stop();if(t>=D.horizon(c))t=0;last=performance.now();$('continuous-play').textContent='Pause trajectory';function tick(now){t=Math.min(D.horizon(c),t+(now-last)/1000*D.horizon(c)/14);last=now;draw();if(t<D.horizon(c))raf=requestAnimationFrame(tick);else stop();}raf=requestAnimationFrame(tick);}
  function enter(on){active=on;if(!on)return stop();draw();if(!visited){visited=true;if(!reduced.matches)play();}}
  function point(theta,w){return [222+132*Math.cos(theta)-51*Math.sin(theta),328-224*w+33*Math.cos(theta)+42*Math.sin(theta)];}
  function path(points){return points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(2)).join(',')).join(' ');}
  function curve(w){return Array.from({length:97},(_,i)=>point(D.TAU*i/96,w));}
  function arrow(x,scale,color,width=2){const v=D.section(x,c),a=point(x.theta,x.w),b=[a[0]+scale*(-132*Math.sin(x.theta)-51*Math.cos(x.theta))*v.omega,a[1]+scale*((-33*Math.sin(x.theta)+42*Math.cos(x.theta))*v.omega-224*v.q)];return '<path d="'+path([a,b])+'" stroke="'+color+'" stroke-width="'+width+'" marker-end="url(#c-arrow-'+(color==='#dca74e'?'gold':'teal')+')" fill="none"/>';}
  function plane(x){const a=point(x.theta,x.w),e=[(-132*Math.sin(x.theta)-51*Math.cos(x.theta))*.22,(-33*Math.sin(x.theta)+42*Math.cos(x.theta))*.22],f=[0,-30];return '<path d="'+path([[a[0]-e[0]-f[0],a[1]-e[1]-f[1]],[a[0]+e[0]-f[0],a[1]+e[1]-f[1]],[a[0]+e[0]+f[0],a[1]+e[1]+f[1]],[a[0]-e[0]+f[0],a[1]-e[1]+f[1]]])+'Z" fill="#83bdc0" fill-opacity=".12" stroke="#83bdc0" stroke-opacity=".5"/>';}
  function draw(){
    const x=D.solution(t,c),v=D.section(x,c),a=point(x.theta,x.w),max=D.horizon(c),p=t/max,narrow=matchMedia('(max-width:700px)').matches;
    let s='<svg viewBox="0 0 '+(narrow?'440 795':'780 425')+'" role="img" aria-labelledby="c-svg-title c-svg-desc"><title id="c-svg-title">A state cylinder, tangent fibres and a generated continuous trajectory</title><desc id="c-svg-desc">Angle wraps around the cylinder; height represents completed work, not wall height. The selected state, its rate and its history share the same exact solution.</desc><defs><marker id="c-arrow-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#77c8c4"/></marker><marker id="c-arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#dca74e"/></marker></defs><text x="34" y="30" class="c-svg-label">STATE SPACE X</text>';
    for(let j=0;j<=4;j++)s+='<path d="'+path(curve(j/4))+'" fill="none" stroke="'+(j===4?'#dca74e':'#36545a')+'" stroke-width="'+(j===4?2:1)+'"/>';
    for(let j=0;j<12;j++)s+='<path d="'+path([point(j*D.TAU/12,0),point(j*D.TAU/12,1)])+'" stroke="#36545a" stroke-opacity=".6"/>';
    s+='<text x="28" y="93" fill="#f3cb87">end: w = 1</text><text x="30" y="398" fill="#b7c9c8">θ ↻ position around the workfront</text><text x="294" y="398" fill="#b7c9c8">w ↑ work done</text>';
    if(layer>=2)for(const th of [.4,2,3.7,5.2])for(const w of [.2,.65])s+=plane({theta:th,w});
    if(layer>=3)for(let j=0;j<12;j++)for(const w of [.05,.3,.55,.8])s+=arrow({theta:j*D.TAU/12,w},.15,'#77c8c4',1.5);
    if(layer>=4){const n=Math.max(2,Math.ceil(t*35)+1),pts=Array.from({length:n},(_,i)=>{const y=D.solution(t*i/(n-1),c);return point(y.theta,y.w);});s+='<path d="'+path(pts)+'" stroke="#dca74e" stroke-width="3.2" fill="none"/>';}
    if(layer>=1){s+=plane(x)+arrow(x,.48,'#dca74e',3);}
    s+='<circle cx="'+a[0]+'" cy="'+a[1]+'" r="6" fill="#fff4d6" stroke="#dca74e" stroke-width="2"/>';
    // One periodic chart cut. Split traces at the display seam; no false cross-chart chord.
    const left=492,top=82,wid=240,hei=246,plot=y=>[left+D.wrap(y.theta)/D.TAU*wid,top+hei*(1-y.w)];
    s+='<g transform="'+(narrow?'translate(-400 395)':'translate(0 0)')+'"><text x="480" y="30" class="c-svg-label">UNWRAPPED COORDINATE VIEW</text>';
    s+='<rect x="492" y="82" width="240" height="246" fill="#122b32" stroke="#496368"/><path d="M492 82H732" stroke="#dca74e" stroke-width="2"/><text x="485" y="350" fill="#b7c9c8">0</text><text x="708" y="350" fill="#b7c9c8">2π</text><text x="519" y="375" fill="#b7c9c8">same seam: left ≡ right</text>';
    if(layer>=3)for(let j=0;j<7;j++)for(const w of [.1,.35,.6,.85]){const z={theta:j*D.TAU/7,w},k=D.section(z,c),a=plot(z),dt=.4;s+='<path d="'+path([a,[a[0]+dt*wid/D.TAU*k.omega,a[1]-dt*hei*k.q]])+'" fill="none" stroke="#77c8c4" stroke-opacity=".8" marker-end="url(#c-arrow-teal)"/>';}
    if(layer>=4){let seg=[],prev=null;for(let i=0;i<=500;i++){const y=plot(D.solution(t*i/500,c));if(prev&&Math.abs(y[0]-prev[0])>wid/2){s+='<path d="'+path(seg)+'" fill="none" stroke="#dca74e" stroke-width="2.5"/>';seg=[];}seg.push(y);prev=y;}s+='<path d="'+path(seg)+'" fill="none" stroke="#dca74e" stroke-width="2.5"/>';}
    const z=plot(x);s+='<circle cx="'+z[0]+'" cy="'+z[1]+'" r="5" fill="#fff4d6"/></g></svg>';
    $('continuous-art').innerHTML=s;
    $('continuous-position').value=Math.round(p*1000);$('continuous-time').textContent=t.toFixed(2)+' time units';
    $('continuous-readout').textContent='x(t) = ('+(D.wrap(x.theta)*180/Math.PI).toFixed(1)+'°, '+x.w.toFixed(4)+') · vκ(x) = ('+v.omega.toFixed(2)+' rad/time, '+v.q.toFixed(4)+' work/time)';
    $('continuous-progress').textContent=(100*x.w).toFixed(2)+'%';
    $('continuous-gap').textContent=(1-x.w).toFixed(4);
    $('continuous-result').textContent=c.policy==='steady'?'First hit: t = '+(1/c.feed).toFixed(2)+'. The exact solution crosses w = 1 in finite time.':c.policy==='taper'?'Never reaches w = 1 at finite time. Remaining work = 1 / (1 + q₀t), always positive.':c.speed===0?'No completion: neither angle nor completed work changes.':'No completion: the workfront moves around the circle, but completed work stays at zero.';
    $('continuous-formula').textContent=c.policy==='steady'?'κ(θ,w) = (ω, q₀)       w(t) = q₀t':c.policy==='taper'?'κ(θ,w) = (ω, q₀(1−w)²)       w(t) = q₀t / (1+q₀t)':'κ(θ,w) = (ω, 0)       w(t) = 0';
    $('continuous-frame-status').textContent=t>=max?(c.policy==='steady'?'Replay stopped at the first hit of the end. The differential equation itself has not been clamped.':'Observation window ended. This is not completion; extend time conceptually using the exact formula.'):'Movie speed is illustrative; all displayed states use the exact continuous solution.';
    $('continuous-stage-title').textContent=stages[layer][0];$('continuous-stage-copy').textContent=stages[layer][1];
  }
  function apply(raw,persist=true){try{const next=D.config(raw);stop();c=next;t=0;fill();draw();if(persist)writeURL();$('continuous-receipt').textContent='Applied continuous way is in this URL. Changes restart at w = 0; the finite brick model is unchanged. Replay time and explanation layer are temporary. No project record or file is saved.';}catch(e){$('continuous-receipt').textContent='Not applied: '+e.message+'. Previous continuous model retained.';}}
  form.addEventListener('submit',e=>{e.preventDefault();const raw={};for(const[k,v]of new FormData(form))raw[k]=k==='policy'?v:Number(v);apply(raw);});
  form.addEventListener('change',()=>{$('continuous-receipt').textContent='Edited, not applied. Apply way to restart with these settings; the displayed field and URL still identify the previous way.';});
  $('continuous-reset').addEventListener('click',()=>apply(D.defaults));
  $('continuous-play').addEventListener('click',()=>raf?stop():play());
  $('continuous-restart').addEventListener('click',()=>{stop();t=0;draw();});
  $('continuous-position').addEventListener('input',()=>{stop();t=Number($('continuous-position').value)/1000*D.horizon(c);draw();});
  document.querySelectorAll('[data-continuous-layer]').forEach(b=>b.addEventListener('click',()=>{layer=Number(b.dataset.continuousLayer);document.querySelectorAll('[data-continuous-layer]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));draw();}));
  document.addEventListener('experiment-panel',e=>enter(e.detail==='continuous'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
  window.addEventListener('resize',()=>{if(active)draw();});
  const raw={...D.defaults},params=new URL(location.href).searchParams;for(const k of Object.keys(raw))if(params.has('c'+k))raw[k]=k==='policy'?params.get('c'+k):Number(params.get('c'+k));
  try{D.config(raw);apply(raw,false);}catch(e){apply(D.defaults,false);$('continuous-receipt').textContent='Invalid continuous settings in URL: defaults shown. URL retained unchanged; Apply way or Reset continuous to replace them.';}
  enter(!$('panel-continuous').hidden);
  window.ContinuousView={stop,getState:()=>({config:{...c},time:t,layer,active,running:!!raf})};
})();
