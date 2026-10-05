import {describe,it,expect} from 'vitest';
import {catalog,categories,type Spending} from '../packages/card-catalog';
import {optimize,type Input} from '../packages/rewards-engine';
const spend=(other:number):Spending=>({...Object.fromEntries(categories.map(c=>[c.id,0])),other}) as Spending;
const input=(overrides:Partial<Input>={}):Input=>({spending:spend(4000),rent:3000,cards:[catalog[0]],objective:'points',targetCurrency:'Bilt Points',cashValue:.25,cashTiming:'recurring',availableCash:0,accelerator:'active',acceleratorRemaining:5000,activationsUsed:0,...overrides});
describe('Bilt point accelerator',()=>{
  it('boosts everyday points while preserving rent and Cash earnings',()=>{
    const p=optimize(input()).best!;
    expect(p.mode).toBe('flexible');expect(p.points['Bilt Points']).toBe(15000);
    expect(p.acceleratorBonusPoints).toBe(4000);expect(p.housingPoints).toBe(3000);
    expect(p.cashEarned).toBe(160);expect(p.acceleratorCashUsed).toBe(0);expect(p.acceleratorRemaining).toBe(1000);
  });
  it('caps bonus spending and shows boosted/base slices',()=>{
    const p=optimize(input({spending:spend(6000)})).best!;
    expect(p.points['Bilt Points']).toBe(20000);expect(p.acceleratorBonusPoints).toBe(5000);
    expect(p.rows.map(r=>[r.amount,r.rate])).toEqual([[5000,3],[1000,2]]);
  });
  it('respects existing allowance and pauses in Housing-only mode',()=>{
    const result=optimize(input({acceleratorRemaining:1000}));
    expect(result.best?.acceleratorBonusPoints).toBe(1000);
    expect(result.best?.points['Bilt Points']).toBe(12000);
    const housing=result.alternatives.find(p=>p.mode==='housing')!;
    expect(housing.accelerated).toBe(false);expect(housing.acceleratorBonusPoints).toBe(0);expect(housing.points['Bilt Points']).toBe(11750);
  });
  it('deducts activation cost without double spending rent funds',()=>{
    const p=optimize(input({accelerator:'activate',cashTiming:'available',availableCash:290})).best!;
    expect(p.acceleratorCashUsed).toBe(200);expect(p.cashUsed).toBe(90);
    expect(p.points['Bilt Points']).toBe(15000);expect(p.cashLeft).toBe(160);expect(p.value).toBeCloseTo(267.5);
  });
  it('requires existing Cash and a remaining annual activation',()=>{
    expect(optimize(input({accelerator:'activate',availableCash:199.99})).alternatives.some(p=>p.accelerated)).toBe(false);
    expect(optimize(input({accelerator:'activate',availableCash:500,activationsUsed:5})).alternatives.some(p=>p.accelerated)).toBe(false);
  });
  it('can skip a new activation when its cost exceeds this-cycle value',()=>{
    const p=optimize(input({accelerator:'activate',spending:spend(100),rent:0,cashTiming:'available',availableCash:200,cashValue:1,objective:'value'})).best!;
    expect(p.accelerated).toBe(false);
  });
  it('considers a spending split at the accelerator cap',()=>{
    const p=optimize(input({cards:[catalog[0],{...catalog[3],base:5}],spending:spend(6000),rent:0,objective:'value',cashValue:0})).best!;
    expect(p.biltSpend).toBe(5000);expect(p.rows.find(r=>!r.card.bilt)?.amount).toBe(1000);
  });
  it('validates capacity and ignores disabled settings',()=>{
    expect(()=>optimize(input({acceleratorRemaining:5001}))).toThrow();
    expect(()=>optimize(input({accelerator:'activate',activationsUsed:1.5}))).toThrow();
    expect(()=>optimize(input({accelerator:'off',acceleratorRemaining:NaN}))).not.toThrow();
  });
});
