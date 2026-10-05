export const categories = [
  { id: 'grocery', label: 'Groceries', hint: 'Eligible grocery stores; exclude superstores and wholesale clubs.' },
  { id: 'onlineGrocery', label: 'Online groceries', hint: 'Eligible online grocery orders; exclude Target, Walmart and wholesale clubs.' },
  { id: 'dining', label: 'Restaurants', hint: 'Dining, takeout and eligible delivery.' },
  { id: 'travel', label: 'Travel', hint: 'Ordinary travel purchases, not issuer travel portal bookings.' },
  { id: 'gas', label: 'Gas', hint: 'Eligible gas purchases.' },
  { id: 'streaming', label: 'Streaming', hint: 'Eligible streaming subscriptions.' },
  { id: 'entertainment', label: 'Entertainment', hint: 'Eligible entertainment purchases.' },
  { id: 'other', label: 'Everything else', hint: 'Other eligible purchases, including superstores; no fees, interest or cash equivalents.' },
] as const;
export type Category = typeof categories[number]['id'];
export type Spending = Record<Category, number>;
export interface Card {
  id: string; name: string; issuer: string; currency: string; kind: 'points' | 'cash';
  base: number; rates: Partial<Record<Category, number>>; cents: number;
  bilt?: boolean; source?: string; verified?: string; note: string;
}
export const catalog: Card[] = [
  {id:'bilt-palladium',name:'Bilt Palladium',issuer:'Bilt',currency:'Bilt Points',kind:'points',base:2,rates:{},cents:2,bilt:true,source:'https://www.biltrewards.com/terms/bilt-card-offer-terms',verified:'2026-10-04',note:'2× everyday spending. Housing-only tiers or 4% restricted Bilt Cash. Optional accelerator supported; partner bonuses excluded.'},
  {id:'sapphire-preferred',name:'Chase Sapphire Preferred',issuer:'Chase',currency:'Ultimate Rewards',kind:'points',base:1,rates:{dining:3,onlineGrocery:3,streaming:3,travel:2},cents:1.5,source:'https://asset.chase.com/content/dam/card/rulesregulations/en/RPA0551_Web.pdf',verified:'2026-10-04',note:'3× dining, eligible online groceries and select streaming; 2× ordinary travel. Portal and anniversary bonuses excluded.'},
  {id:'savor',name:'Capital One Savor',issuer:'Capital One',currency:'Cash back',kind:'cash',base:1,rates:{grocery:3,onlineGrocery:3,dining:3,streaming:3,entertainment:3},cents:1,source:'https://www.capitalone.com/credit-cards/savor/',verified:'2026-10-04',note:'3% eligible groceries, dining, entertainment and streaming; 1% other purchases. Portal bonuses excluded.'},
  {id:'active-cash',name:'Wells Fargo Active Cash',issuer:'Wells Fargo',currency:'Cash back',kind:'cash',base:2,rates:{},cents:1,source:'https://creditcards.wellsfargo.com/active-cash-credit-card/',verified:'2026-10-04',note:'Unlimited 2% cash rewards on eligible purchases.'},
];
export const rate = (card: Card, category: Category) => card.rates[category] ?? card.base;
