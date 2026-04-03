import { useState, useEffect, useRef } from "react";
const SK = "kbl-weekly-v1";
function uid(){return Date.now()+Math.random();}
function load(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}}
function save(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch{}}
function fmtD(s){if(!s)return"";const d=new Date(s);if(isNaN(d))return s;const M=["January","February","March","April","May","June","July","August","September","October","November","December"];const day=d.getDate();const sx=day===1||day===21||day===31?"st":day===2||day===22?"nd":day===3||day===23?"rd":"th";return day+sx+" "+M[d.getMonth()]+" "+d.getFullYear();}

const DEFAULT_TOTALS = {closed:9,resolved:4,open:0,pending:3};
const DEFAULT_WEEKS = [
  {id:uid(),label:"W13 (24th march to 28th march)",total:3,closed:1,resolved:0,open:0,pending:2},
  {id:uid(),label:"W12 (16th march to 20th march)",total:1,closed:0,resolved:1,open:0,pending:0},
  {id:uid(),label:"W11 (9th march to 13th march)",total:1,closed:0,resolved:0,open:0,pending:1},
  {id:uid(),label:"W10 (2nd march to 6th march)",total:0,closed:0,resolved:0,open:0,pending:0},
];
const DEFAULT_MONTHS = [
  {id:uid(),label:"Mar 2026",total:5,closed:1,resolved:1,open:0,pending:3},
  {id:uid(),label:"Feb 2026",total:0,closed:0,resolved:0,open:0,pending:0},
  {id:uid(),label:"Jan 2026",total:3,closed:3,resolved:0,open:0,pending:0},
  {id:uid(),label:"Dec 2025",total:1,closed:0,resolved:1,open:0,pending:0},
];
const DEFAULT_TICKETS = [
  {id:uid(),name:"Ticket 1",desc:"Indexing Issue",date:"29-Dec-2025",priority:"P4",responseTime:"Same day via call",responseStatus:"Met",resolutionTime:"2 days (18 hrs)\n29-Dec-25 \u2192 31-Dec-25",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 2",desc:"ActiveMQ Limit",date:"13-Jan-2026",priority:"P4",responseTime:"Same day via call",responseStatus:"Met",resolutionTime:"2 days (18 hrs)\n13-Jan-26 \u2192 15-Jan-26",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 3",desc:"Solr6 Search",date:"20-Jan-2026",priority:"P4",responseTime:"Same day (20-Jan)",responseStatus:"Met",resolutionTime:"3 days (27 hrs)\n20-Jan-26 \u2192 22-Jan-26",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 4",desc:"iCircular Transfer",date:"28-Jan-2026",priority:"P4",responseTime:"Same day (28-Jan)",responseStatus:"Met",resolutionTime:"2 days (18 hrs)\n28-Jan-26 \u2192 30-Jan-26",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 5",desc:"File Creation Date",date:"02-Mar-2026",priority:"P4",responseTime:"Acknowledged same day",responseStatus:"Met",resolutionTime:"On Hold (2 days (18 hrs))\n02-Mar-26 \u2192 Hold",resolutionStatus:"On Hold",overallSLA:"On Hold"},
  {id:uid(),name:"Ticket 6",desc:"Audit Extraction",date:"18-Mar-2026",priority:"P4",responseTime:"Same day (18-Mar)",responseStatus:"Met",resolutionTime:"Same day\n18-Mar-26 \u2192 18-Mar-26",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 7",desc:"UAT Postgres Data Update",date:"24-Mar-2026",priority:"P4",responseTime:"Same day (24-Mar)",responseStatus:"Met",resolutionTime:"Same day\n24-Mar-26 \u2192 24-Mar-26",resolutionStatus:"Met",overallSLA:"Met"},
  {id:uid(),name:"Ticket 8",desc:"Production Dates Updates",date:"25-Mar-2026",priority:"P4",responseTime:"Same day (25-Mar)",responseStatus:"Met",resolutionTime:"Hold\u2013 In Progress",resolutionStatus:"On Hold",overallSLA:"On Hold"},
  {id:uid(),name:"Ticket 9",desc:"Production Search Issue",date:"27-Mar-2026",priority:"P4",responseTime:"Same day (27-Mar)",responseStatus:"Met",resolutionTime:"Hold\u2013 Under Analysis",resolutionStatus:"On Hold",overallSLA:"On Hold"},
];
const DEFAULT_CERT = "Status: Not Present (On Both UAT and Prod server)\nThere are no SSL/TLS certificates installed on the server. The backend services communicate over HTTP (non-encrypted port), so certificates are not currently in use.";
const DEFAULT_PENDING_POINTS = [{id:uid(),title:"VPN Access for Support Team (AMC)",detail:"Action Required: Provide VPN credentials (Pending from KBL team)\nVPN access is required for the support team to perform AMC (Annual Maintenance Contract) activities. Please arrange VPN credentials and connectivity for the designated support personnel."}];

const TABS=[{l:"Activities",i:"\u{1F4DD}"},{l:"Total Tickets",i:"\u{1F4CA}"},{l:"Weekly Summary",i:"\u{1F4C5}"},{l:"Monthly Summary",i:"\u{1F4C6}"},{l:"Issue Summary",i:"\u{1F3AB}"},{l:"Cert & Pending",i:"\u{1F512}"},{l:"Generate",i:"\u2709\uFE0F"}];

export default function App(){
  const sv=load();
  const[tab,setTab]=useState(0);
  const[copied,setCopied]=useState(false);
  const[msg,setMsg]=useState("");
  const fRef=useRef(null);
  const[recipient,setRecipient]=useState(sv?.recipient||"Satya");
  const[weekLabel,setWeekLabel]=useState(sv?.weekLabel||"4th week of March");
  const[activities,setActivities]=useState(sv?.activities||[
    {id:uid(),text:"UAT postges data update \u2013 Updated all valid files (Title + File name) in UAT."},
    {id:uid(),text:"Production dates updates\u2013 Transfer all Python libraries to the prod server and run a dry run ( working as expected)."},
    {id:uid(),text:"Production search issue- We tested files/folder structure, but when searching with key word that time get error."},
  ]);
  const[totals,setTotals]=useState(sv?.totals||DEFAULT_TOTALS);
  const[weeks,setWeeks]=useState(sv?.weeks||DEFAULT_WEEKS);
  const[months,setMonths]=useState(sv?.months||DEFAULT_MONTHS);
  const[tickets,setTickets]=useState(sv?.tickets||DEFAULT_TICKETS);
  const[cert,setCert]=useState(sv?.cert||DEFAULT_CERT);
  const[pendPts,setPendPts]=useState(sv?.pendPts||DEFAULT_PENDING_POINTS);

  useEffect(()=>{save({recipient,weekLabel,activities,totals,weeks,months,tickets,cert,pendPts});},[recipient,weekLabel,activities,totals,weeks,months,tickets,cert,pendPts]);

  function doExport(){
    const d={recipient,weekLabel,activities,totals,weeks,months,tickets,cert,pendPts,exportedAt:new Date().toISOString()};
    const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="KBL-Weekly-"+(weekLabel.replace(/\s+/g,"-")||"data")+".json";a.click();URL.revokeObjectURL(u);
  }
  function doImport(e){
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();r.onload=(ev)=>{try{
      const d=JSON.parse(ev.target.result);
      if(d.totals)setTotals(d.totals);
      if(d.weeks)setWeeks(d.weeks);
      if(d.months)setMonths(d.months);
      if(d.tickets)setTickets(d.tickets);
      if(d.cert)setCert(d.cert);
      if(d.pendPts)setPendPts(d.pendPts);
      if(d.recipient)setRecipient(d.recipient);
      setWeekLabel("");
      setActivities([{id:uid(),text:""}]);
      setMsg("Imported! Tickets, summaries & totals carried forward. Activities & week label reset for new week.");
      setTimeout(()=>setMsg(""),8000);
    }catch{setMsg("Error: Invalid JSON.");setTimeout(()=>setMsg(""),5000);}};r.readAsText(f);e.target.value="";
  }
  function doReset(){
    if(!confirm("Reset all data?"))return;
    setRecipient("Satya");setWeekLabel("4th week of March");
    setActivities([{id:uid(),text:""}]);setTotals(DEFAULT_TOTALS);setWeeks(DEFAULT_WEEKS);setMonths(DEFAULT_MONTHS);setTickets(DEFAULT_TICKETS);setCert(DEFAULT_CERT);setPendPts(DEFAULT_PENDING_POINTS);
    localStorage.removeItem(SK);
  }

  function genHTML(){
    const bc="#0B3D2E",ac="#1A7A52",lb="#F8FAF9",bd="#DEE2E6",td="#212529",tm="#6C757D";
    const F="font-family:'Segoe UI',Calibri,Arial,sans-serif;";
    const slaBadge=(s)=>{
      if(!s)return"\u2014";
      const lc=s.toLowerCase();
      if(lc==="met")return'<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#D4EDDA;color:#155724;border:1px solid #C3E6CB;">Met</span>';
      if(lc.includes("hold"))return'<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#FFF3CD;color:#856404;border:1px solid #FFEAA7;">On Hold</span>';
      if(lc==="not met")return'<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#F8D7DA;color:#721C24;border:1px solid #F5C6CB;">Not Met</span>';
      return s;
    };
    const pBadge='<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#F8D7DA;color:#721C24;border:1px solid #F5C6CB;">P4</span>';
    const sec=(t,e)=>'<tr><td style="padding:28px 0 12px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="'+F+'font-size:15px;font-weight:700;color:'+bc+';padding-bottom:8px;border-bottom:2px solid '+ac+';">'+e+'&nbsp;&nbsp;'+t+'</td></tr></table></td></tr>';
    const ths=(c)=>'<tr><td style="padding:8px 0 0 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid '+bd+';border-radius:6px;overflow:hidden;"><tr>'+c.map(x=>'<th style="background:'+bc+';color:#fff;'+F+'font-size:11px;font-weight:600;padding:10px 12px;text-align:center;letter-spacing:0.3px;text-transform:uppercase;">'+x+'</th>').join("")+'</tr>';
    const tE='</table></td></tr>';
    const rw=(cells,idx)=>{const b2=idx%2===0?"#FFFFFF":lb;return'<tr>'+cells.map(c=>'<td style="background:'+b2+';'+F+'font-size:13px;color:'+td+';padding:10px 12px;border-bottom:1px solid '+bd+';vertical-align:top;line-height:1.5;text-align:center;">'+c+'</td>').join("")+'</tr>';};
    const rwL=(cells,idx)=>{const b2=idx%2===0?"#FFFFFF":lb;return'<tr>'+cells.map((c,ci)=>'<td style="background:'+b2+';'+F+'font-size:12px;color:'+td+';padding:10px '+(ci===0?'14px':'10px')+';border-bottom:1px solid '+bd+';vertical-align:top;line-height:1.5;text-align:'+(ci===0?'left':'center')+';">'+c+'</td>').join("")+'</tr>';};

    let h='<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:900px;margin:0 auto;">';
    // Header
    h+='<tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,'+bc+','+ac+');border-radius:8px 8px 0 0;"><tr><td style="padding:24px 28px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><p style="margin:0;'+F+'font-size:22px;font-weight:700;color:#FFF;letter-spacing:-0.3px;">KBL Weekly Status Update</p><p style="margin:4px 0 0 0;'+F+'font-size:13px;color:rgba(255,255,255,0.85);">'+weekLabel+'</p></td><td style="text-align:right;"><p style="margin:0;'+F+'font-size:13px;color:rgba(255,255,255,0.85);">Clover Infotech</p></td></tr></table></td></tr></table></td></tr>';
    // Greeting
    h+='<tr><td style="padding:20px 0 0 0;"><p style="margin:0;'+F+'font-size:14px;color:'+td+';">Hi '+recipient+',</p></td></tr>';

    // Activities
    h+=sec("Activities Completed in this Week","\u{1F4DD}");
    h+='<tr><td style="padding:8px 0 0 0;"><ol style="margin:0;padding-left:20px;'+F+'font-size:13px;color:'+td+';line-height:1.8;">';
    activities.filter(a=>a.text).forEach(a=>{h+='<li style="margin-bottom:4px;">'+a.text+'</li>';});
    h+='</ol></td></tr>';

    // Total Tickets
    h+=sec("Total Tickets from 1st December 2025","\u{1F4CA}");
    h+=ths(["","Closed","Resolved but yet not confirmed by KBL","Open","Pending/Hold"]);
    h+=rw(["<b>1. Total Incidents</b>",""+totals.closed,""+totals.resolved,""+totals.open,"0"+totals.pending],0);
    h+=tE;

    // Weekly Summary
    h+=sec("Month-wise Weekly Summary","\u{1F4C5}");
    h+=ths(["Week Details","Total Incidents","Resolved and Closed","Resolved by Clover, but to be confirmed by KBL for closure","Open","Pending/Hold"]);
    weeks.forEach((w,i)=>{h+=rwL([w.label,""+w.total,""+w.closed,""+w.resolved,""+w.open,""+w.pending],i);});
    h+=tE;

    // Monthly Summary
    h+=sec("Month-wise Summary from 1st December 2025","\u{1F4C6}");
    h+=ths(["Month Total","Total Incidents","Resolved and Closed by KBL","Resolved by Clover, but yet to be confirmed by KBL for closure","Open","Pending/Hold"]);
    months.forEach((m,i)=>{h+=rwL(["<b><u>"+m.label+"</u></b>",""+m.total,""+m.closed,""+m.resolved,""+m.open,""+m.pending],i);});
    h+=tE;

    // Issue Summary
    h+=sec("Issue Summary","\u{1F3AB}");
    h+=ths(["Ticket","Priority","Response Time (Actual)","Response Status","Resolution Time (Actual)","Resolution Status","Overall SLA"]);
    tickets.forEach((t,i)=>{
      const tCell='<b>'+t.name+'</b><br/><span style="font-size:11px;color:'+tm+';">'+t.desc+'</span><br/><span style="font-size:11px;color:'+tm+';">'+t.date+'</span>';
      h+=rwL([tCell,pBadge,t.responseTime,slaBadge(t.responseStatus),t.resolutionTime.replace(/\n/g,'<br/>'),slaBadge(t.resolutionStatus),slaBadge(t.overallSLA)],i);
    });
    h+=tE;

    // Certificate Status
    h+=sec("Certificate Status on Server","\u{1F512}");
    h+='<tr><td style="padding:8px 0 0 0;"><div style="'+F+'font-size:13px;color:'+td+';line-height:1.6;background:'+lb+';border:1px solid '+bd+';border-radius:6px;padding:14px;">'+cert.replace(/\n/g,'<br/>')+'</div></td></tr>';

    // Pending Points
    h+=sec("Pending Points","\u26A0\uFE0F");
    pendPts.filter(p=>p.title).forEach(p=>{
      h+='<tr><td style="padding:8px 0 0 0;"><div style="'+F+'font-size:13px;color:#721C24;line-height:1.6;background:#FFF3CD;border:1px solid #FFEAA7;border-left:4px solid #F0AD4E;border-radius:6px;padding:14px;"><b>'+p.title+'</b><br/>'+p.detail.replace(/\n/g,'<br/>')+'</div></td></tr>';
    });

    // Footer
    h+='<tr><td style="padding:30px 0 10px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid '+bd+';"><tr><td style="padding:18px 0 0 0;"><p style="margin:0;'+F+'font-size:13px;color:'+td+';">Best Regards,</p><p style="margin:4px 0 0 0;'+F+'font-size:15px;font-weight:700;color:'+bc+';">Ketan Thombare</p><p style="margin:2px 0 0 0;'+F+'font-size:12px;color:'+tm+';">DevOps Engineer</p><p style="margin:6px 0 0 0;'+F+'font-size:12px;color:'+tm+';">\u{1F4F1} +91 9222922251 &nbsp;|&nbsp; \u260E +91 22 2926 1650 &nbsp;|&nbsp; \u{1F310} <a href="https://www.cloverinfotech.com" style="color:'+ac+';text-decoration:none;">cloverinfotech.com</a></p></td></tr></table></td></tr></table>';
    return h;
  }

  function genText(){
    let e="Hi "+recipient+",\n\nActivities Completed in this Week:-\n";
    activities.filter(a=>a.text).forEach((a,i)=>{e+=(i+1)+". "+a.text+"\n";});
    e+="\nTotal Tickets: Closed="+totals.closed+", Resolved="+totals.resolved+", Open="+totals.open+", Pending="+totals.pending;
    e+="\n\nBest Regards,\nKetan Thombare\nDevOps Engineer\nM: +91 9222922251 | T: +91 22 2926 1650";
    return e;
  }

  async function doCopy(){
    try{await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([genHTML()],{type:"text/html"}),"text/plain":new Blob([genText()],{type:"text/plain"})})]);setCopied(true);setTimeout(()=>setCopied(false),3000);}
    catch{try{await navigator.clipboard.writeText(genText());setCopied(true);setTimeout(()=>setCopied(false),3000);}catch{alert("Copy failed.");}}
  }

  const C="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6";
  const I="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition placeholder:text-slate-400";
  const S=I+" appearance-none";
  const BP="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shadow-emerald-200";
  const BD="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition";
  const BG="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition";
  const TT="text-lg font-bold text-slate-800 tracking-tight";
  const L="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide uppercase";
  const IC="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition";

  return(
    <div className="min-h-screen bg-slate-50" style={{fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <input type="file" ref={fRef} accept=".json" onChange={doImport} className="hidden"/>

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-200/50"><span className="text-white font-bold text-lg">K</span></div>
            <div><h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight">KBL Weekly Status Generator</h1><p className="text-[11px] text-slate-400 font-medium">Auto-saved to browser</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>fRef.current?.click()} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition">{"\u{1F4E5}"} Import</button>
            <button onClick={doExport} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition">{"\u{1F4E4}"} Export</button>
            <button onClick={doReset} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition">Reset</button>
          </div>
        </div>
        {msg&&<div className="max-w-6xl mx-auto px-5 pb-2"><div className={`px-4 py-2.5 rounded-xl text-xs font-medium ${msg.startsWith("Error")?"bg-red-50 text-red-700 border border-red-200":"bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{msg}</div></div>}
        <div className="max-w-6xl mx-auto px-5 flex gap-0.5 overflow-x-auto pb-0">
          {TABS.map((t,i)=>(<button key={t.l} onClick={()=>setTab(i)} className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${tab===i?"border-emerald-600 text-emerald-700 bg-emerald-50/50":"border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}><span className="mr-1.5">{t.i}</span>{t.l}</button>))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">

        {/* TAB 0: Activities */}
        {tab===0&&(<div className="space-y-5">
          <div className={C}>
            <h2 className={TT}>Weekly Status Info</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">Set the week label and recipient name.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={L}>Recipient Name</label><input value={recipient} onChange={e=>setRecipient(e.target.value)} className={I} placeholder="e.g. Satya"/></div>
              <div><label className={L}>Week Label (for subject)</label><input value={weekLabel} onChange={e=>setWeekLabel(e.target.value)} className={I} placeholder="e.g. 4th week of March"/></div>
            </div>
          </div>
          <div className={C}>
            <h2 className={TT}>Activities Completed in this Week</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">Add activities completed this week. These reset on import.</p>
            <div className="space-y-3">
              {activities.map((a,i)=>(<div key={a.id} className={IC}>
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">#{i+1}</span>{activities.length>1&&<button onClick={()=>setActivities(activities.filter((_,j)=>j!==i))} className={BD}>Remove</button>}</div>
                <textarea rows={2} placeholder="Activity description..." value={a.text} onChange={e=>{const n=[...activities];n[i]={...n[i],text:e.target.value};setActivities(n);}} className={I}/>
              </div>))}
            </div>
            <button onClick={()=>setActivities([...activities,{id:uid(),text:""}])} className={BP+" mt-4"}>+ Add Activity</button>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"><h3 className="text-sm font-bold text-emerald-800 mb-2">{"\u{1F4D6}"} Weekly Workflow</h3><div className="text-xs text-emerald-700 space-y-1.5 leading-relaxed"><p><strong>First time?</strong> Click <strong>{"\u{1F4E5}"} Import</strong> to load previous week's data. Tickets, summaries & totals carry forward. Activities reset.</p><p><strong>Every week:</strong> {"\u2460"} Set week label {"\u2192"} {"\u2461"} Add activities {"\u2192"} {"\u2462"} Update totals {"\u2192"} {"\u2463"} Add new week row {"\u2192"} {"\u2464"} Update monthly {"\u2192"} {"\u2465"} Add/update tickets {"\u2192"} {"\u2466"} Generate & copy</p><p><strong>After sending:</strong> Click <strong>{"\u{1F4E4}"} Export</strong> to save. Import next week.</p></div></div>
        </div>)}

        {/* TAB 1: Total Tickets */}
        {tab===1&&(<div className={C}>
          <h2 className={TT}>Total Tickets from 1st December 2025</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">Update cumulative ticket counts.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center"><label className={L}>Closed</label><input type="number" value={totals.closed} onChange={e=>setTotals({...totals,closed:+e.target.value})} className={I+" text-center text-lg font-bold"}/></div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center"><label className={L}>Resolved (Not Confirmed)</label><input type="number" value={totals.resolved} onChange={e=>setTotals({...totals,resolved:+e.target.value})} className={I+" text-center text-lg font-bold"}/></div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center"><label className={L}>Open</label><input type="number" value={totals.open} onChange={e=>setTotals({...totals,open:+e.target.value})} className={I+" text-center text-lg font-bold"}/></div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center"><label className={L}>Pending/Hold</label><input type="number" value={totals.pending} onChange={e=>setTotals({...totals,pending:+e.target.value})} className={I+" text-center text-lg font-bold"}/></div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center"><span className="text-sm font-bold text-slate-700">Total Incidents: {totals.closed+totals.resolved+totals.open+totals.pending}</span></div>
        </div>)}

        {/* TAB 2: Weekly Summary */}
        {tab===2&&(<div className={C}>
          <h2 className={TT}>Month-wise Weekly Summary</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">Add a new week row at the top each week. Update counts.</p>
          <div className="space-y-3">
            {weeks.map((w,i)=>(<div key={w.id} className={IC}>
              <div className="flex items-center justify-between"><input placeholder="Week label, e.g. W14 (31st march to 4th april)" value={w.label} onChange={e=>{const n=[...weeks];n[i]={...n[i],label:e.target.value};setWeeks(n);}} className={I+" flex-1 mr-2 font-semibold"}/><button onClick={()=>setWeeks(weeks.filter((_,j)=>j!==i))} className={BD}>Remove</button></div>
              <div className="grid grid-cols-5 gap-2">
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Total</label><input type="number" value={w.total} onChange={e=>{const n=[...weeks];n[i]={...n[i],total:+e.target.value};setWeeks(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Closed</label><input type="number" value={w.closed} onChange={e=>{const n=[...weeks];n[i]={...n[i],closed:+e.target.value};setWeeks(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Resolved</label><input type="number" value={w.resolved} onChange={e=>{const n=[...weeks];n[i]={...n[i],resolved:+e.target.value};setWeeks(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Open</label><input type="number" value={w.open} onChange={e=>{const n=[...weeks];n[i]={...n[i],open:+e.target.value};setWeeks(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Pending</label><input type="number" value={w.pending} onChange={e=>{const n=[...weeks];n[i]={...n[i],pending:+e.target.value};setWeeks(n);}} className={I+" text-center"}/></div>
              </div>
            </div>))}
          </div>
          <button onClick={()=>setWeeks([{id:uid(),label:"",total:0,closed:0,resolved:0,open:0,pending:0},...weeks])} className={BP+" mt-4"}>+ Add New Week (at top)</button>
        </div>)}

        {/* TAB 3: Monthly Summary */}
        {tab===3&&(<div className={C}>
          <h2 className={TT}>Month-wise Summary from 1st December 2025</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">Update monthly totals. Add new month at top when needed.</p>
          <div className="space-y-3">
            {months.map((m,i)=>(<div key={m.id} className={IC}>
              <div className="flex items-center justify-between"><input placeholder="Month label, e.g. Apr 2026" value={m.label} onChange={e=>{const n=[...months];n[i]={...n[i],label:e.target.value};setMonths(n);}} className={I+" flex-1 mr-2 font-semibold"}/><button onClick={()=>setMonths(months.filter((_,j)=>j!==i))} className={BD}>Remove</button></div>
              <div className="grid grid-cols-5 gap-2">
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Total</label><input type="number" value={m.total} onChange={e=>{const n=[...months];n[i]={...n[i],total:+e.target.value};setMonths(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Closed</label><input type="number" value={m.closed} onChange={e=>{const n=[...months];n[i]={...n[i],closed:+e.target.value};setMonths(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Resolved</label><input type="number" value={m.resolved} onChange={e=>{const n=[...months];n[i]={...n[i],resolved:+e.target.value};setMonths(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Open</label><input type="number" value={m.open} onChange={e=>{const n=[...months];n[i]={...n[i],open:+e.target.value};setMonths(n);}} className={I+" text-center"}/></div>
                <div><label className="text-[10px] font-semibold text-slate-500 text-center block">Pending</label><input type="number" value={m.pending} onChange={e=>{const n=[...months];n[i]={...n[i],pending:+e.target.value};setMonths(n);}} className={I+" text-center"}/></div>
              </div>
            </div>))}
          </div>
          <button onClick={()=>setMonths([{id:uid(),label:"",total:0,closed:0,resolved:0,open:0,pending:0},...months])} className={BP+" mt-4"}>+ Add New Month (at top)</button>
        </div>)}

        {/* TAB 4: Issue Summary */}
        {tab===4&&(<div className={C}>
          <h2 className={TT}>Issue Summary</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">Add new tickets or update existing ones. SLA statuses: Met, On Hold, Not Met.</p>
          <div className="space-y-4">
            {tickets.map((t,i)=>(<div key={t.id} className={`p-5 rounded-xl border-2 space-y-3 ${t.overallSLA==="Met"?"border-emerald-200 bg-emerald-50/20":t.overallSLA.includes("Hold")?"border-amber-200 bg-amber-50/20":"border-slate-200 bg-slate-50/20"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${t.overallSLA==="Met"?"bg-emerald-200 text-emerald-800":"bg-amber-200 text-amber-800"}`}>{t.overallSLA}</span>
                  <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                </div>
                <button onClick={()=>setTickets(tickets.filter((_,j)=>j!==i))} className={BD}>Remove</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input placeholder="Ticket Name (e.g. Ticket 10)" value={t.name} onChange={e=>{const n=[...tickets];n[i]={...n[i],name:e.target.value};setTickets(n);}} className={I+" font-semibold"}/>
                <input placeholder="Description" value={t.desc} onChange={e=>{const n=[...tickets];n[i]={...n[i],desc:e.target.value};setTickets(n);}} className={I}/>
                <input placeholder="Date (e.g. 27-Mar-2026)" value={t.date} onChange={e=>{const n=[...tickets];n[i]={...n[i],date:e.target.value};setTickets(n);}} className={I}/>
                <select value={t.priority} onChange={e=>{const n=[...tickets];n[i]={...n[i],priority:e.target.value};setTickets(n);}} className={S}><option>P1</option><option>P2</option><option>P3</option><option>P4</option></select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <input placeholder="Response Time" value={t.responseTime} onChange={e=>{const n=[...tickets];n[i]={...n[i],responseTime:e.target.value};setTickets(n);}} className={I}/>
                <select value={t.responseStatus} onChange={e=>{const n=[...tickets];n[i]={...n[i],responseStatus:e.target.value};setTickets(n);}} className={S}><option>Met</option><option>On Hold</option><option>Not Met</option></select>
                <input placeholder="Resolution Time" value={t.resolutionTime} onChange={e=>{const n=[...tickets];n[i]={...n[i],resolutionTime:e.target.value};setTickets(n);}} className={I}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={t.resolutionStatus} onChange={e=>{const n=[...tickets];n[i]={...n[i],resolutionStatus:e.target.value};setTickets(n);}} className={S}><option>Met</option><option>On Hold</option><option>Not Met</option></select>
                <select value={t.overallSLA} onChange={e=>{const n=[...tickets];n[i]={...n[i],overallSLA:e.target.value};setTickets(n);}} className={S}><option>Met</option><option>On Hold</option><option>Not Met</option></select>
              </div>
            </div>))}
          </div>
          <button onClick={()=>setTickets([...tickets,{id:uid(),name:"Ticket "+(tickets.length+1),desc:"",date:"",priority:"P4",responseTime:"",responseStatus:"Met",resolutionTime:"",resolutionStatus:"Met",overallSLA:"Met"}])} className={BP+" mt-4"}>+ Add Ticket</button>
        </div>)}

        {/* TAB 5: Cert & Pending */}
        {tab===5&&(<div className="space-y-5">
          <div className={C}>
            <h2 className={TT}>Certificate Status on Server</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Update certificate status text.</p>
            <textarea rows={4} value={cert} onChange={e=>setCert(e.target.value)} className={I}/>
          </div>
          <div className={C}>
            <h2 className={TT}>Pending Points</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Action items pending from client side.</p>
            <div className="space-y-3">
              {pendPts.map((p,i)=>(<div key={p.id} className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50/30 space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-1 rounded-lg">Pending #{i+1}</span>{pendPts.length>1&&<button onClick={()=>setPendPts(pendPts.filter((_,j)=>j!==i))} className={BD}>Remove</button>}</div>
                <input placeholder="Title (e.g. VPN Access for Support Team)" value={p.title} onChange={e=>{const n=[...pendPts];n[i]={...n[i],title:e.target.value};setPendPts(n);}} className={I+" font-semibold"}/>
                <textarea rows={3} placeholder="Details..." value={p.detail} onChange={e=>{const n=[...pendPts];n[i]={...n[i],detail:e.target.value};setPendPts(n);}} className={I}/>
              </div>))}
            </div>
            <button onClick={()=>setPendPts([...pendPts,{id:uid(),title:"",detail:""}])} className={BP+" mt-4"}>+ Add Pending Point</button>
          </div>
        </div>)}

        {/* TAB 6: Generate */}
        {tab===6&&(<div className="space-y-5"><div className={C}><div className="flex items-center justify-between mb-5"><div><h2 className={TT}>Email Preview</h2><p className="text-sm text-slate-500 mt-1">Subject: Weekly status updates-{weekLabel}</p></div><div className="flex gap-3"><button onClick={doExport} className="px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">{"\u{1F4E4}"} Export for Next Week</button><button onClick={doCopy} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.97] ${copied?"bg-emerald-500 text-white shadow-emerald-200":"bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-200 hover:shadow-lg"}`}>{copied?"\u2705 Copied! Paste in Outlook \u2192":"\u{1F4CB} Copy Rich Text for Outlook"}</button></div></div><div className="border border-slate-200 rounded-xl bg-white overflow-auto max-h-[700px] shadow-inner"><div className="p-6" dangerouslySetInnerHTML={{__html:genHTML()}}/></div></div></div>)}

      </main>
    </div>
  );
}
