const {test} = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const compile = require('./helpers/compile.cjs')
const payment = compile('lib/utils/payment.ts')
const errors = compile('lib/utils/api-error.ts', {'react-hot-toast':{__esModule:true,default:{error(){}}}})
const {createCheckoutStore} = compile('lib/store/checkout.ts', {'@/lib/utils/payment':payment,'@/lib/utils/api-error':errors})
const defer = () => {let resolve, reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}}
const flush = async () => {for(let i=0;i<15;i++)await Promise.resolve()}
function setup() {
  let time=0,next=0,user='A'
  const jobs=new Map()
  const calls={create:[],initiate:[],status:[],order:0,subscription:0,paid:[],urls:[]}
  const state={sub:{id:'sub',name:'Menu',price:3111,currency:'XOF',duration:'WEEK',isActive:true,
      provider:{id:'provider',name:'Chez Awa',businessAddress:'Rue 12',acceptsDelivery:false,acceptsPickup:true},deliveryZones:['Cotonou · 500 FCFA'],pickupPoints:['Old point']},
    order:{payment:null,id:'order',subscriptionId:'sub',status:'PENDING',amount:3111,deliveryMethod:'PICKUP',subscription:{id:'sub',name:'Menu'},createdAt:'2026-11-07'},
    result:{paymentId:'pay',reference:null,status:'PROCESSING',message:'pending'},
    status:{id:'pay',orderId:'order',amount:3111,status:'PROCESSING'},
  }
  const deps={
    getAccountId:()=>user, now:()=>time,
    getSubscription:async()=>{calls.subscription++;if(state.subError)throw state.subError;return structuredClone(state.sub)},
    getOrder:async()=>{calls.order++;if(state.orderError)throw state.orderError;return structuredClone(state.order)},
    createOrder:async data=>{calls.create.push(data);if(state.createGate)return state.createGate;return structuredClone(state.order)},
    initiatePayment:async data=>{calls.initiate.push(data);if(state.initiateError)throw state.initiateError;return structuredClone(state.result)},
    getPaymentStatus:async id=>{calls.status.push(id);if(state.statusGate)return state.statusGate;if(state.statusError)throw state.statusError;return structuredClone(state.status)},
    onPaid:id=>calls.paid.push(id),onOrderCreated:id=>calls.urls.push(id),
    schedule:(fn,delay)=>{const id=++next;jobs.set(id,{at:time+delay,fn});return id},cancel:id=>jobs.delete(id),
  }
  const store=createCheckoutStore(deps)
  return{store,state,calls,login:id=>user=id,async advance(ms){
    const end=time+ms
    for(let i=0;i<200;i++){
      const task=[...jobs].filter(([,j])=>j.at<=end).sort((a,b)=>a[1].at-b[1].at)[0]
      if(!task)break
      time=task[1].at;jobs.delete(task[0]);task[1].fn();await flush()
    }
    time=end;await flush()
  }}
}
async function prepare(s){await s.store.getState().load({orderId:'order'});s.store.getState().selectProvider('MOOV');s.store.getState().setPhone('0166000000')}

