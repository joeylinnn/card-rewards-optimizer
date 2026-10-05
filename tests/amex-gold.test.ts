import { expect, it } from 'vitest';
import { catalog, categories, type Spending } from '../packages/card-catalog';
import { optimize } from '../packages/rewards-engine';

it('allocates eligible supermarket and dining spend to Gold and keeps general travel at 1x',()=>{
  const spending={...Object.fromEntries(categories.map(c=>[c.id,0])),grocery:100,onlineGrocery:50,dining:200,travel:100,other:100} as Spending;
  const cards=catalog.filter(c=>['amex-gold','active-cash'].includes(c.id));
  const plan=optimize({spending,rent:3000,cards,objective:'value',targetCurrency:'Membership Rewards',cashValue:0,cashTiming:'available',availableCash:0}).best!;
  expect(plan.points['Membership Rewards']).toBe(1400);
  expect(plan.cashBack).toBe(4);
  expect(plan.housingPoints).toBe(0);
  expect(plan.rows.find(r=>r.category==='travel')?.card.id).toBe('active-cash');
});
