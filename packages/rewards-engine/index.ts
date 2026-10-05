import { categories, rate, type Card, type Category, type Spending } from '../card-catalog';
export type Mode = 'none' | 'housing' | 'flexible';
export interface Input { spending: Spending; rent: number; cards: Card[]; objective: 'value' | 'points'; targetCurrency: string; cashValue: number; cashTiming: 'recurring' | 'available'; availableCash: number; }
export interface Allocation { category: Category; card: Card; amount: number; rate: number; rewards: number; value: number; }
export interface Plan { mode: Mode; rows: Allocation[]; housingPoints: number; housingRate: number; biltSpend: number; cashEarned: number; cashUsed: number; cashLeft: number; value: number; score: number; points: Record<string,number>; cashBack: number; }
const cents = (n: number) => Math.round(n * 100);
const dollars = (n: number) => n / 100;
export function housingMultiplier(spend: number, rent: number) {
  if (rent <= 0) return 0;
  const s = cents(spend), r = cents(rent);
  return s >= r ? 1.25 : s * 4 >= r * 3 ? 1 : s * 2 >= r ? .75 : s * 4 >= r ? .5 : 0;
}
function validate(input: Input) {
  for (const n of [...categories.map(c=>input.spending[c.id]), input.rent,input.availableCash]) {
    if (!Number.isFinite(n) || n < 0 || n > 1000000) throw new Error('Amounts must be between $0 and $1,000,000.');
  }
  if (!Number.isFinite(input.cashValue) || input.cashValue < 0 || input.cashValue > 1) throw new Error('Bilt Cash value must be between 0 and 100%.');
  if (input.cards.filter(c=>c.bilt).length > 1) throw new Error('Select one Bilt card.');
  if (new Set(input.cards.map(c=>c.id)).size !== input.cards.length) throw new Error('Duplicate card identifiers.');
  for (const card of input.cards) {
    if (!Number.isFinite(card.cents) || card.cents < 0 || card.cents > 20) throw new Error('Point values must be between 0 and 20 cents.');
    for (const n of [card.base,...Object.values(card.rates)]) if (!Number.isFinite(n) || n < 0 || n > 20) throw new Error('Earning rates must be between 0 and 20.');
  }
}
function unitScore(card: Card, category: Category, input: Input) {
  return rate(card,category) * (input.objective === 'value' ? card.cents/100 : card.kind === 'points' && card.currency === input.targetCurrency ? 1 : 0);
}
function evaluate(input: Input, rows: Allocation[], mode: Mode): Plan {
  const bilt = input.cards.find(c=>c.bilt);
  const biltSpend = rows.filter(r=>r.card.bilt).reduce((n,r)=>n+r.amount,0);
  const cashEarned = mode === 'flexible' ? Math.floor(cents(biltSpend)*.04+1e-7)/100 : 0;
  let housingPoints=0, housingRate=0, cashUsed=0;
  const budget = mode === 'flexible' ? (input.cashTiming==='recurring' ? cashEarned : input.availableCash) : 0;
  if (bilt && input.rent > 0 && mode === 'housing') {
    housingRate = housingMultiplier(biltSpend,input.rent);
    housingPoints = housingRate > 0 ? Math.floor(input.rent*housingRate) : 250;
  }
  // Restricted cash has an opportunity cost. Redeem only if it improves the chosen objective.
  if (bilt && mode==='flexible' && (input.objective==='points' ? input.targetCurrency===bilt.currency : bilt.cents/100 >= .03*input.cashValue)) {
    housingPoints = Math.min(Math.floor(input.rent), Math.floor((cents(budget)+1e-7)/3));
    cashUsed = housingPoints*.03;
    housingRate = input.rent > 0 ? housingPoints/input.rent : 0;
  }
  const cashLeft = mode==='flexible' ? Math.max(0, (input.cashTiming==='recurring' ? cashEarned : input.availableCash+cashEarned)-cashUsed) : input.availableCash;
  const points: Record<string,number> = {};
  let cashBack=0;
  for (const row of rows) {
    if (row.card.kind==='points') points[row.card.currency]=(points[row.card.currency]??0)+row.rewards;
    else cashBack+=row.value;
  }
  if (bilt) points[bilt.currency]=(points[bilt.currency]??0)+housingPoints;
  // Value measures new earnings plus rent redemption value less cash consumed; existing balances are not new earnings.
  const value=rows.reduce((n,r)=>n+r.value,0)+housingPoints*(bilt?.cents??0)/100+(cashEarned-cashUsed)*input.cashValue;
  const score=input.objective==='value' ? value : points[input.targetCurrency]??0;
  return {mode,rows,housingPoints,housingRate,biltSpend,cashEarned,cashUsed,cashLeft,value,score,points,cashBack};
}
export function optimize(input: Input): {best: Plan | null; alternatives: Plan[]} {
  validate(input);
  if (!input.cards.length) return {best:null,alternatives:[]};
  const bilt=input.cards.find(c=>c.bilt);
  const ordinary=input.cards.filter(c=>!c.bilt);
  const makeRow=(category:Category,card:Card,amount:number):Allocation=>({category,card,amount,rate:rate(card,category),rewards:amount*rate(card,category),value:amount*rate(card,category)*card.cents/100});
  if (!bilt) {
    const rows=categories.filter(c=>input.spending[c.id]>0).map(c=>{
      const card=[...ordinary].sort((a,b)=>unitScore(b,c.id,input)-unitScore(a,c.id,input)||rate(b,c.id)*b.cents-rate(a,c.id)*a.cents)[0];
      return makeRow(c.id,card,dollars(cents(input.spending[c.id])));
    });
    const plan=evaluate(input,rows,'none');
    return {best:plan,alternatives:[plan]};
  }
  const total=categories.reduce((n,c)=>n+cents(input.spending[c.id]),0);
  const alternatives:Plan[]=[];
  for (const mode of ['housing','flexible'] as const) {
    // With fixed Bilt spend, minimize lost ordinary-card rewards. Each segment is linear.
    const segments=categories.map(c=>{
      const other=[...ordinary].sort((a,b)=>unitScore(b,c.id,input)-unitScore(a,c.id,input)||rate(b,c.id)*b.cents-rate(a,c.id)*a.cents)[0];
      return {category:c.id,amount:cents(input.spending[c.id]),other,loss:other ? unitScore(other,c.id,input)-unitScore(bilt,c.id,input) : -Infinity,valueLoss:other ? rate(other,c.id)*other.cents-rate(bilt,c.id)*bilt.cents : -Infinity};
    }).sort((a,b)=>a.loss-b.loss||a.valueLoss-b.valueLoss);
    const targets=new Set<number>([0,total]);
    let cumulative=0;
    for (const s of segments) {cumulative+=s.amount;targets.add(cumulative);}
    if (mode==='housing') for (const ratio of [.25,.5,.75,1]) {
      const threshold=Math.ceil(cents(input.rent)*ratio);
      targets.add(threshold);
      targets.add(threshold-1);
    }
    if (mode==='flexible' && input.cashTiming==='recurring') targets.add(Math.ceil(Math.floor(input.rent)*3/.04));
    // Restricted Cash is earned in cents; housing points unlock in 3-cent units.
    // Check the neighboring reward steps at linear segment boundaries as well.
    if (mode==='flexible' && input.cashTiming==='recurring') for (const target of [...targets]) {
      for (const step of [25,75]) {
        targets.add(Math.floor(target/step)*step);
        targets.add(Math.ceil(target/step)*step);
      }
    }
    let best:Plan|undefined;
    for (const target of targets) {
      if (target > total || target < 0 || (!ordinary.length && target!==total)) continue;
      let remaining=target;
      const rows:Allocation[]=[];
      for (const s of segments) {
        const assigned=Math.min(s.amount,remaining);remaining-=assigned;
        if (assigned) rows.push(makeRow(s.category,bilt,dollars(assigned)));
        if (s.amount>assigned && s.other) rows.push(makeRow(s.category,s.other,dollars(s.amount-assigned)));
      }
      const plan=evaluate(input,rows,mode);
      if (!best || plan.score>best.score+1e-8 || Math.abs(plan.score-best.score)<1e-8 && plan.value>best.value+1e-8) best=plan;
    }
    if (best) alternatives.push(best);
  }
  alternatives.sort((a,b)=>b.score-a.score||b.value-a.value);
  return {best:alternatives[0]??null,alternatives};
}