test('only explicit provider flags enable delivery/pickup; stale zones do not',()=>{
  assert.deepEqual(payment.availableDeliveryModes({acceptsDelivery:false,acceptsPickup:true}),['PICKUP'])
  assert.deepEqual(payment.availableDeliveryModes({acceptsDelivery:true,acceptsPickup:false}),['DELIVERY'])
  assert.deepEqual(payment.availableDeliveryModes({}),[])
})
test('Benin phone and zone parsing follow the current backend contract',()=>{
  assert.equal(payment.normalizePaymentPhone('+229 01 66 00 00 00'),'2290166000000')
  for(const input of ['66000000','not a phone','2250166000000'])assert.equal(payment.normalizePaymentPhone(input),null)
  assert.deepEqual(payment.parseDeliveryZones(['Cotonou · 500 FCFA',{city:'Calavi',cost:0}]),[{city:'Cotonou',cost:500},{city:'Calavi',cost:0}])
})
test('pickup-only order is created once after fresh capability verification',async()=>{
  const s=setup();await s.store.getState().load({subscriptionId:'sub'})
  assert.equal(s.store.getState().deliveryMethod,'PICKUP')
  await s.store.getState().create({zone:null,address:'',startAsap:true})
  assert.equal(s.calls.subscription,2)
  assert.deepEqual(s.calls.create,[{subscriptionId:'sub',deliveryMethod:'PICKUP',pickupLocation:'Rue 12',startAsap:true}])
  assert.equal(s.store.getState().phase,'payment');assert.deepEqual(s.calls.urls,['order'])
})
test('no available mode blocks ordering and API failure never falls back',async()=>{
  const s=setup();s.state.sub.provider.acceptsPickup=false
  await s.store.getState().load({subscriptionId:'sub'})
  await s.store.getState().create({zone:null,address:'',startAsap:true});assert.equal(s.calls.create.length,0)
  s.state.subError=new Error('offline');await s.store.getState().load({subscriptionId:'sub'});assert.equal(s.store.getState().phase,'error')
})
test('capability disabled before submit blocks the old delivery choice',async()=>{
  const s=setup();s.state.sub.provider.acceptsDelivery=true
  await s.store.getState().load({subscriptionId:'sub'})
  s.state.sub.provider.acceptsDelivery=false
  await s.store.getState().create({zone:{city:'Cotonou',cost:500},address:'Maison',startAsap:true})
  assert.equal(s.calls.create.length,0);assert.equal(s.store.getState().deliveryMethod,'PICKUP')
})
test('simultaneous clicks cannot create two orders',async()=>{
  const s=setup();const gate=defer();s.state.createGate=gate.promise
  await s.store.getState().load({subscriptionId:'sub'})
  const one=s.store.getState().create({zone:null,address:'',startAsap:true});await flush()
  await s.store.getState().create({zone:null,address:'',startAsap:true})
  assert.equal(s.calls.create.length,1);gate.resolve(s.state.order);await one
})
test('operator is mandatory and phone must be valid before initiating',async()=>{
  const s=setup();await s.store.getState().load({orderId:'order'});await s.store.getState().pay()
  assert.equal(s.calls.initiate.length,0)
  s.store.getState().selectProvider('MTN');s.store.getState().setPhone('bad');await s.store.getState().pay();assert.equal(s.calls.initiate.length,0)
})
test('FeexPay sends chosen operator and normalized phone; supports nullable reference',async()=>{
  const s=setup();await prepare(s);await s.store.getState().pay()
  assert.deepEqual(s.calls.initiate,[{orderId:'order',phoneNumber:'2290166000000',provider:'MOOV'}])
  assert.equal(s.store.getState().phase,'processing');assert.equal(s.store.getState().paymentId,'pay')
})
test('immediate success and immediate failure are handled before polling',async()=>{
  for(const status of ['SUCCESS','FAILED']){
    const s=setup();s.state.result.status=status;await prepare(s);await s.store.getState().pay()
    assert.equal(s.store.getState().phase,status==='SUCCESS'?'confirmed':'failed')
    assert.equal(s.calls.status.length,0);assert.equal(s.calls.paid.length,status==='SUCCESS'?1:0)
  }
})
test('three minute timeout remains pending and never starts another debit',async()=>{
  const s=setup();await prepare(s);await s.store.getState().pay();await s.advance(180000)
  assert.equal(s.store.getState().phase,'pending');assert.equal(s.calls.initiate.length,1)
  s.store.getState().retry();await s.store.getState().pay();assert.equal(s.calls.initiate.length,1)
})
test('slow status calls never overlap; late success after timeout navigates once',async()=>{
  const s=setup();const gate=defer();s.state.statusGate=gate.promise
  await prepare(s);await s.store.getState().pay();await s.advance(180000)
  assert.equal(s.calls.status.length,1);assert.equal(s.store.getState().phase,'pending')
  gate.resolve({...s.state.status,status:'SUCCESS'});await flush();await s.advance(10000)
  assert.deepEqual(s.calls.paid,['order'])
})
test('manual verification recovers a late success',async()=>{
  const s=setup();await prepare(s);await s.store.getState().pay();await s.advance(180000)
  s.state.status.status='SUCCESS';await s.store.getState().verify();assert.deepEqual(s.calls.paid,['order'])
})
test('lost initiation response recovers payment from order, without new POST',async()=>{
  const s=setup();await prepare(s);s.state.initiateError=new Error('timeout')
  await s.store.getState().pay();s.state.order.payment={id:'pay',status:'PROCESSING'}
  await s.advance(0);assert.deepEqual(s.calls.status,['pay']);assert.equal(s.calls.initiate.length,1)
})
test('uncertain response with no recorded payment offers controlled restart',async()=>{
  const s=setup();await prepare(s);s.state.initiateError=new Error('lost')
  await s.store.getState().pay();await s.advance(180000)
  assert.equal(s.store.getState().phase,'not-started');assert.equal(s.calls.initiate.length,1)
})
test('returning to an existing processing order resumes without a new debit',async()=>{
  const s=setup();s.state.order.payment={id:'pay',status:'PROCESSING',method:'MOBILE_MONEY_CELTIIS'}
  await s.store.getState().load({orderId:'order'});await s.advance(0)
  assert.equal(s.store.getState().provider,'CELTIIS');assert.equal(s.calls.initiate.length,0);assert.deepEqual(s.calls.status,['pay'])
})
test('fresh order check catches a payment launched elsewhere before clicking pay',async()=>{
  const s=setup();await prepare(s);s.state.order.payment={id:'pay',status:'PROCESSING'}
  await s.store.getState().pay();assert.equal(s.calls.initiate.length,0);assert.equal(s.store.getState().phase,'processing')
})
test('retry preserves order and rechecks it before a new attempt',async()=>{
  const s=setup();s.state.result.status='FAILED';await prepare(s);await s.store.getState().pay()
  s.store.getState().retry();s.state.result.status='PROCESSING';s.state.order.payment={id:'pay',status:'FAILED'}
  await s.store.getState().pay();assert.equal(s.calls.initiate.length,2);assert.ok(s.calls.initiate.every(call=>call.orderId==='order'))
})
test('network verification failure never becomes a failed payment',async()=>{
  const s=setup();s.state.statusError=new Error('offline');await prepare(s);await s.store.getState().pay();await s.advance(180000)
  assert.equal(s.store.getState().phase,'pending')
})
test('pause stops automatic polling; resume checks immediately',async()=>{
  const s=setup();await prepare(s);await s.store.getState().pay();s.store.getState().pause();await s.advance(10000)
  assert.equal(s.calls.status.length,0);s.store.getState().resume();await flush();assert.equal(s.calls.status.length,1)
})
test('dispose and account changes ignore late responses',async()=>{
  for(const stop of ['dispose','account']){
    const s=setup();const gate=defer();s.state.statusGate=gate.promise
    await prepare(s);await s.store.getState().pay();await s.advance(0)
    if(stop==='dispose')s.store.getState().dispose();else s.login('B')
    gate.resolve({...s.state.status,status:'SUCCESS'});await flush();assert.equal(s.calls.paid.length,0)
  }
})
test('cancelled and already-paid orders cannot start a payment',async()=>{
  const s=setup();s.state.order.status='CANCELLED';await s.store.getState().load({orderId:'order'});assert.equal(s.store.getState().phase,'error')
  s.state.order.status='CONFIRMED';await s.store.getState().load({orderId:'order'});assert.deepEqual(s.calls.paid,['order']);assert.equal(s.calls.initiate.length,0)
})
test('payment API uses long per-request timeouts and no merchant secret',async()=>{
  const calls=[]
  const api=compile('lib/api/payments.ts',{'./client':{apiClient:{
    post:async(...args)=>{calls.push(args);return{data:{data:{paymentId:'pay',reference:null,status:'SUCCESS'}}}},
    get:async(...args)=>{calls.push(args);return{data:{data:{id:'pay',orderId:'order',status:'SUCCESS'}}}},
  }}})
  await api.initiatePayment({orderId:'order',phoneNumber:'2290166000000',provider:'MTN'});await api.getPaymentStatus('pay')
  assert.equal(calls[0][2].timeout,90000);assert.equal(calls[1][1].timeout,45000)
  assert.deepEqual(Object.keys(calls[0][1]).sort(),['orderId','phoneNumber','provider'])
})

