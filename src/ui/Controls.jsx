import {useId} from 'react';
import {titleCase} from './labels.js';
export function Tabs({label,value,onChange,items,panelId,className=''}) {
 const id=useId();
 return <div role="tablist" aria-label={label} className={`tabs ${className}`}>
  {items.map((item,index)=>{const {value:key,label:text,icon:Icon}=typeof item==='string'?{value:item,label:titleCase(item)}:item;return <button key={key} id={`${id}-${key}`} type="button" role="tab" aria-selected={value===key} aria-controls={panelId} tabIndex={value===key?0:-1} onClick={()=>onChange(key)} onKeyDown={event=>{
   const offset=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
   const next=event.key==='Home'?0:event.key==='End'?items.length-1:offset?(index+offset+items.length)%items.length:null;
   if(next!==null){event.preventDefault();const item=items[next];onChange(typeof item==='string'?item:item.value);event.currentTarget.parentElement.children[next].focus();}
  }}>{Icon&&<Icon size={17}/>}<span>{text}</span></button>;})}
 </div>;
}
export function Switch({label,checked,onChange}) {
 return <button type="button" role="switch" aria-label={label} aria-checked={checked} className="switch" onClick={()=>onChange(!checked)}><span/></button>;
}
export function Range({label,value,min,max,step=1,unit,onChange}) {
 const id=useId();
 return <div className="range-field"><div className="field-heading"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}{unit}</output></div><input id={id} type="range" value={value} min={min} max={max} step={step} style={{'--range-fill':`${(value-min)/(max-min)*100}%`}} onChange={e=>onChange(Number(e.target.value))}/></div>;
}
export function Field({label,children,className=''}) {return <label className={`field ${className}`}><span>{label}</span>{children}</label>;}
export function Segmented({label,value,options,onChange}) {return <div className="segmented" role="group" aria-label={label}>{options.map(option=>{const {value:key,label:text}=typeof option==='string'?{value:option,label:titleCase(option)}:option;return <button key={key} type="button" aria-pressed={value===key} onClick={()=>onChange(key)}>{text}</button>;})}</div>;}
