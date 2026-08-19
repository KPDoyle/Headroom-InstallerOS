"use client";

import {
  ArrowRight, BadgeCheck, Bell, BookOpenCheck, Building2, CalendarDays,
  Camera, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, CircleUserRound, ClipboardCheck, ContactRound, Copy, Download,
  ExternalLink, FileCheck2, FileText, Filter, Gauge, GraduationCap, LayoutDashboard,
  Link2, Mail, Map, MapPin, MapPinned, Menu, MessageSquare, PackageCheck, Plus,
  RefreshCw, Search, Send, Settings, ShieldCheck, SlidersHorizontal, Sparkles,
  TrendingUp, UploadCloud, UserCheck, Users, Wrench, X,
} from "lucide-react";
import { useState } from "react";

type View = "overview" | "sites" | "siteproof" | "compliance" | "mid" | "passport" | "products" | "territory";

const navItems: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Command centre", icon: LayoutDashboard },
  { id: "sites", label: "Sites & projects", icon: MapPinned },
  { id: "siteproof", label: "SiteProof", icon: Camera },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "mid", label: "MID preflight", icon: FileCheck2 },
  { id: "passport", label: "Customer passport", icon: ContactRound },
  { id: "products", label: "Product Guard", icon: BadgeCheck },
  { id: "territory", label: "Territory intelligence", icon: Map },
];

const modules = [
  { id: "siteproof" as View, eyebrow: "SITEPROOF", title: "Installation evidence", value: "23 / 27", detail: "4 items needed before TS review", status: "Action", tone: "gold", icon: Camera },
  { id: "compliance" as View, eyebrow: "COMPLIANCE HUB", title: "Audit readiness", value: "92%", detail: "Scenario C · 1 qualification due", status: "Healthy", tone: "green", icon: ShieldCheck },
  { id: "mid" as View, eyebrow: "MID PREFLIGHT", title: "Certificate data", value: "18 / 21", detail: "Three fields require confirmation", status: "Review", tone: "blue", icon: FileCheck2 },
  { id: "passport" as View, eyebrow: "CUSTOMER PASSPORT", title: "Handover pack", value: "8 / 10", detail: "Waiting on MCS and DNO certificates", status: "Building", tone: "blue", icon: ContactRound },
  { id: "products" as View, eyebrow: "PRODUCT GUARD", title: "Certified equipment", value: "6 / 6", detail: "All selected products verified today", status: "Clear", tone: "green", icon: PackageCheck },
  { id: "territory" as View, eyebrow: "TERRITORY INTELLIGENCE", title: "Next-best postcode", value: "SO21", detail: "High demand · low installer density", status: "+18%", tone: "gold", icon: Map },
];

function Brand() {
  return (
    <div className="brand" aria-label="Headroom Installer OS">
      <span className="brand-mark" aria-hidden="true"><i /><i /><b /></span>
      <span className="brand-name">Headroom.</span>
      <span className="brand-product">Installer OS</span>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="progress-ring" style={{ "--progress": `${value * 3.6}deg` } as React.CSSProperties} aria-label={`${value}% complete`}>
      <div>{value}%</div>
    </div>
  );
}