function renderCheckout(s) {
  const auth = Object.assign(selector=>selector({user:{id:'A'},isAuthenticated:true}),{getState:()=>({user:{id:'A'},isAuthenticated:true})})
  const {CheckoutForm}=compile('app/(main)/checkout/_checkout-client.tsx',{
    zustand:{useStore:store=>store.getState()},'next/navigation':{useRouter:()=>({replace(){}}),useSearchParams:()=>new URLSearchParams('subscriptionId=sub')},
    'next/link':{__esModule:true,default:({href,children})=>React.createElement('a',{href},children)},
    'next/image':{__esModule:true,default:({src,alt})=>React.createElement('img',{src,alt})},
    '@/lib/hooks/use-auth-guard':{useAuthGuard:()=>({hydrated:true,isAuthenticated:true})},'@/lib/store/auth':{useAuthStore:auth},
    '@/lib/api/subscriptions':{},'@/lib/api/orders':{},'@/lib/api/payments':{},'@/lib/store/checkout':{createCheckoutStore:()=>s.store},
    '@/lib/utils/payment':payment,'@/lib/utils':{formatPrice:n=>`${n} FCFA`,SUBSCRIPTION_DURATION_LABELS:{WEEK:'1 semaine'}},
    '@/components/ui/subscription-instructions':{SubscriptionInstructions:()=>null},
    '@/components/ui/button':{Button:({children,loading,...props})=>React.createElement('button',props,children)},
    '@/components/ui/input':{Input:({label,...props})=>React.createElement('label',null,label,React.createElement('input',props))},
  })
  return renderToStaticMarkup(React.createElement(CheckoutForm))
}
test('rendered pickup-only checkout has no delivery selector or offline payment option',async()=>{
  const s=setup();await s.store.getState().load({subscriptionId:'sub'});const html=renderCheckout(s)
  assert.match(html,/uniquement le retrait/);assert.doesNotMatch(html,/Livraison à domicile|Espèces|CASH|PawaPay/)
  assert.match(html,/Paiement via Juna Eats/)
})
test('payment screen exposes only supported operators and no implicit choice',async()=>{
  const s=setup();await s.store.getState().load({orderId:'order'});const html=renderCheckout(s)
  assert.match(html,/Celtiis/);assert.match(html,/Moov/);assert.match(html,/MTN/);assert.doesNotMatch(html,/Orange Money|Wave|Espèces/)
  assert.match(html,/disabled/)
})
test('long wait screen shows verify, not retry or failed',async()=>{
  const s=setup();await prepare(s);await s.store.getState().pay();await s.advance(180000);const html=renderCheckout(s)
  assert.match(html,/Confirmation en attente/);assert.match(html,/Vérifier le paiement/);assert.doesNotMatch(html,/Paiement échoué|Réessayer/)
})


