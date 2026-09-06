/* A projected data view of the existing model. No state or transition laws live here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProjectSiteScene=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const centres=[{x:307,y:480},{x:893,y:480}],rx=132,ry=39,height=96,inner=105;
 const n=x=>Math.round(x*10)/10, point=(x,y,r,a)=>[n(x+r*Math.cos(a)),n(y+r*ry/rx*Math.sin(a))];
 const xy=p=>p.join(','), mix=(a,b,t)=>a+(b-a)*t;
 function sector(x,y,course,brick,count,lift=0){
  const a=brick*2*Math.PI/count+.012,b=(brick+1)*2*Math.PI/count-.012;
  const bottom=y-course*height-lift,top=bottom-height,large=b-a>Math.PI?1:0;
  const p=point(x,top,rx,a),q=point(x,top,rx,b),r=point(x,bottom,rx,b),s=point(x,bottom,rx,a),ip=point(x,top,inner,a),iq=point(x,top,inner,b);
  return {face:`M${xy(p)} A${rx},${ry} 0 ${large} 1 ${xy(q)} L${xy(r)} A${rx},${ry} 0 ${large} 0 ${xy(s)} Z`,cap:`M${xy(p)} A${rx},${ry} 0 ${large} 1 ${xy(q)} L${xy(iq)} A${inner},${n(inner*ry/rx)} 0 ${large} 0 ${xy(ip)} Z`,target:point(x,top,rx*.92,(a+b)/2),depth:Math.sin((a+b)/2)};
 }
 function ring(f,c,site){
  const {x,y}=centres[site],parts=[];let placed=0;
  parts.push(`<ellipse cx="${x+7}" cy="${y+15}" rx="147" ry="49" fill="#29291c" opacity=".16"/>`);
  for(let course=0;course<c.courses;course++){
   const cells=Array.from({length:c.bricks},(_,b)=>({b,...sector(x,y,course,b,c.bricks)})).sort((a,b)=>a.depth-b.depth);
   for(const cell of cells){
    const done=Boolean(f.masks[course]&(1<<cell.b)),curing=done&&f.cool[course]>0;
    if(done)placed++;
    const shade=cell.depth<0?'url(#brick-dark)':'url(#brick-light)';
    parts.push(`<g class="site-sector ${done?'placed':'unplaced'}" data-site="${site}" data-course="${course}" data-brick="${cell.b}"><path d="${cell.face}" fill="${done?shade:'#eaf5ff'}" fill-opacity="${done?1:.12}" stroke="${curing?'#723ab0':done?'#763e29':'#d6f2ff'}" stroke-width="${done?2:1.5}" ${done?'':'stroke-dasharray="6 7"'}/><path d="${cell.cap}" fill="${curing?'#cbb1e0':done?'#cf8e63':'#d9f4ff'}" fill-opacity="${done?1:.2}" stroke="${done?'#774b35':'#d6f2ff'}" stroke-width="1.5"/></g>`);
   }
   if(f.cool[course]>0)parts.push(`<ellipse cx="${x}" cy="${y-(course+1)*height}" rx="139" ry="44" fill="none" stroke="#8455be" stroke-width="6" stroke-dasharray="7 5" opacity=".95"/>`);
  }
  parts.push(`<g class="site-ground-label"><rect x="${x-69}" y="${y+60}" width="138" height="45" rx="9" fill="#f9fbf2" fill-opacity=".94"/><text x="${x}" y="${y+91}" text-anchor="middle" font-size="27" font-weight="750" fill="#26362d">TOWER ${site?'B':'A'}</text></g>`);
  return {markup:parts.join(''),placed};
 }
 function hoist(x,y,target,working,number){
  const top=y-305,tx=target?.[0]??x+90,ty=target?.[1]??y-95,headY=Math.min(top+35,ty-45);
  return `<g class="site-hoist" data-hoist="${number}" data-working="${working}"><ellipse cx="${x+12}" cy="${y+9}" rx="58" ry="16" fill="#273122" opacity=".18"/><path d="M${x-30},${y} L${x},${top} L${x+29},${y} M${x-24},${y-55} L${x+23},${y-55} M${x-19},${y-110} L${x+18},${y-110} M${x-14},${y-165} L${x+13},${y-165}" fill="none" stroke="#68472c" stroke-width="11" stroke-linejoin="round"/><path d="M${x},${top+38} L${tx},${headY} M${x},${top} L${tx},${headY}" fill="none" stroke="#bf9757" stroke-width="12" stroke-linecap="round"/><path d="M${x},${top-8} L${tx},${headY}" stroke="#3d4038" stroke-width="2.5"/><circle cx="${tx}" cy="${headY}" r="9" fill="#394b4b" stroke="#f9d473" stroke-width="3"/><path d="M${tx},${headY+8} L${tx},${ty-9} q-9,12 1,15 q12,0 9,-12" fill="none" stroke="${working?'#fbe099':'#444e46'}" stroke-width="${working?4:3}"/><rect x="${x-18}" y="${y-51}" width="36" height="28" rx="4" fill="#244557" stroke="#bb9d69" stroke-width="3"/><circle cx="${x}" cy="${y-37}" r="9" fill="${working?'#eec157':'#899b98'}"/></g>`;
 }
 function commands(action){return !action||action==='wait'?[null,null]:action.split('|').map(x=>x==='-'?null:x);}
 function frame(s,c,options={}){
  const phase=Math.max(0,Math.min(1,options.phase||0)),starts=commands(options.nextAction),loads=[];
  const walls=s.fronts.map((f,i)=>ring(f,c,i));
  for(let i=0;i<2;i++){
   const f=s.fronts[i];let job=f.job;
   if(!job&&starts[i]&&phase>0){const [course,brick]=starts[i].split(':').map(Number);job={course,brick,remaining:c.duration};}
   if(!job)continue;
   const cell=sector(centres[i].x,centres[i].y,job.course,job.brick,c.bricks);
   const progress=(c.duration-job.remaining+phase)/c.duration,sweep=Math.min(1,progress*1.5),smooth=sweep*sweep*(3-2*sweep);
   const loadX=n(mix(i?1035:160,cell.target[0],smooth)),loadY=n(mix(421,cell.target[1]-12,progress)-Math.sin(Math.PI*progress)*125);
   loads.push({site:i,target:[loadX,loadY-35],markup:`<g class="site-load" data-load-site="${i}" transform="translate(${loadX} ${loadY})"><path d="M-24,4 L0,-35 L24,4" fill="none" stroke="#4d4230" stroke-width="3"/><rect x="-27" y="2" width="54" height="8" rx="2" fill="#71482a" stroke="#fff0bd" stroke-width="2"/><rect x="-23" y="-16" width="22" height="17" fill="#d68b58" stroke="#f9cd8f"/><rect x="1" y="-16" width="22" height="17" fill="#b76b42" stroke="#f9cd8f"/><rect x="-12" y="-31" width="24" height="15" fill="#d29365" stroke="#ffe3ab"/></g>`});
  }
  const lifting=loads.length,hoists=c.capacity===1?[hoist(600,477,loads[0]?.target,lifting>0,0)]:[hoist(550,500,loads.find(l=>l.site===0)?.target,loads.some(l=>l.site===0),0),hoist(663,465,loads.find(l=>l.site===1)?.target,loads.some(l=>l.site===1),1)];
  const markup=`<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="site-svg-title site-svg-desc" xmlns="http://www.w3.org/2000/svg"><title id="site-svg-title">Two cylindrical brick towers share ${c.capacity===1?'one hoist':'two hoists'} on a Borders hilltop</title><desc id="site-svg-desc">The masonry shows the current generated project state. Pale dashed sectors are still to build; gold marks a load in transit; purple rings mark curing. The landscape is an imagined Manorwater setting.</desc><defs><pattern id="brick-light" width="36" height="24" patternUnits="userSpaceOnUse"><rect width="36" height="24" fill="#b87550"/><path d="M0 0 H36 M0 12 H36 M0 24 H36 M18 0 V12 M0 12 V24 M36 12 V24" fill="none" stroke="#dfb99a" stroke-width="1.2"/></pattern><pattern id="brick-dark" width="36" height="24" patternUnits="userSpaceOnUse"><rect width="36" height="24" fill="#925337"/><path d="M0 0 H36 M0 12 H36 M0 24 H36 M18 0 V12 M0 12 V24 M36 12 V24" fill="none" stroke="#b58b6f" stroke-width="1.2"/></pattern></defs><image href="hilltop.png" x="0" y="0" width="1200" height="800"/>${walls.map(w=>w.markup).join('')}${hoists.join('')}${loads.map(l=>l.markup).join('')}${c.blockedB?'<g><rect x="819" y="603" width="149" height="41" rx="7" fill="#953d37"/><text x="893" y="630" text-anchor="middle" font-size="23" fill="white">ACCESS CLOSED</text></g>':''}</svg>`;
  const status=s.fronts.map((f,i)=>{
   const cure=f.cool.find(t=>t>0),complete=f.masks.every(m=>m===(1<<c.bricks)-1)&&!cure&&!f.job;
   return {site:i,placed:walls[i].placed,active:loads.some(l=>l.site===i),text:c.blockedB&&i===1?'Access closed':f.job||loads.some(l=>l.site===i)?'Hoist lifting':cure?'Mortar curing · '+cure+' tick'+(cure===1?'':'s'):complete?'Brickwork complete & cured':'Ready for the next lift'};
  });
  return {markup,status,lifting,placed:walls.reduce((n,w)=>n+w.placed,0)};
 }
 return {frame,sector,centres};
});
