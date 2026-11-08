const {test}=require('node:test')
const assert=require('node:assert/strict')
const React=require('react')
const compile=require('./helpers/compile.cjs')
const country={id:'BJ',code:'BJ',translations:{fr:'Bénin',en:'Benin'}}
const other={id:'TG',code:'TG',translations:{fr:'Togo',en:'Togo'}}
const city={id:'calavi',name:'Calavi',country}
const defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}}
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()}
function walk(node){return !node||typeof node!=='object'?[]:[node,...React.Children.toArray(node.props?.children).flatMap(walk)]}
function text(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);return React.Children.toArray(node.props?.children).map(text).join('')}
function harness(t,{authenticated=false}={}){
  const previous=global.document
  global.document={activeElement:null,body:{style:{overflow:''}},addEventListener(){},removeEventListener(){}}
  const cityModule=compile('lib/store/city.ts',{'zustand/middleware':{persist:config=>config}})
  const authModule=compile('lib/store/auth.ts',{'zustand/middleware':{persist:config=>config},'./city':cityModule})
  const auth=authModule.useAuthStore,location=cityModule.useCityStore
  if(authenticated)auth.getState().setAuth({id:'A',role:'USER'},'access','refresh')
  const api={countries:async()=>[country,other],cities:async()=>[city],save:async()=>{},profile:async()=>({id:'A',role:'USER',profile:{city}})}
  const calls=[]
  const slots=[],effects=[],cleanups=[];let cursor=0,closed=0
  const useState=initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}]}
  const {GeoModal}=compile('components/modals/geo-modal.tsx',{
    react:{...React,useState,useRef:initial=>{const [value]=useState({current:initial});return value},useEffect:(fn,deps)=>{const i=cursor++;const old=slots[i];if(!old||deps.some((v,j)=>v!==old[j])){slots[i]=deps;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn()})}}},
    '@/lib/api/geo':{getCountries:()=>api.countries(),getCities:code=>{calls.push(['cities',code]);return api.cities(code)}},
    '@/lib/api/auth':{updateLocation:id=>{calls.push(['save',id]);return api.save(id)},getUserProfile:()=>{calls.push(['profile']);return api.profile()}},
    '@/lib/store/auth':authModule,
    '@/lib/store/city':{useCityStore:Object.assign(()=>location.getState(),{getState:location.getState})},
    '@/lib/utils/api-error':{getApiErrorMessage:error=>error.message},
  })
  const onClose=()=>closed++
  const render=()=>{cursor=0;const tree=GeoModal({onClose});while(effects.length)effects.shift()();return tree}
  const button=label=>{const found=walk(render()).find(n=>n.type==='button'&&text(n)===label);assert.ok(found,`button ${label}`);return found}
  const settle=async()=>{for(let i=0;i<4;i++){render();await flush()}}
  t.after(()=>{cleanups.forEach(fn=>fn?.());if(previous===undefined)delete global.document;else global.document=previous})
  return{api,calls,auth,location,render,button,settle,get closed(){return closed}}
}
async function pick(s){await s.settle();s.button('Bénin').props.onClick();await s.settle();s.button('Calavi').props.onClick();await s.settle()}

test('guest selects a city without saving until explicit confirmation',async t=>{
  const s=harness(t);await pick(s)
  assert.equal(s.location.getState().selectedCity,null);assert.equal(s.closed,0)
  assert.equal(s.calls.some(c=>c[0]==='save'),false)
  await s.button('Confirmer').props.onClick()
  assert.equal(s.location.getState().selectedCity.id,'calavi');assert.equal(s.closed,1)
})
test('authenticated confirmation saves through API then uses the freshly fetched profile',async t=>{
  const s=harness(t,{authenticated:true});await pick(s)
  assert.equal(s.calls.some(c=>c[0]==='save'),false)
  await s.button('Confirmer').props.onClick()
  assert.deepEqual(s.calls.slice(-2),[['save','calavi'],['profile']])
  assert.equal(s.auth.getState().user.profile.city.id,'calavi')
  assert.equal(s.location.getState().selectedCity.id,'calavi');assert.equal(s.closed,1)
})
test('failed save retains the original city and allows retry with an inline error',async t=>{
  const s=harness(t,{authenticated:true});await pick(s)
  s.api.save=async()=>{throw new Error('Connexion indisponible')}
  await s.button('Confirmer').props.onClick()
  assert.equal(s.location.getState().selectedCity,null);assert.equal(s.closed,0)
  assert.ok(walk(s.render()).some(n=>n.props?.role==='alert'&&text(n).includes('Connexion indisponible')))
  assert.equal(s.button('Confirmer').props.disabled,false)
})
test('late country response cannot replace cities for the newly selected country',async t=>{
  const s=harness(t);const gate=defer();s.api.cities=code=>code==='BJ'?gate.promise:Promise.resolve([{id:'lome',name:'Lomé',country:other}])
  await s.settle();s.button('Bénin').props.onClick();await s.settle()
  s.button('Togo').props.onClick();await s.settle();gate.resolve([city]);await s.settle()
  assert.ok(s.button('Lomé'));assert.equal(walk(s.render()).some(n=>n.type==='button'&&text(n)==='Calavi'),false)
})
test('an account change during save cannot overwrite the new account location',async t=>{
  const s=harness(t,{authenticated:true});await pick(s);const gate=defer();s.api.save=()=>gate.promise
  const request=s.button('Confirmer').props.onClick()
  s.auth.getState().setAuth({id:'B',role:'USER'},'B','B-refresh')
  gate.resolve();await request
  assert.equal(s.calls.some(c=>c[0]==='profile'),false);assert.equal(s.location.getState().selectedCity,null);assert.equal(s.closed,0)
})
test('opening the modal preselects the current country and city',async t=>{
  const s=harness(t);s.location.getState().setCity(city,country);await s.settle()
  assert.equal(s.button('Bénin').props['aria-pressed'],true)
  const selected=walk(s.render()).find(n=>n.type==='button'&&text(n).includes('Calavi'))
  assert.equal(selected.props['aria-pressed'],true)
  assert.equal(s.button('Confirmer').props.disabled,false)
  assert.equal(s.calls.some(c=>c[0]==='save'),false)
})
test('a failed profile refresh after saving keeps the modal open for retry',async t=>{
  const s=harness(t,{authenticated:true});await pick(s)
  s.api.profile=async()=>{throw new Error('Profil momentanément indisponible')}
  await s.button('Confirmer').props.onClick()
  assert.equal(s.closed,0);assert.equal(s.location.getState().selectedCity,null)
  assert.ok(walk(s.render()).some(n=>n.props?.role==='alert'&&text(n).includes('Profil momentanément indisponible')))
  assert.equal(s.button('Confirmer').props.disabled,false)
})
