const {test} = require('node:test')
const assert = require('node:assert/strict')
const axios = require('axios')
const compile = require('./helpers/compile.cjs')
const defer = () => {let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}}
const flush = async()=>{for(let i=0;i<20;i++)await Promise.resolve()}
function setup(t){
  const old={window:global.window,localStorage:global.localStorage,fetch:global.fetch,post:axios.post}
  const items=new Map()
  global.window={}
  global.localStorage={getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,String(value)),removeItem:key=>items.delete(key)}
  global.fetch=async()=>({ok:true})
  t.after(()=>{axios.post=old.post;for(const key of ['window','localStorage','fetch']){if(old[key]===undefined)delete global[key];else global[key]=old[key]}})
  const city=compile('lib/store/city.ts')
  const auth=compile('lib/store/auth.ts',{'./city':city})
  const {apiClient}=compile('lib/api/client.ts',{'@/lib/store/auth':auth})
  const calls=[]
  let refreshes=0
  let refreshResult={data:{data:{accessToken:'fresh-access'}}}
  let refreshError=null
  let gate=null
  axios.post=async(url,data,config)=>{
    refreshes++;calls.push({url,data,config,refresh:true})
    if(gate)return gate
    if(refreshError)throw refreshError
    return refreshResult
  }
  apiClient.defaults.adapter=async config=>{
    calls.push({url:config.url,headers:{...config.headers},retry:config._retry})
    const response={status:config._retry?200:401,statusText:'',headers:{},config,data:{success:false,error:{code:'TOKEN_EXPIRED'}}}
    if(response.status===401)throw new axios.AxiosError('unauthorized','ERR_BAD_REQUEST',config,undefined,response)
    return response
  }
  return{city:city.useCityStore,auth:auth.useAuthStore,api:apiClient,calls,items,get refreshes(){return refreshes},
    fail:status=>{refreshError={response:{status}}},block:p=>{gate=p},result:v=>{refreshResult=v},reload:()=>compile('lib/store/auth.ts',{'./city':city}).useAuthStore}
}

