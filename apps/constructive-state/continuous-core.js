/* FORAY-DYNAMIC-PROJECT-STATES · R-013. Smooth toy; not a brick-model limit. */
(function(root){
  'use strict';
  const TAU=2*Math.PI, defaults={policy:'steady',angle:30,speed:0.8,feed:0.1};
  function config(raw={}){
    const c={...defaults,...raw};
    if(!['steady','taper','hold'].includes(c.policy))throw Error('Unknown continuous way');
    for(const [k,lo,hi] of [['angle',0,360],['speed',-2,2],['feed',0.05,0.25]])
      if(!Number.isFinite(c[k])||c[k]<lo||c[k]>hi)throw Error('Invalid continuous '+k);
    return c;
  }
  const wrap=theta=>((theta%TAU)+TAU)%TAU;
  function input(x,c){return {omega:c.speed,q:c.policy==='hold'?0:c.policy==='taper'?c.feed*(1-x.w)**2:c.feed};}
  function update(x,i){return {base:{theta:x.theta,w:x.w},omega:i.omega,q:i.q};}
  function section(x,c){return update(x,input(x,c));}
  function project(v){return v.base;}
  function solution(t,c){
    if(!Number.isFinite(t)||t<0)throw Error('Time must be finite and nonnegative');
    const z=c.feed*t;
    return {theta:c.angle*Math.PI/180+c.speed*t,w:c.policy==='hold'?0:c.policy==='taper'?z/(1+z):z};
  }
  function tangent(x,v){return [-v.omega*Math.sin(x.theta),v.omega*Math.cos(x.theta),v.q];}
  const embed=x=>[Math.cos(x.theta),Math.sin(x.theta),x.w];
  const firstHit=c=>c.policy==='steady'?1/c.feed:Infinity;
  const horizon=c=>c.policy==='steady'?firstHit(c):4/c.feed;
  const api={TAU,defaults,config,wrap,input,update,section,project,solution,tangent,embed,firstHit,horizon};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.ContinuousDynamics=api;
})(typeof window!=='undefined'?window:globalThis);
