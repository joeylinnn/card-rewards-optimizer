import { useState } from 'react';
import { categories, type Spending } from '../../packages/card-catalog';

const colors=['#a6d2ff','#a4dab8','#78b9bc','#94866a','#d8d08f','#eeaa70','#b8a7d7','#d9a2b2','#4c7472'];
const money=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});

export default function SpendingChart({spending,rent}:{spending:Spending;rent:number}) {
  const [active,setActive]=useState<string|null>(null);
  const rows=[{id:'rent',label:'Rent',amount:rent,color:colors[0]},...categories.map((c,i)=>({id:c.id,label:c.label,amount:spending[c.id],color:colors[i+1]}))]
    .filter(r=>Number.isFinite(r.amount)&&r.amount>0).sort((a,b)=>b.amount-a.amount);
  const total=rows.reduce((sum,r)=>sum+r.amount,0);
  const selected=rows.find(r=>r.id===active);
  let offset=0;
  return <section className="panel spending-breakdown"><div className="section-title"><h2>Top spend categories</h2><span className="small-badge">Including rent</span></div>
    {total>0?<><div className="spend-summary"><span>Total monthly spend<strong>{money(total)}</strong></span></div><div className="spend-chart-layout">
      <div className="spend-donut"><svg viewBox="0 0 240 240" role="img" aria-label="Monthly spending by category. Amounts and percentages are listed alongside the chart.">
        {rows.map(r=>{const share=r.amount/total*100;const start=offset;offset+=share;return <circle key={r.id} cx="120" cy="120" r="90" fill="none" stroke={r.color} strokeWidth={active===r.id?47:42} pathLength="100" strokeDasharray={`${share} ${100-share}`} strokeDashoffset={-start} transform="rotate(-90 120 120)" opacity={selected&&active!==r.id?.45:1} onMouseEnter={()=>setActive(r.id)} onMouseLeave={()=>setActive(null)}><title>{r.label}: {money(r.amount)} ({share.toFixed(1)}%)</title></circle>;})}
      </svg><div className="donut-center"><span>{selected?.label??'Monthly spend'}</span><strong>{money(selected?.amount??total)}</strong>{selected&&<small>{(selected.amount/total*100).toFixed(1)}%</small>}</div></div>
      <ul className="spend-legend">{rows.map(r=><li key={r.id}><button type="button" onMouseEnter={()=>setActive(r.id)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(r.id)} onBlur={()=>setActive(null)} aria-label={`${r.label}: ${money(r.amount)}, ${(r.amount/total*100).toFixed(1)} percent of monthly spend`}><span className="spend-swatch" style={{background:r.color}} aria-hidden="true"/><span>{r.label}</span><span className="spend-legend-value">{money(r.amount)}<small>({(r.amount/total*100).toFixed(1)}%)</small></span></button></li>)}</ul>
    </div></>:<p className="muted">Enter spending or rent to see your category breakdown.</p>}
  </section>;
}