test('fresh visitor 401 never refreshes or creates an expired-session notice',async t=>{
  const s=setup(t);await assert.rejects(s.api.get('/protected'))
  assert.equal(s.refreshes,0);assert.equal(s.auth.getState().sessionExpired,false)
  assert.equal(s.calls[0].headers.Authorization,undefined)
})
test('public login failure never sends old bearer or triggers refresh',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  await assert.rejects(s.api.post('/auth/login',{email:'a@example.com',password:'wrong'}))
  assert.equal(s.calls[0].headers.Authorization,undefined);assert.equal(s.refreshes,0)
  assert.equal(s.auth.getState().sessionExpired,false)
})
test('invalid credentials are a login error even if backend sends generic token code',t=>{
  const errors=compile('lib/utils/api-error.ts',{'react-hot-toast':{__esModule:true,default:{error(){}}}})
  assert.equal(errors.getLoginErrorMessage({response:{status:401,data:{error:{code:'TOKEN_EXPIRED'}}}}),'Email ou mot de passe incorrect.')
  assert.doesNotMatch(errors.getLoginErrorMessage(new Error('offline')),/Session expirée/)
  assert.equal(errors.getLoginErrorMessage({response:{status:403,data:{message:['Compte suspendu.','Contactez le support.']}}}),'Compte suspendu. Contactez le support.')
})
test('valid refresh updates both storage representations and retains missing refresh token',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  await s.api.get('/protected')
  assert.equal(s.refreshes,1);assert.equal(s.items.get('accessToken'),'fresh-access');assert.equal(s.items.get('refreshToken'),'old-refresh')
  assert.equal(s.auth.getState().accessToken,'fresh-access');assert.equal(s.auth.getState().refreshToken,'old-refresh')
})
test('parallel 401s share one refresh and retry once',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  const gate=defer();s.block(gate.promise)
  const requests=Promise.all([s.api.get('/one'),s.api.get('/two')]);await flush()
  assert.equal(s.refreshes,1)
  gate.resolve({data:{data:{accessToken:'fresh-access',refreshToken:'rotated-refresh'}}});await requests
  assert.equal(s.calls.filter(call=>call.retry).length,2);assert.equal(s.auth.getState().refreshToken,'rotated-refresh')
})
test('explicitly rejected existing session gets a single ephemeral expiry notice',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh');s.fail(401)
  await assert.rejects(s.api.get('/protected'))
  assert.equal(s.auth.getState().isAuthenticated,false);assert.equal(s.auth.getState().sessionExpired,true)
  assert.equal(s.items.get('accessToken'),undefined)
  // A new page load as a visitor must not replay this notice.
  assert.equal(s.reload().getState().sessionExpired,false)
  s.auth.getState().clearSessionNotice();assert.equal(s.auth.getState().sessionExpired,false)
})
test('missing refresh token expires only an established session',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','')
  await assert.rejects(s.api.get('/protected'));assert.equal(s.auth.getState().sessionExpired,true);assert.equal(s.refreshes,0)
})
test('stray tokens without an authenticated user never create a visitor warning',async t=>{
  const s=setup(t);s.items.set('accessToken','stray');s.items.set('refreshToken','stray-refresh');s.fail(403)
  await assert.rejects(s.api.get('/protected'));assert.equal(s.auth.getState().sessionExpired,false)
})
test('refresh server errors and network failures preserve the current session',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  for(const status of [500,503,429,undefined]){
    s.fail(status);await assert.rejects(s.api.get('/protected'))
    assert.equal(s.auth.getState().isAuthenticated,true);assert.equal(s.auth.getState().sessionExpired,false)
    assert.equal(s.items.get('accessToken'),'old-access')
  }
})
test('an old refresh rejection cannot disconnect a newly signed-in account',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  const gate=defer();s.block(gate.promise)
  const pending=s.api.get('/protected');const rejected=assert.rejects(pending);await flush()
  s.auth.getState().setAuth({id:'B',role:'USER'},'B-access','B-refresh')
  gate.reject({response:{status:401}});await rejected
  assert.equal(s.auth.getState().user.id,'B');assert.equal(s.auth.getState().sessionExpired,false);assert.equal(s.items.get('accessToken'),'B-access')
})
test('old refresh success cannot overwrite new account tokens',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh')
  const gate=defer();s.block(gate.promise)
  const rejected=assert.rejects(s.api.get('/protected'));await flush()
  s.auth.getState().setAuth({id:'B',role:'USER'},'B-access','B-refresh')
  gate.resolve({data:{data:{accessToken:'stale-A',refreshToken:'stale-A-refresh'}}});await rejected
  assert.equal(s.items.get('accessToken'),'B-access');assert.equal(s.items.get('refreshToken'),'B-refresh')
})
test('malformed refresh response is a service error, not proof of expired session',async t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'old-access','old-refresh');s.result({data:{data:{}}})
  await assert.rejects(s.api.get('/protected'));assert.equal(s.auth.getState().isAuthenticated,true);assert.equal(s.auth.getState().sessionExpired,false)
})


