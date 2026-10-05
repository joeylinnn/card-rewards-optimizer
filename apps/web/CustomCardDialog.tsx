import { useEffect, useRef, type ReactNode } from 'react';

export default function CustomCardDialog({onClose,children}:{onClose:()=>void;children:ReactNode}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const element=dialog.current!;element.showModal();return()=>element.close();},[]);
  return <dialog ref={dialog} className="custom-dialog" aria-labelledby="custom-card-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
    <div className="section-title"><h2 id="custom-card-title">Add a custom card</h2><button type="button" className="text-button" onClick={onClose} aria-label="Close custom card popup">Close</button></div>
    {children}
  </dialog>;
}