test('failed and refunded payments never produce a paid-order confirmation',()=>{
  for(const status of ['FAILED','REFUNDED'])assert.equal(payment.isPaidOrder({status:'CONFIRMED',payment:{status}}),false)
  assert.equal(payment.isPaidOrder({status:'PENDING',payment:{status:'SUCCESS'}}),false)
})

async function absentPayment(s){await prepare(s);s.state.initiateError=new Error('offline');await s.store.getState().pay()}
test('absence only permits restart after 90 seconds and preserves the same order and inputs',async()=>{
  const s=setup();await absentPayment(s);await s.advance(89999)
  assert.equal(s.store.getState().phase,'processing');await s.advance(1)
  assert.equal(s.store.getState().phase,'not-started')
  assert.match(renderCheckout(s),/Relancer le paiement/)
  const checks=s.calls.order;await s.store.getState().restart()
  assert.equal(s.calls.order,checks+1);assert.equal(s.store.getState().phase,'payment')
  assert.equal(s.store.getState().order.id,'order');assert.equal(s.store.getState().provider,'MOOV')
  assert.equal(s.store.getState().phone,'0166000000');assert.equal(s.calls.initiate.length,1)
})
test('missing payment field or failed reads cannot prove absence after 90 seconds',async()=>{
  for(const mode of ['missing','network']){
    const s=setup();await absentPayment(s)
    if(mode==='missing')delete s.state.order.payment;else s.state.orderError=new Error('offline')
    await s.advance(180000);assert.equal(s.store.getState().phase,'pending')
    assert.equal(s.calls.initiate.length,1)
  }
})
test('a payment arriving before restart blocks another collection',async()=>{
  const s=setup();await absentPayment(s);await s.advance(90000)
  s.state.order.payment={id:'pay',status:'PROCESSING'}
  await s.store.getState().restart();await s.advance(0)
  assert.equal(s.store.getState().phase,'processing');assert.equal(s.calls.initiate.length,1)
  await s.advance(180000);assert.equal(s.store.getState().phase,'pending')
})
test('failed restart verification returns to pending without exposing payment form',async()=>{
  const s=setup();await absentPayment(s);await s.advance(90000)
  s.state.orderError=new Error('offline');await s.store.getState().restart()
  assert.equal(s.store.getState().phase,'pending');assert.equal(s.calls.initiate.length,1)
})