function loginHarness(expired=false) {
  const React=require('react')
  const {renderToStaticMarkup}=require('react-dom/server')
  const errors=compile('lib/utils/api-error.ts',{'react-hot-toast':{__esModule:true,default:{error(){}}}})
  const values=[];let index=0,submit,authWrites=0
  const auth={sessionExpired:expired,setAuth(){authWrites++},updateUser(){},clearSessionNotice(){auth.sessionExpired=false}}
  const authStore=Object.assign(()=>auth,{getState:()=>auth})
  const {default:Login}=compile('app/(main)/auth/login/_login-client.tsx',{
    react:{...React,useState(initial){const i=index++;if(!(i in values))values[i]=initial;return[values[i],value=>{values[i]=value}]}},
    'next/link':{__esModule:true,default:({href,children})=>React.createElement('a',{href},children)},
    'next/image':{__esModule:true,default:({src,alt})=>React.createElement('img',{src,alt})},
    'next/navigation':{useRouter:()=>({push(){},replace(){}}),useSearchParams:()=>new URLSearchParams()},
    'react-hook-form':{useForm:()=>({register:name=>({name}),formState:{errors:{},isSubmitting:false},handleSubmit:cb=>{submit=()=>cb({email:'a@example.com',password:'wrong'});return submit}})},
    '@hookform/resolvers/zod':{zodResolver:()=>null},'react-hot-toast':{__esModule:true,default:{success(){}}},
    '@/lib/utils/api-error':errors,'@/lib/store/auth':{useAuthStore:authStore},'@/lib/store/city':{useCityStore:()=>({setCity(){}})},
    '@/lib/api/auth':{login:async()=>{throw{response:{status:401,data:{error:{code:'INVALID_CREDENTIALS'}}}}},getUserProfile:async()=>({})},
    '@/components/ui/button':{Button:({children,loading,...props})=>React.createElement('button',props,children)},
    '@/components/ui/input':{Input:({label,rightIcon,error,...props})=>React.createElement('label',null,label,React.createElement('input',props),rightIcon,error)},
  })
  return{render(){index=0;return renderToStaticMarkup(React.createElement(Login))},submit:()=>submit(),get writes(){return authWrites}}
}
test('login page first visit is quiet, bad credentials remain visible inline',async()=>{
  const s=loginHarness();assert.doesNotMatch(s.render(),/Session expirée|Email ou mot de passe incorrect/)
  await s.submit();const html=s.render()
  assert.match(html,/role="alert"/);assert.match(html,/Email ou mot de passe incorrect/);assert.doesNotMatch(html,/Session expirée/);assert.equal(s.writes,0)
})
test('wrong-password feedback replaces an actual expiry notice without being hidden',async()=>{
  const s=loginHarness(true);assert.match(s.render(),/Session expirée/)
  await s.submit();const html=s.render();assert.match(html,/Email ou mot de passe incorrect/);assert.doesNotMatch(html,/Session expirée/)
})


test('late profile response cannot replace a new account or restore a logged-out user', t=>{
  const s=setup(t);s.auth.getState().setAuth({id:'A',role:'USER'},'A','A-refresh')
  s.auth.getState().setAuth({id:'B',role:'USER'},'B','B-refresh')
  s.auth.getState().updateUser({id:'A',role:'USER'});assert.equal(s.auth.getState().user.id,'B')
  s.auth.getState().expireSession();s.auth.getState().updateUser({id:'B',role:'USER'});assert.equal(s.auth.getState().user,null)
})

const locationCountry={id:'BJ',code:'BJ',translations:{fr:'Bénin',en:'Benin'}}
const profileInCity=(id,cityId)=>({id,role:'USER',profile:{city:{id:cityId,name:cityId,country:locationCountry}}})
test('login and every accepted profile refresh synchronize the header city',t=>{
  const s=setup(t)
  s.city.getState().setCity({id:'guest-city',name:'Guest'},locationCountry)
  s.auth.getState().setAuth(profileInCity('A','Cotonou'),'access','refresh')
  assert.equal(s.city.getState().selectedCity.id,'Cotonou')
  s.auth.getState().updateUser(profileInCity('A','Calavi'))
  assert.equal(s.city.getState().selectedCity.id,'Calavi')
  assert.equal(s.city.getState().selectedCountry.code,'BJ')
})
test('reloading a stored session restores its profile city over an outdated local choice',t=>{
  const s=setup(t)
  s.auth.getState().setAuth(profileInCity('A','Calavi'),'access','refresh')
  s.city.getState().setCity({id:'outdated',name:'Old city'},locationCountry)
  s.reload()
  assert.equal(s.city.getState().selectedCity.id,'Calavi')
})
test('guest choice survives logout and stale profiles cannot change the city of a new account',t=>{
  const s=setup(t)
  s.auth.getState().setAuth(profileInCity('A','Cotonou'),'access','refresh')
  s.auth.getState().setAuth(profileInCity('B','Calavi'),'B-access','B-refresh')
  s.auth.getState().updateUser(profileInCity('A','Old town'))
  assert.equal(s.city.getState().selectedCity.id,'Calavi')
  s.auth.getState().logout()
  s.city.getState().setCity({id:'guest',name:'Guest choice'},locationCountry)
  s.auth.getState().updateUser(profileInCity('B','Calavi'))
  assert.equal(s.city.getState().selectedCity.id,'guest')
})
