import {describe,it,expect} from 'vitest';
import {catalog,categories,type Spending,type Card} from '../packages/card-catalog';
import {optimize,housingMultiplier,type Input} from '../packages/rewards-engine';
const spend=(other:number):Spending=>({...Object.fromEntries(categories.map(c=>[c.id,0])),other}) as Spending;
const bilt=catalog[0];
const input=(overrides:Partial<Input>={}):Input=>({spending:spend(4000),rent:3000,cards:[bilt],objective:'value',targetCurrency:'Bilt Points',cashValue:.25,cashTiming:'recurring',availableCash:0,...overrides});
describe('Bilt and whole-wallet optimizer',()=>{
  it('reproduces the $4,000 plus $3,000 rent comparison',()=>{
    const plans=optimize(input()).alternatives;
    const housing=plans.find(p=>p.mode==='housing')!;
    const flex=plans.find(p=>p.mode==='flexible')!;
    expect(housing.points['Bilt Points']).toBe(11750);
    expect(flex.points['Bilt Points']).toBe(11000);
    expect(flex.cashEarned).toBe(160);expect(flex.cashUsed).toBe(90);expect(flex.cashLeft).toBe(70);
    expect(optimize(input()).best?.mode).toBe('flexible');
    expect(optimize(input({objective:'points'})).best?.mode).toBe('housing');
  });
  it('treats $4,000 total including rent as $1,000 everyday spend',()=>{
    expect(optimize(input({spending:spend(1000),objective:'points'})).best?.points['Bilt Points']).toBe(3500);
  });
  it.each([[749.99,0],[750,.5],[1499.99,.5],[1500,.75],[2250,1],[3000,1.25]])('handles threshold spend %s', (s,m)=>expect(housingMultiplier(s,3000)).toBe(m));
  it('does not use unposted cash for next-payment rent',()=>{
    const p=optimize(input({cashTiming:'available',availableCash:30})).alternatives.find(p=>p.mode==='flexible')!;
    expect(p.housingPoints).toBe(1000);expect(p.cashLeft).toBe(160);
  });
  it('does not count an existing Cash balance as earnings',()=>{
    const p=optimize(input({cashTiming:'available',availableCash:200,cashValue:1})).alternatives.find(p=>p.mode==='flexible')!;
    expect(p.cashUsed).toBe(0);expect(p.value).toBe(320);expect(p.cashLeft).toBe(360);
  });
  it('can split a category to meet a housing threshold',()=>{
    const dining:Card={id:'dining',name:'Dining',issuer:'Test',currency:'Test',kind:'cash',base:1,rates:{dining:5},cents:1,note:''};
    const s={...spend(1000),dining:1000};
    const p=optimize(input({spending:s,rent:1500,cards:[bilt,dining],cashValue:0})).best!;
    expect(p.mode).toBe('housing');expect(p.biltSpend).toBe(1500);
    expect(p.rows.find(r=>r.card.id==='dining')?.amount).toBe(500);
    expect(p.housingPoints).toBe(1875);
  });
  it('routes non-Bilt categories by value without inventing rent rewards',()=>{
    const p=optimize(input({cards:catalog.filter(c=>['sapphire-preferred','savor','active-cash'].includes(c.id)),spending:{...spend(1000),grocery:600,dining:800}})).best!;
    expect(p.rows.find(r=>r.category==='grocery')?.card.id).toBe('savor');
    expect(p.rows.find(r=>r.category==='dining')?.card.id).toBe('sapphire-preferred');
    expect(p.rows.find(r=>r.category==='other')?.card.id).toBe('active-cash');
    expect(p.housingPoints).toBe(0);expect(p.value).toBe(74);
  });
  it('never sums different points programs for a points objective',()=>{
    const p=optimize(input({cards:catalog,objective:'points',targetCurrency:'Ultimate Rewards',spending:{...spend(1000),dining:500}})).best!;
    expect(p.score).toBe(2500);
    expect(p.points['Ultimate Rewards']).toBe(2500);
  });
  it('uses the minimum housing floor and handles zero rent',()=>{
    expect(optimize(input({spending:spend(0)})).best?.housingPoints).toBe(250);
    expect(optimize(input({rent:0})).best?.housingPoints).toBe(0);
  });
  it('checks just below a threshold when very small rent makes the floor better',()=>{
    const p=optimize(input({rent:10,spending:spend(10),cards:[bilt,catalog.find(c=>c.id==='active-cash')!],cashValue:0})).best!;
    expect(p.mode).toBe('housing');expect(p.biltSpend).toBe(2.49);expect(p.housingPoints).toBe(250);
  });
  it('conserves allocated spending across many scenarios',()=>{
    for(let n=0;n<50;n++){
      const s={...spend(n*93.17),dining:n*17.11,grocery:n*29.31};
      for(const p of optimize(input({spending:s,cards:catalog,rent:n*73.29})).alternatives){
        for(const c of categories)expect(p.rows.filter(r=>r.category===c.id).reduce((v,r)=>v+r.amount,0)).toBeCloseTo(s[c.id],2);
        expect(p.cashLeft).toBeGreaterThanOrEqual(0);expect(p.housingPoints).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('rejects invalid inputs and supports an empty wallet',()=>{
    expect(()=>optimize(input({rent:NaN}))).toThrow();
    expect(()=>optimize(input({spending:spend(-1)}))).toThrow();
    expect(()=>optimize(input({cashValue:2}))).toThrow();
    expect(optimize(input({cards:[]})).best).toBeNull();
  });
});