function Overview({ onOpen }: { onOpen: (id: View) => void }) {
  const stages = [
    ["Site screened", "complete"], ["System designed", "complete"],
    ["Install proof", "current"], ["TS review", "next"],
    ["MID certificate", "next"], ["Passport shared", "next"],
  ];

  return (
    <div className="view-stack">
      <section className="project-hero">
        <div className="hero-copy">
          <div className="eyebrow">ACTIVE INSTALLATION · SES-0248</div>
          <div className="hero-title-row">
            <div><h1>42 Alder Close</h1><p>Winchester, SO21 1BT · 6.4 kWp solar + 10 kWh battery</p></div>
            <span className="status-pill gold">INSTALLING</span>
          </div>
          <div className="project-facts">
            <div><span>Commissioning</span><strong>22 Aug 2026</strong></div>
            <div><span>Technical supervisor</span><strong>A. Mercer</strong></div>
            <div><span>MCS route</span><strong>Solar PV + EESS</strong></div>
            <div><span>Grid route</span><strong>G99 · approved</strong></div>
          </div>
        </div>
        <div className="hero-score"><ProgressRing value={78} /><div><strong>Job readiness</strong><span>7 actions remaining</span></div></div>
      </section>

      <section className="journey-card">
        <div className="section-heading compact">
          <div><span className="eyebrow">ONE SITE, ONE JOURNEY</span><h2>From first check to lasting proof</h2></div>
          <button className="text-button" onClick={() => onOpen("sites")}>Open project <ArrowRight size={15} /></button>
        </div>
        <div className="journey-track">
          {stages.map(([label, state], index) => (
            <div className={`journey-step ${state}`} key={label}>
              <div className="step-dot">{state === "complete" ? <Check size={14} /> : index + 1}</div><span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div><span className="eyebrow">CONNECTED WORKSPACE</span><h2>Everything this installation needs</h2></div>
          <span className="updated-label">Updated 4 mins ago</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button className="module-card" key={module.id} onClick={() => onOpen(module.id)}>
                <div className="module-card-top"><span className={`icon-tile ${module.tone}`}><Icon size={19} /></span><span className={`mini-status ${module.tone}`}>{module.status}</span></div>
                <span className="eyebrow">{module.eyebrow}</span><div className="module-value">{module.value}</div>
                <h3>{module.title}</h3><p>{module.detail}</p><span className="card-link">Open module <ChevronRight size={15} /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="lower-grid">
        <article className="action-card">
          <div className="section-heading compact"><div><span className="eyebrow">NEXT BEST ACTIONS</span><h2>Keep the job moving</h2></div><span className="count-badge">4</span></div>
          <div className="action-list">
            <button onClick={() => onOpen("siteproof")}><span className="action-icon urgent"><Camera size={17} /></span><span><strong>Add roof weatherproofing evidence</strong><small>Required before Technical Supervisor review</small></span><ChevronRight size={17} /></button>
            <button onClick={() => onOpen("products")}><span className="action-icon"><PackageCheck size={17} /></span><span><strong>Confirm installed inverter serial</strong><small>Quoted and installed model already match</small></span><ChevronRight size={17} /></button>
            <button onClick={() => onOpen("mid")}><span className="action-icon"><FileCheck2 size={17} /></span><span><strong>Complete MID preflight</strong><small>Installer cost and IBG reference outstanding</small></span><ChevronRight size={17} /></button>
          </div>
        </article>
        <article className="signal-card">
          <div className="signal-top"><span className="eyebrow">HEADROOM SIGNAL</span><Sparkles size={18} /></div>
          <h2>One missing photo is holding up three downstream steps.</h2>
          <p>Capturing roof weatherproofing evidence now will unlock TS review, MID readiness and the final customer passport.</p>
          <button onClick={() => onOpen("siteproof")}>Capture evidence <ArrowRight size={15} /></button>
        </article>
      </section>
    </div>
  );
}

function ModuleHeader({ eyebrow, title, description, icon: Icon, action, onAction }: {
  eyebrow: string; title: string; description: string; icon: typeof Camera; action: string; onAction?: () => void;
}) {
  return (
    <header className="module-header">
      <div className="module-heading-copy">
        <span className="icon-tile gold"><Icon size={20} /></span>
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      </div>
      <button className="module-action" onClick={onAction}><Plus size={16} /> {action}</button>
    </header>
  );
}

function MetricStrip({ items }: { items: Array<{ label: string; value: string; note: string; tone?: string }> }) {
  return <section className="metric-strip">{items.map((item) => <div key={item.label}><span>{item.label}</span><strong className={item.tone ?? ""}>{item.value}</strong><small>{item.note}</small></div>)}</section>;
}

function SitesView({ onOpen }: { onOpen: (id: View) => void }) {
  const projects = [
    { ref: "SES-0248", site: "42 Alder Close", place: "Winchester · SO21 1BT", system: "6.4 kWp PV + 10 kWh EESS", stage: "Installing", progress: 78, date: "22 Aug", tone: "gold" },
    { ref: "SES-0246", site: "Rosebank Farm", place: "Romsey · SO51 6AA", system: "48 kWp PV + 80 kWh EESS", stage: "TS review", progress: 92, date: "20 Aug", tone: "blue" },
    { ref: "SES-0241", site: "8 Marine Parade", place: "Lee-on-Solent · PO13 9LB", system: "8.1 kWp PV", stage: "MID ready", progress: 97, date: "19 Aug", tone: "green" },
    { ref: "SES-0237", site: "The Old Mill", place: "Salisbury · SP2 7RA", system: "ASHP + 13 kWh EESS", stage: "Commissioned", progress: 100, date: "15 Aug", tone: "green" },
  ];
  return <div className="module-page">
    <ModuleHeader eyebrow="SITES & PROJECTS" title="Every installation, one connected record" description="Move each job from survey to certificate without re-entering the same information." icon={MapPinned} action="New installation" onAction={() => onOpen("siteproof")} />
    <MetricStrip items={[
      { label: "ACTIVE PROJECTS", value: "14", note: "Across three regions" },
      { label: "INSTALLING NOW", value: "5", note: "Two due this week", tone: "gold-text" },
      { label: "AWAITING TS", value: "3", note: "Oldest: 18 hours" },
      { label: "READY TO CERTIFY", value: "4", note: "No blocking actions", tone: "green-text" },
    ]} />
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">LIVE PORTFOLIO</span><h2>Installation pipeline</h2></div><div className="toolbar-actions"><label><Search size={15} /><input placeholder="Find a site or reference" /></label><button><Filter size={15} /> Filter</button></div></div>
      <div className="project-table" role="table" aria-label="Installation pipeline">
        <div className="project-row table-head" role="row"><span>Project</span><span>System</span><span>Stage</span><span>Readiness</span><span>Commission</span><span /></div>
        {projects.map((project) => <button className="project-row" role="row" key={project.ref} onClick={() => onOpen(project.ref === "SES-0248" ? "siteproof" : "sites")}>
          <span className="project-name"><strong>{project.site}</strong><small>{project.ref} · {project.place}</small></span>
          <span>{project.system}</span><span><i className={`dot ${project.tone}`} />{project.stage}</span>
          <span className="readiness"><strong>{project.progress}%</strong><i><b style={{ width: `${project.progress}%` }} /></i></span>
          <span>{project.date}</span><span><ChevronRight size={16} /></span>
        </button>)}
      </div>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><CalendarDays size={18} /></span><div><span className="eyebrow">CREW CAPACITY</span><h2>Next seven days</h2></div></div><div className="capacity-bars">{[["Mon",82],["Tue",100],["Wed",74],["Thu",91],["Fri",58]].map(([day, value]) => <div key={day as string}><span>{day}</span><i><b style={{ height: `${value}%` }} /></i><small>{value}%</small></div>)}</div></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile green"><CheckCircle2 size={18} /></span><div><span className="eyebrow">FLOW HEALTH</span><h2>What is slowing delivery</h2></div></div><div className="issue-list"><span><i className="dot gold" /> Evidence incomplete <strong>4</strong></span><span><i className="dot blue" /> TS review queue <strong>3</strong></span><span><i className="dot green" /> Ready for MID <strong>4</strong></span></div></article>
    </section>
  </div>;
}

function SiteProofView() {
  const items = ["Array and roof overview", "Mounting system and fixings", "Cable routes and protection", "Inverter clearances", "Battery location and labels", "Roof weatherproofing", "Meter and isolator labels", "Commissioning readings"];
  const [checked, setChecked] = useState(new Set([0,1,2,3,4]));
  const [sent, setSent] = useState(false);
  const toggle = (index: number) => setChecked((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  const score = Math.round((checked.size / items.length) * 100);
  return <div className="module-page">
    <ModuleHeader eyebrow="SITEPROOF" title="Capture it right the first time" description="Guided, time-stamped evidence that gives your Technical Supervisor a complete installation to review." icon={Camera} action="Capture evidence" onAction={() => { const missing = items.findIndex((_, index) => !checked.has(index)); if (missing >= 0) toggle(missing); }} />
    <div className="project-context"><div><span className="eyebrow">ACTIVE JOB</span><strong>42 Alder Close, Winchester</strong><small>SES-0248 · Solar PV + EESS</small></div><div><span>Installer</span><strong>J. Patel</strong></div><div><span>Technical Supervisor</span><strong>A. Mercer</strong></div><div className="context-score"><strong>{checked.size}/{items.length}</strong><span>evidence gates</span></div></div>
    {sent && <div className="success-banner"><CheckCircle2 size={17} /><span><strong>Review requested.</strong> A. Mercer has been notified with the locked evidence set.</span><button onClick={() => setSent(false)}><X size={15} /></button></div>}
    <section className="proof-layout">
      <article className="workspace-card">
        <div className="table-toolbar"><div><span className="eyebrow">REQUIRED EVIDENCE</span><h2>Solar PV + battery checklist</h2></div><span className="percentage-label">{score}% complete</span></div>
        <div className="big-progress"><span style={{ width: `${score}%` }} /></div>
        <div className="proof-checklist">{items.map((item,index) => <button key={item} className={checked.has(index) ? "done" : ""} onClick={() => toggle(index)}><span>{checked.has(index) ? <Check size={15} /> : index + 1}</span><div><strong>{item}</strong><small>{checked.has(index) ? `Captured · ${index < 3 ? "08:4"+(index+2) : "09:1"+index}` : "Evidence required before review"}</small></div>{checked.has(index) ? <BadgeCheck size={18} /> : <UploadCloud size={18} />}</button>)}</div>
      </article>
      <aside className="proof-side">
        <article className="dark-card ts-gate"><span className="eyebrow">TECHNICAL SUPERVISOR GATE</span><div className="gate-score"><ProgressRing value={score} /><div><strong>{score === 100 ? "Ready to review" : "Evidence incomplete"}</strong><small>{items.length-checked.size} required items remain</small></div></div><ul><li className="complete"><Check size={13} /> Product set verified</li><li className="complete"><Check size={13} /> Installer competency current</li><li className={score === 100 ? "complete" : ""}><Check size={13} /> Required site evidence</li><li><Check size={13} /> TS declaration</li></ul><button disabled={score !== 100 || sent} onClick={() => setSent(true)}><Send size={15} /> {sent ? "Review requested" : "Send to A. Mercer"}</button></article>
        <article className="workspace-card evidence-gallery"><div className="card-title"><div><span className="eyebrow">LATEST CAPTURES</span><h2>Evidence feed</h2></div><button><ExternalLink size={14} /></button></div><div className="evidence-thumbs"><span className="thumb roof"><i>08:42</i><b>Array overview</b></span><span className="thumb inverter"><i>09:07</i><b>Inverter label</b></span><span className="thumb battery"><i>09:13</i><b>Battery clearance</b></span><button><Plus size={18} /><small>Add capture</small></button></div></article>
      </aside>
    </section>
  </div>;
}

function ComplianceView() {
  const [resolved, setResolved] = useState(false);
  return <div className="module-page">
    <ModuleHeader eyebrow="COMPLIANCE HUB" title="Know your position before the assessor does" description="Your operating scenario, people, processes and corrective actions in one current view." icon={ShieldCheck} action="Run readiness check" onAction={() => setResolved(true)} />
    <MetricStrip items={[
      { label: "AUDIT READINESS", value: resolved ? "96%" : "92%", note: "Scenario C", tone: "green-text" },
      { label: "TECHNICAL SUPERVISORS", value: "3", note: "Across two technologies" },
      { label: "QUALIFICATIONS DUE", value: "1", note: "Within 60 days", tone: "gold-text" },
      { label: "OPEN CORRECTIVE ACTIONS", value: resolved ? "0" : "1", note: resolved ? "All resolved" : "Minor · 12 days old" },
    ]} />
    <section className="compliance-grid">
      <article className="workspace-card roles-card"><div className="table-toolbar"><div><span className="eyebrow">ACCOUNTABLE ROLES</span><h2>Scheme ownership</h2></div><button className="quiet-button">Manage roles</button></div><div className="role-grid">{[
        ["Licensee","Kevin Doyle","Overall Scheme responsibility","KD"],
        ["Main Contact","Sophie Ward","MCS and certification liaison","SW"],
        ["Technical Supervisor","Alex Mercer","Solar PV · EESS","AM"],
      ].map(([role,name,detail,initials]) => <div key={role}><span className="role-avatar">{initials}</span><span><small>{role}</small><strong>{name}</strong><em>{detail}</em></span><BadgeCheck size={17} /></div>)}</div></article>
      <article className="dark-card risk-card"><div className="signal-top"><span className="eyebrow">RISK SIGNAL</span><Gauge size={18} /></div><strong>Reduced assessment is within reach.</strong><p>Close the remaining competency action and maintain two consecutive pass outcomes to strengthen your risk position.</p><div className="risk-meter"><span /><i>Current</i><b>Reduced</b></div></article>
    </section>
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">PEOPLE & COMPETENCY</span><h2>Technical Supervisor register</h2></div><button className="quiet-button"><GraduationCap size={15} /> Add qualification</button></div>
      <div className="data-table qualification-table"><div className="data-row data-head"><span>Person</span><span>Scope</span><span>Qualification</span><span>Expires</span><span>Status</span></div>{[
        ["Alex Mercer","Solar PV · EESS","L3 Solar PV + current BS 7671","14 Mar 2028","Current","green"],
        ["Leah Khan","Solar PV","L3 Solar PV","28 Sep 2026","Due soon","gold"],
        ["Marcus Dean","Heat pumps","L3 Heat Pump Systems","09 May 2029","Current","green"],
      ].map((row) => <div className="data-row" key={row[0]}><span><span className="mini-avatar">{row[0].split(" ").map(n=>n[0]).join("")}</span><strong>{row[0]}</strong></span><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span className={`data-status ${row[5]}`}>{row[4]}</span></div>)}</div>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile gold"><RefreshCw size={18} /></span><div><span className="eyebrow">CORRECTIVE ACTION</span><h2>{resolved ? "Action resolved" : "Commissioning form version control"}</h2></div></div><p className="card-copy">{resolved ? "The revised checklist is active and team acknowledgement has been recorded." : "Two crews used an earlier checklist revision. Replace it and capture acknowledgement."}</p><button className={`wide-action ${resolved ? "complete" : ""}`} onClick={() => setResolved(true)}>{resolved ? <CheckCircle2 size={15} /> : <Wrench size={15} />}{resolved ? "Resolved today" : "Apply revised checklist"}</button></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><MessageSquare size={18} /></span><div><span className="eyebrow">CUSTOMER EXPERIENCE</span><h2>Feedback and complaints</h2></div></div><div className="feedback-score"><strong>4.8</strong><span>Average satisfaction<br/><small>64 responses · 0 open complaints</small></span></div></article>
    </section>
  </div>;
}

function MidView() {
  const [cost,setCost] = useState(""); const [ibg,setIbg] = useState(""); const [date,setDate] = useState(""); const [copied,setCopied] = useState(false);
  const filled = [cost,ibg,date].filter(Boolean).length; const ready = 18 + filled;
  return <div className="module-page">
    <ModuleHeader eyebrow="MID PREFLIGHT" title="Enter once. Certify with confidence." description="Validate the installation record before an authorised installer completes registration in the MCS Installations Database." icon={FileCheck2} action="New preflight" />
    <div className="mid-layout">
      <section className="workspace-card mid-form-card">
        <div className="table-toolbar"><div><span className="eyebrow">SES-0248 · SOLAR PV + EESS</span><h2>Certificate preflight</h2></div><span className={`readiness-chip ${ready===21?"ready":""}`}>{ready}/21 fields ready</span></div>
        <div className="big-progress"><span style={{ width: `${(ready/21)*100}%` }} /></div>
        <div className="form-section"><div className="form-section-title"><span>01</span><div><strong>Contract and customer</strong><small>Source: accepted proposal</small></div><CheckCircle2 size={18} /></div><div className="summary-grid"><span><small>Contract type</small><strong>Domestic</strong></span><span><small>Customer</small><strong>Hannah & Tom Reed</strong></span><span><small>Installation postcode</small><strong>SO21 1BT</strong></span><span><small>Incentive</small><strong>None</strong></span></div></div>
        <div className="form-section"><div className="form-section-title"><span>02</span><div><strong>System and products</strong><small>Source: Product Guard and SiteProof</small></div><CheckCircle2 size={18} /></div><div className="summary-grid"><span><small>Technology</small><strong>Solar PV + EESS</strong></span><span><small>PV capacity</small><strong>6.40 kWp</strong></span><span><small>Battery capacity</small><strong>10.0 kWh</strong></span><span><small>Technical Supervisor</small><strong>Alex Mercer</strong></span></div></div>
        <div className="form-section outstanding"><div className="form-section-title"><span>03</span><div><strong>Confirm final details</strong><small>Three items need installer confirmation</small></div><CircleAlert size={18} /></div><div className="field-grid"><label><span>Overall installation cost, inc VAT</span><div><b>£</b><input value={cost} onChange={e=>setCost(e.target.value)} placeholder="12,850" /></div></label><label><span>Financial protection reference</span><input value={ibg} onChange={e=>setIbg(e.target.value)} placeholder="e.g. FP-82394" /></label><label><span>Commissioning date</span><input value={date} onChange={e=>setDate(e.target.value)} placeholder="22/08/2026" /></label></div></div>
      </section>
      <aside className="mid-side">
        <article className="dark-card preflight-score"><span className="eyebrow">PREFLIGHT STATUS</span><ProgressRing value={Math.round((ready/21)*100)} /><h2>{ready===21 ? "Ready for authorised MID entry" : "Three confirmations remain"}</h2><p>Headroom checks completeness and consistency. Final submission remains with the authorised MCS installer in MID.</p><button disabled={ready<21} onClick={()=>setCopied(true)}><Download size={15} /> {copied?"Pack prepared":"Prepare copy sheet"}</button></article>
        <article className="workspace-card copy-sheet"><div className="card-title"><div><span className="eyebrow">COPY SHEET</span><h2>Validated field groups</h2></div><button onClick={()=>setCopied(true)}><Copy size={14} /></button></div>{["Customer & contract","Products & serials","Performance estimate","TS declaration"].map((label,index)=><span key={label}><CheckCircle2 size={15}/><strong>{label}</strong><small>{index===1?"6 products":"Complete"}</small></span>)}{copied&&<em>Copy sheet prepared</em>}</article>
      </aside>
    </div>
  </div>;
}

function PassportView() {
  const [shared,setShared] = useState(false);
  const docs = [["MCS certificate","Awaiting MID","gold"],["DNO approval","Ready","green"],["Electrical certificate","Ready","green"],["Commissioning record","Ready","green"],["Financial protection","Ready","green"],["Product warranties","5 registered","green"],["System design","Ready","green"],["Photo record","23 captures","green"],["Owner guidance","Ready","green"],["Maintenance plan","Ready","green"]];
  return <div className="module-page">
    <ModuleHeader eyebrow="CUSTOMER PASSPORT" title="A handover customers can actually use" description="One branded home for certificates, warranties, system guidance, maintenance and support." icon={ContactRound} action="Preview passport" onAction={()=>setShared(false)} />
    {shared&&<div className="success-banner"><CheckCircle2 size={17}/><span><strong>Passport invitation sent.</strong> Hannah Reed can now view the draft handover record.</span><button onClick={()=>setShared(false)}><X size={15}/></button></div>}
    <section className="passport-layout">
      <article className="workspace-card passport-docs"><div className="table-toolbar"><div><span className="eyebrow">HANDOVER PACK</span><h2>42 Alder Close</h2></div><span className="readiness-chip">9/10 available</span></div><div className="document-list">{docs.map(([name,status,tone],index)=><button key={name}><span className={`doc-icon ${tone}`}><FileText size={17}/></span><span><strong>{name}</strong><small>{status}</small></span>{index===0?<CircleAlert size={16}/>:<CheckCircle2 size={16}/>}</button>)}</div></article>
      <aside className="customer-preview">
        <div className="passport-device">
          <div className="passport-brand"><Brand/><span>HOME ENERGY PASSPORT</span></div>
          <div className="passport-cover"><span>YOUR SYSTEM</span><h2>Home-grown energy,<br/>documented for life.</h2><p>42 Alder Close · Winchester</p><div className="system-summary"><span><strong>6.4 kWp</strong><small>Solar PV</small></span><span><strong>10 kWh</strong><small>Battery</small></span><span><strong>22 Aug</strong><small>Commissioned</small></span></div></div>
          <div className="passport-owner"><span className="avatar">HR</span><span><strong>Hannah Reed</strong><small>Owner · Draft access</small></span><ChevronRight size={16}/></div>
          <div className="passport-links"><button><ShieldCheck size={16}/>Certificates <strong>3</strong></button><button><BookOpenCheck size={16}/>How to use it <ChevronRight size={15}/></button><button><Wrench size={16}/>Service & support <ChevronRight size={15}/></button></div>
        </div>
        <button className="share-passport" onClick={()=>setShared(true)}><Mail size={16}/>{shared?"Invitation sent":"Share customer passport"}</button>
        <small className="preview-note">Draft access can be shared before the MCS certificate arrives.</small>
      </aside>
    </section>
  </div>;
}

function ProductsView() {
  const [verified,setVerified] = useState(false);
  const rows = [
    ["PV module","JA Solar JAM54S31-400/MR","16","MCS PV0277","Certified","green"],
    ["Inverter","GivEnergy GIV-HY5.0","1","MCS IN-01844","Certified","green"],
    ["Battery","Giv-Bat 5.2","2","MCS BATT-0061","Certified","green"],
    ["Mounting","K2 SingleRail 36","1 set","MCS IK0197","Certified","green"],
    ["Generation meter","Eastron SDM230","1","MID listed","Verified","blue"],
    ["Optimiser","Tigo TS4-A-O","8","Manufacturer","Compatible","blue"],
  ];
  return <div className="module-page">
    <ModuleHeader eyebrow="PRODUCT GUARD" title="Certified at quote, order and install" description="Freeze product status against the job and catch substitutions before they become certification problems." icon={PackageCheck} action="Scan product" onAction={()=>setVerified(true)} />
    <MetricStrip items={[{label:"SELECTED PRODUCTS",value:"6",note:"Across PV and EESS"},{label:"CERTIFIED / VERIFIED",value:"6 / 6",note:"Checked today",tone:"green-text"},{label:"SUBSTITUTIONS",value:verified?"0":"1",note:verified?"None outstanding":"Awaiting approval",tone:"gold-text"},{label:"STATUS CHANGES",value:"0",note:"Last 30 days"}]} />
    {verified&&<div className="success-banner"><CheckCircle2 size={17}/><span><strong>Installed kit verified.</strong> Product models and serials now match the locked job record.</span><button onClick={()=>setVerified(false)}><X size={15}/></button></div>}
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">LOCKED PRODUCT SET</span><h2>42 Alder Close · SES-0248</h2></div><div className="toolbar-actions"><button><RefreshCw size={15}/> Recheck status</button><button><Download size={15}/> Export evidence</button></div></div>
      <div className="data-table product-table"><div className="data-row data-head"><span>Type</span><span>Make & model</span><span>Qty</span><span>Certification reference</span><span>Status</span></div>{rows.map(row=><div className="data-row" key={row[0]}><span><span className="product-type-icon"><PackageCheck size={15}/></span><strong>{row[0]}</strong></span><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span className={`data-status ${row[5]}`}>{row[4]}</span></div>)}</div>
    </section>
    <section className="product-bottom-grid">
      <article className="workspace-card substitution-card"><div className="card-title"><span className="icon-tile gold"><RefreshCw size={18}/></span><div><span className="eyebrow">SUBSTITUTION CONTROL</span><h2>Inverter serial confirmation</h2></div><span className={`mini-status ${verified?"green":"gold"}`}>{verified?"Approved":"Needs approval"}</span></div><div className="compare-products"><span><small>QUOTED</small><strong>GivEnergy GIV-HY5.0</strong><em>Model matches</em></span><ArrowRight size={18}/><span><small>INSTALLED</small><strong>GivEnergy GIV-HY5.0</strong><em>Serial not yet captured</em></span></div><button className={`wide-action ${verified?"complete":""}`} onClick={()=>setVerified(true)}>{verified?<CheckCircle2 size={15}/>:<Camera size={15}/>}{verified?"Serial verified":"Capture serial and approve"}</button></article>
      <article className="dark-card product-watch"><div className="signal-top"><span className="eyebrow">CERTIFICATION WATCH</span><BadgeCheck size={18}/></div><h2>No product status changes affect active work.</h2><p>12 active and quoted installations were checked against the latest product records today.</p><span><i className="dot green"/> Last checked 09:26</span></article>
    </section>
  </div>;
}

function TerritoryView() {
  const [segment,setSegment] = useState("All technologies");
  const cells=[34,67,48,82,92,55,74,28,63,88,44,71,96,58,39,77,84,52,69,91,46,79,61,86];
  return <div className="module-page">
    <ModuleHeader eyebrow="TERRITORY INTELLIGENCE" title="Find demand before your competitors do" description="Prioritise postcodes using adoption, installer density, housing suitability and your own conversion data." icon={Map} action="Create campaign" />
    <MetricStrip items={[{label:"TOP OPPORTUNITY",value:"SO21",note:"Score 92 / 100",tone:"gold-text"},{label:"UNTAPPED HOMES",value:"8,420",note:"Across target area"},{label:"INSTALLER DENSITY",value:"Low",note:"3 active competitors",tone:"green-text"},{label:"30-DAY PIPELINE",value:"£284k",note:"Weighted opportunities"}]} />
    <section className="territory-layout">
      <article className="territory-map-card">
        <div className="map-toolbar"><div><span className="eyebrow">OPPORTUNITY MAP</span><h2>Hampshire and West Sussex</h2></div><div className="segment-picker"><button onClick={()=>setSegment(segment==="All technologies"?"Solar + battery":"All technologies")}>{segment}<ChevronDown size={14}/></button><button><SlidersHorizontal size={15}/></button></div></div>
        <div className="map-canvas"><div className="map-grid">{cells.map((value,index)=><button key={index} style={{"--heat":value/100} as React.CSSProperties} title={`Opportunity score ${value}`}>{[4,12,19].includes(index)&&<span>{index===4?"SO21":index===12?"SO51":"PO13"}</span>}</button>)}</div><div className="map-routes"><i/><i/><i/></div><div className="map-pin primary"><MapPin size={22}/><b>SO21</b><small>92</small></div><div className="map-pin secondary"><MapPin size={19}/><b>SO51</b><small>86</small></div><div className="map-legend"><span>Lower potential</span><i/><span>Higher potential</span></div></div>
      </article>
      <aside className="opportunity-list workspace-card"><div className="card-title"><div><span className="eyebrow">NEXT-BEST POSTCODES</span><h2>Ranked opportunities</h2></div><button><Filter size={14}/></button></div>{[
        ["SO21","Winchester rural","92","8,420 homes","+18%"],
        ["SO51","Romsey","86","6,180 homes","+14%"],
        ["PO13","Lee-on-Solent","81","5,760 homes","+11%"],
        ["SP2","West Salisbury","78","4,950 homes","+9%"],
      ].map(([code,place,score,homes,growth],index)=><button key={code}><span className="rank">0{index+1}</span><span><strong>{code}</strong><small>{place}</small></span><span><strong>{score}</strong><small>{homes}</small></span><em>{growth}</em><ChevronRight size={15}/></button>)}</aside>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile gold"><TrendingUp size={18}/></span><div><span className="eyebrow">WHY SO21</span><h2>Opportunity signals</h2></div></div><div className="signal-bars">{[["Suitable housing",91],["Low-carbon adoption gap",84],["Low installer density",88],["Your conversion rate",76]].map(([label,value])=><div key={label as string}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><strong>{value}</strong></div>)}</div></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><Users size={18}/></span><div><span className="eyebrow">COMPETITIVE LANDSCAPE</span><h2>Installer presence</h2></div></div><div className="competitor-stat"><strong>3</strong><span>active installers within target radius<small>Compared with area average of 7</small></span></div><button className="wide-action"><ExternalLink size={15}/> View market detail</button></article>
    </section>
  </div>;
}

function WorkspaceView({ view, onOpen }: { view: View; onOpen: (id: View) => void }) {
  if (view === "sites") return <SitesView onOpen={onOpen}/>;
  if (view === "siteproof") return <SiteProofView/>;
  if (view === "compliance") return <ComplianceView/>;
  if (view === "mid") return <MidView/>;
  if (view === "passport") return <PassportView/>;
  if (view === "products") return <ProductsView/>;
  if (view === "territory") return <TerritoryView/>;
  return <Overview onOpen={onOpen}/>;
}

export default function Home() {
  const [active, setActive] = useState<View>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const openView = (view: View) => { setActive(view); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top"><Brand /><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
        <div className="workspace-label"><span>WORKSPACE</span><strong>Stratford Energy Solutions</strong></div>
        <nav className="sidebar-nav" aria-label="Product navigation">
          {navItems.map((item) => { const Icon = item.icon; return (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => openView(item.id)}>
              <Icon size={18} /><span>{item.label}</span>{item.id === "siteproof" && <em>4</em>}{item.id === "products" && <i />}
            </button>
          ); })}
        </nav>
        <div className="sidebar-footer">
          <div className="scheme-card"><div><ShieldCheck size={17} /><span>MCS Scheme</span></div><strong>Scenario C</strong><small>Audit readiness 92%</small><div className="thin-progress"><span style={{ width: "92%" }} /></div></div>
          <button className="settings-button"><Settings size={17} /> Settings</button>
          <div className="user-row"><span className="avatar">KD</span><span><strong>Kevin Doyle</strong><small>Licensee</small></span><CircleUserRound size={18} /></div>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div><span className="breadcrumb">INSTALLER OS /</span><strong>{navItems.find((item) => item.id === active)?.label}</strong></div></div>
          <div className="topbar-actions">
            <label className="quick-search"><Search size={16} /><input aria-label="Search projects" placeholder="Search projects" /><kbd>⌘ K</kbd></label>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="primary-button" onClick={() => openView("sites")}><ClipboardCheck size={17} /> New installation</button>
          </div>
        </header>
        <div className="content-wrap"><WorkspaceView view={active} onOpen={openView} /></div>
      </section>
    </main>
  );
}
