"use client";

import {
  ArrowRight, BadgeCheck, Bell, BookOpenCheck, CalendarDays,
  Camera, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleAlert, CircleUserRound, ClipboardCheck, ContactRound, Copy, Download,
  ExternalLink, FileCheck2, FileText, FileUp, Filter, Gauge, GraduationCap, HelpCircle, LayoutDashboard,
  Mail, Map, MapPin, MapPinned, Menu, MessageSquare, PackageCheck, Plus,
  RefreshCw, Save, Search, Send, Settings, ShieldCheck, Sparkles,
  TrendingUp, UploadCloud, Users, Wrench, X,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type View = "overview" | "sites" | "siteproof" | "compliance" | "mid" | "passport" | "products" | "territory" | "admin";
type Dialog = "new-project" | "qualification" | "roles" | "serial" | "campaign" | "admin-user" | "workflow" | "integration" | "settings" | "notifications" | null;

type Project = {
  id: string; ref: string; site: string; place: string; postcode: string; system: string;
  stage: string; progress: number; date: string; tone: string; customer: string;
  customerEmail: string; technicalSupervisor: string;
};
type EvidenceRecord = { id: string; category: string; fileName: string; fileKey?: string; capturedAt: string };
type ProductRecord = { type: string; model: string; quantity: string; certification: string; status: string; serial?: string };
type Qualification = { name: string; scope: string; qualification: string; expires: string };
type PassportDocument = { name: string; status: string; fileName?: string; fileKey?: string };
type AdminUser = { id: string; name: string; email: string; role: "Administrator" | "Technical Supervisor" | "Installer" | "Auditor" | "Office"; status: "Active" | "Invited" | "Suspended"; lastActive: string };
type AuditEntry = { id: string; actor: string; action: string; detail: string; category: string; at: string };
type WorkflowRule = { id: string; name: string; trigger: string; action: string; enabled: boolean };
type IntegrationRecord = { id: string; name: string; category: string; detail: string; status: "Connected" | "Attention" | "Paused"; lastSync: string };
type AdminSettings = { companyName: string; mcsNumber: string; certificationBody: string; officePostcode: string; retentionYears: string; requireMfa: boolean; nightlyBackup: boolean; customerPortal: boolean; evidenceQualityGate: boolean };
type InstallerData = {
  projects: Project[];
  activeProjectId: string;
  evidence: Record<string, EvidenceRecord[]>;
  reviewRequested: Record<string, boolean>;
  mid: Record<string, { cost: string; ibg: string; date: string }>;
  products: Record<string, ProductRecord[]>;
  qualifications: Qualification[];
  roles: { role: string; name: string; detail: string }[];
  correctiveActionResolved: boolean;
  passportDocuments: Record<string, PassportDocument[]>;
  passportShared: Record<string, boolean>;
  campaigns: { postcode: string; segment: string; createdAt: string }[];
  notifications: { id: string; title: string; detail: string; read: boolean }[];
  adminUsers: AdminUser[];
  auditLog: AuditEntry[];
  workflowRules: WorkflowRule[];
  integrations: IntegrationRecord[];
  adminSettings: AdminSettings;
};

const evidenceCategories = ["Array and roof overview", "Mounting system and fixings", "Cable routes and protection", "Inverter clearances", "Battery location and labels", "Roof weatherproofing", "Meter and isolator labels", "Commissioning readings"];
const officialResources = [
  { label: "MCS Product Directory", detail: "Check certified renewable products", href: "https://mcscertified.com/product-directory/" },
  { label: "MCS Standards & Tools", detail: "Current standards and installer tools", href: "https://mcscertified.com/standards-tools-library/" },
  { label: "MID installer guidance", detail: "Official installation registration guidance", href: "https://mcscertified.com/installers/help-resources/installer-mid-guidance/" },
  { label: "Find my DNO", detail: "Energy Networks Association operator lookup", href: "https://www.energynetworks.org/customers/find-my-network-operator" },
  { label: "ENA Connect Direct", detail: "Grid connection applications and guidance", href: "https://www.energynetworks.org/industry/connecting-to-the-networks/connect-direct" },
  { label: "MCS Data Dashboard", detail: "Installation and market intelligence", href: "https://mcscertified.com/low-carbon-landscapes/mcs-data-dashboard/" },
];

const activeProducts: ProductRecord[] = [
  { type: "PV module", model: "JA Solar JAM54S31-400/MR", quantity: "16", certification: "MCS PV0277", status: "Certified" },
  { type: "Inverter", model: "GivEnergy GIV-HY5.0", quantity: "1", certification: "MCS IN-01844", status: "Certified" },
  { type: "Battery", model: "Giv-Bat 5.2", quantity: "2", certification: "MCS BATT-0061", status: "Certified" },
  { type: "Mounting", model: "K2 SingleRail 36", quantity: "1 set", certification: "MCS IK0197", status: "Certified" },
  { type: "Generation meter", model: "Eastron SDM230", quantity: "1", certification: "MID listed", status: "Verified" },
  { type: "Optimiser", model: "Tigo TS4-A-O", quantity: "8", certification: "Manufacturer", status: "Compatible" },
];

const defaultDocs: PassportDocument[] = [
  { name: "MCS certificate", status: "Awaiting MID" }, { name: "DNO approval", status: "Ready" },
  { name: "Electrical certificate", status: "Ready" }, { name: "Commissioning record", status: "Ready" },
  { name: "Financial protection", status: "Ready" }, { name: "Product warranties", status: "5 registered" },
  { name: "System design", status: "Ready" }, { name: "Photo record", status: "5 captures" },
  { name: "Owner guidance", status: "Ready" }, { name: "Maintenance plan", status: "Ready" },
];

const defaultData: InstallerData = {
  projects: [
    { id: "ses-0248", ref: "SES-0248", site: "42 Alder Close", place: "Winchester", postcode: "SO21 1BT", system: "6.4 kWp PV + 10 kWh EESS", stage: "Installing", progress: 78, date: "22 Aug", tone: "gold", customer: "Hannah & Tom Reed", customerEmail: "hannah.reed@example.com", technicalSupervisor: "Alex Mercer" },
    { id: "ses-0246", ref: "SES-0246", site: "Rosebank Farm", place: "Romsey", postcode: "SO51 6AA", system: "48 kWp PV + 80 kWh EESS", stage: "TS review", progress: 92, date: "20 Aug", tone: "blue", customer: "Rosebank Estates", customerEmail: "estates@example.com", technicalSupervisor: "Alex Mercer" },
    { id: "ses-0241", ref: "SES-0241", site: "8 Marine Parade", place: "Lee-on-Solent", postcode: "PO13 9LB", system: "8.1 kWp PV", stage: "MID ready", progress: 97, date: "19 Aug", tone: "green", customer: "J. Carter", customerEmail: "j.carter@example.com", technicalSupervisor: "Leah Khan" },
    { id: "ses-0237", ref: "SES-0237", site: "The Old Mill", place: "Salisbury", postcode: "SP2 7RA", system: "ASHP + 13 kWh EESS", stage: "Commissioned", progress: 100, date: "15 Aug", tone: "green", customer: "Old Mill Holdings", customerEmail: "facilities@example.com", technicalSupervisor: "Marcus Dean" },
  ],
  activeProjectId: "ses-0248",
  evidence: { "ses-0248": evidenceCategories.slice(0, 5).map((category, index) => ({ id: `e-${index}`, category, fileName: `${category.toLowerCase().replaceAll(" ", "-")}.jpg`, capturedAt: `2026-08-19T09:${String(2 + index * 5).padStart(2, "0")}:00.000Z` })) },
  reviewRequested: {},
  mid: { "ses-0248": { cost: "", ibg: "", date: "" } },
  products: { "ses-0248": activeProducts },
  qualifications: [
    { name: "Alex Mercer", scope: "Solar PV · EESS", qualification: "L3 Solar PV + current BS 7671", expires: "2028-03-14" },
    { name: "Leah Khan", scope: "Solar PV", qualification: "L3 Solar PV", expires: "2026-09-28" },
    { name: "Marcus Dean", scope: "Heat pumps", qualification: "L3 Heat Pump Systems", expires: "2029-05-09" },
  ],
  roles: [
    { role: "Licensee", name: "Kevin Doyle", detail: "Overall Scheme responsibility" },
    { role: "Main Contact", name: "Sophie Ward", detail: "MCS and certification liaison" },
    { role: "Technical Supervisor", name: "Alex Mercer", detail: "Solar PV · EESS" },
  ],
  correctiveActionResolved: false,
  passportDocuments: { "ses-0248": defaultDocs },
  passportShared: {},
  campaigns: [],
  notifications: [
    { id: "n1", title: "Evidence action due", detail: "Roof weatherproofing is required before TS review.", read: false },
    { id: "n2", title: "Qualification due", detail: "Leah Khan’s Solar PV qualification is due within 60 days.", read: false },
    { id: "n3", title: "MID deadline", detail: "Register commissioned installations within the MCS submission window.", read: true },
  ],
  adminUsers: [
    { id: "u-kevin", name: "Kevin Doyle", email: "kevin.doyle@adarogroup.eu", role: "Administrator", status: "Active", lastActive: "Now" },
    { id: "u-alex", name: "Alex Mercer", email: "alex.mercer@example.com", role: "Technical Supervisor", status: "Active", lastActive: "18 mins ago" },
    { id: "u-leah", name: "Leah Khan", email: "leah.khan@example.com", role: "Installer", status: "Active", lastActive: "Yesterday" },
    { id: "u-sophie", name: "Sophie Ward", email: "sophie.ward@example.com", role: "Office", status: "Invited", lastActive: "Invitation pending" },
  ],
  auditLog: [
    { id: "a1", actor: "Kevin Doyle", action: "Workspace administration enabled", detail: "Organisation controls and audit history activated.", category: "Administration", at: "2026-08-19T11:42:00.000Z" },
    { id: "a2", actor: "Alex Mercer", action: "Technical review requested", detail: "SES-0246 · Rosebank Farm", category: "Compliance", at: "2026-08-19T10:18:00.000Z" },
    { id: "a3", actor: "Leah Khan", action: "Evidence uploaded", detail: "SES-0248 · Inverter clearances", category: "Evidence", at: "2026-08-19T09:32:00.000Z" },
  ],
  workflowRules: [
    { id: "w1", name: "Technical review gate", trigger: "All required evidence captured", action: "Notify the assigned Technical Supervisor", enabled: true },
    { id: "w2", name: "Qualification warning", trigger: "Qualification expires within 60 days", action: "Alert administrator and affected person", enabled: true },
    { id: "w3", name: "MID deadline watch", trigger: "Project marked commissioned", action: "Create a registration deadline task", enabled: true },
    { id: "w4", name: "Passport release", trigger: "Handover pack reaches 10/10", action: "Prepare customer invitation", enabled: false },
  ],
  integrations: [
    { id: "i1", name: "MCS installer resources", category: "Certification", detail: "Product, standards and MID links", status: "Connected", lastSync: "Live links" },
    { id: "i2", name: "ENA network services", category: "Grid", detail: "DNO lookup and Connect Direct", status: "Connected", lastSync: "Live links" },
    { id: "i3", name: "Workspace document store", category: "Data", detail: "Project evidence and passport files", status: "Connected", lastSync: "Just now" },
    { id: "i4", name: "Customer email", category: "Communications", detail: "Device email client hand-off", status: "Connected", lastSync: "On demand" },
  ],
  adminSettings: { companyName: "Stratford Energy Solutions", mcsNumber: "MCS-SES-024", certificationBody: "MCS Scheme · Scenario C", officePostcode: "SO21", retentionYears: "7", requireMfa: true, nightlyBackup: true, customerPortal: true, evidenceQualityGate: true },
};

function normaliseData(value?: Partial<InstallerData> | null): InstallerData {
  if (!value) return defaultData;
  return {
    ...defaultData,
    ...value,
    adminUsers: Array.isArray(value.adminUsers) ? value.adminUsers : defaultData.adminUsers,
    auditLog: Array.isArray(value.auditLog) ? value.auditLog : defaultData.auditLog,
    workflowRules: Array.isArray(value.workflowRules) ? value.workflowRules : defaultData.workflowRules,
    integrations: Array.isArray(value.integrations) ? value.integrations : defaultData.integrations,
    adminSettings: { ...defaultData.adminSettings, ...(value.adminSettings ?? {}) },
  };
}

type OSContextValue = {
  data: InstallerData;
  setData: React.Dispatch<React.SetStateAction<InstallerData>>;
  activeProject: Project;
  storageMode: "loading" | "cloud" | "local";
  toast: string;
  showToast: (message: string) => void;
  dialog: Dialog;
  openDialog: (dialog: Dialog) => void;
  uploadFile: (file: File, purpose: string) => Promise<{ fileName: string; fileKey?: string }>;
  recordAudit: (action: string, detail: string, category?: string) => void;
};

const OSContext = createContext<OSContextValue | null>(null);
const useOS = () => {
  const value = useContext(OSContext);
  if (!value) throw new Error("Installer OS context is unavailable");
  return value;
};

function downloadText(name: string, text: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  URL.revokeObjectURL(url);
}

function InstallerProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InstallerData>(defaultData);
  const [storageMode, setStorageMode] = useState<"loading" | "cloud" | "local">("loading");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workspace", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Cloud workspace unavailable");
      const payload = await response.json() as { state?: InstallerData | null };
      if (cancelled) return;
      if (payload.state) setData(normaliseData(payload.state));
      setStorageMode("cloud");
      setLoaded(true);
    }).catch(() => {
      if (cancelled) return;
      const local = window.localStorage.getItem("headroom-installer-os");
      if (local) { try { setData(normaliseData(JSON.parse(local) as Partial<InstallerData>)); } catch { /* keep demo data */ } }
      setStorageMode("local");
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (storageMode === "cloud") {
        fetch("/api/workspace", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: data }) })
          .then((response) => { if (!response.ok) throw new Error("Save failed"); })
          .catch(() => { window.localStorage.setItem("headroom-installer-os", JSON.stringify(data)); setStorageMode("local"); setToast("Cloud save unavailable — changes are stored on this device."); });
      } else if (storageMode === "local") window.localStorage.setItem("headroom-installer-os", JSON.stringify(data));
    }, 450);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, loaded, storageMode]);

  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3800); return () => clearTimeout(timer); }, [toast]);

  const activeProject = data.projects.find((project) => project.id === data.activeProjectId) ?? data.projects[0];
  const uploadFile = async (file: File, purpose: string) => {
    if (storageMode === "cloud") {
      const body = new FormData(); body.append("file", file); body.append("purpose", purpose);
      const response = await fetch("/api/files", { method: "POST", body });
      if (response.ok) return await response.json() as { fileName: string; fileKey: string };
    }
    return { fileName: file.name };
  };
  const recordAudit = (action: string, detail: string, category = "Administration") => setData((current) => ({ ...current, auditLog: [{ id: crypto.randomUUID(), actor: "Kevin Doyle", action, detail, category, at: new Date().toISOString() }, ...current.auditLog].slice(0, 250) }));

  const value: OSContextValue = { data, setData, activeProject, storageMode, toast, showToast: setToast, dialog, openDialog: setDialog, uploadFile, recordAudit };
  return <OSContext.Provider value={value}>{children}<DialogLayer />{toast && <div className="toast" role="status"><CheckCircle2 size={16}/>{toast}</div>}</OSContext.Provider>;
}

function DialogLayer() {
  const { dialog, openDialog, data, setData, activeProject, storageMode, showToast, recordAudit } = useOS();
  if (!dialog) return null;
  const close = () => openDialog(null);
  const addProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const id = crypto.randomUUID();
    const commission = String(form.get("commission") ?? "");
    const reference = `SES-${String(249 + data.projects.length).padStart(4, "0")}`;
    const project: Project = {
      id, ref: reference, site: String(form.get("site") ?? "New installation"), place: String(form.get("place") ?? ""),
      postcode: String(form.get("postcode") ?? "").toUpperCase(), system: String(form.get("system") ?? "Solar PV"),
      stage: "Site screened", progress: 12, date: commission ? new Date(`${commission}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "TBC",
      tone: "blue", customer: String(form.get("customer") ?? ""), customerEmail: String(form.get("email") ?? ""), technicalSupervisor: String(form.get("ts") ?? "Alex Mercer"),
    };
    setData((current) => ({ ...current, projects: [project, ...current.projects], activeProjectId: id, evidence: { ...current.evidence, [id]: [] }, mid: { ...current.mid, [id]: { cost: "", ibg: "", date: commission } }, products: { ...current.products, [id]: [] }, passportDocuments: { ...current.passportDocuments, [id]: defaultDocs.map((doc) => ({ ...doc, status: "Required" })) } }));
    close(); showToast(`${reference} created and selected.`);
  };
  const addQualification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const qualification = { name: String(form.get("name") ?? ""), scope: String(form.get("scope") ?? ""), qualification: String(form.get("qualification") ?? ""), expires: String(form.get("expires") ?? "") };
    setData((current) => ({ ...current, qualifications: [...current.qualifications, qualification] })); close(); showToast("Qualification added to the competency register.");
  };
  const saveRoles = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setData((current) => ({ ...current, roles: current.roles.map((item, index) => ({ ...item, name: String(form.get(`role-${index}`) ?? item.name) })) })); close(); showToast("Accountable roles updated.");
  };
  const saveSerial = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const index = Number(form.get("product")); const serial = String(form.get("serial") ?? "").trim();
    setData((current) => ({ ...current, products: { ...current.products, [activeProject.id]: (current.products[activeProject.id] ?? []).map((product, productIndex) => productIndex === index ? { ...product, serial, status: "Verified" } : product) }, notifications: [{ id: crypto.randomUUID(), title: "Product serial verified", detail: `${activeProject.ref}: ${serial}`, read: false }, ...current.notifications] }));
    close(); showToast("Installed serial captured and locked to the project.");
  };
  const createCampaign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const postcode = String(form.get("postcode") ?? "SO21").toUpperCase(); const segment = String(form.get("segment") ?? "Solar + battery");
    setData((current) => ({ ...current, campaigns: [{ postcode, segment, createdAt: new Date().toISOString() }, ...current.campaigns] }));
    downloadText(`${postcode.toLowerCase()}-campaign.csv`, `postcode,segment,status,created\n${postcode},${segment},Draft,${new Date().toISOString()}\n`, "text/csv");
    close(); showToast(`${postcode} campaign created and exported.`);
  };
  const addAdminUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const user: AdminUser = { id: crypto.randomUUID(), name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "").trim().toLowerCase(), role: String(form.get("role") ?? "Installer") as AdminUser["role"], status: "Invited", lastActive: "Invitation pending" };
    setData((current) => ({ ...current, adminUsers: [...current.adminUsers, user] }));
    recordAudit("User invited", `${user.name} · ${user.role}`, "Access"); close(); showToast(`Invitation prepared for ${user.email}.`);
    window.location.href = `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent("Headroom Installer OS invitation")}&body=${encodeURIComponent(`Hello ${user.name},\n\nYou have been invited to Headroom Installer OS as ${user.role}.\n\nRegards,\n${data.adminSettings.companyName}`)}`;
  };
  const addWorkflow = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const rule: WorkflowRule = { id: crypto.randomUUID(), name: String(form.get("name") ?? ""), trigger: String(form.get("trigger") ?? ""), action: String(form.get("action") ?? ""), enabled: true };
    setData((current) => ({ ...current, workflowRules: [...current.workflowRules, rule] })); recordAudit("Automation created", rule.name, "Workflow"); close(); showToast(`${rule.name} is now active.`);
  };
  const addIntegration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const integration: IntegrationRecord = { id: crypto.randomUUID(), name: String(form.get("name") ?? ""), category: String(form.get("category") ?? "Operations"), detail: String(form.get("detail") ?? "Custom connection"), status: "Connected", lastSync: "Just now" };
    setData((current) => ({ ...current, integrations: [...current.integrations, integration] })); recordAudit("Integration added", integration.name, "Integration"); close(); showToast(`${integration.name} connected.`);
  };

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
    <section className="dialog-card" role="dialog" aria-modal="true" aria-label="Installer OS action">
      <button className="dialog-close" onClick={close} aria-label="Close"><X size={18}/></button>
      {dialog === "new-project" && <><span className="eyebrow">NEW INSTALLATION</span><h2>Create a connected project</h2><p>Start one record that will feed evidence, MID, products and customer handover.</p><form className="dialog-form" onSubmit={addProject}><label>Site name<input name="site" required placeholder="e.g. 16 Meadow Lane"/></label><div className="dialog-pair"><label>Town<input name="place" required/></label><label>Postcode<input name="postcode" required/></label></div><label>System<select name="system"><option>Solar PV + EESS</option><option>Solar PV</option><option>Air source heat pump</option><option>Battery storage</option></select></label><div className="dialog-pair"><label>Customer<input name="customer" required/></label><label>Email<input name="email" type="email" required/></label></div><div className="dialog-pair"><label>Commissioning date<input name="commission" type="date" required/></label><label>Technical Supervisor<select name="ts">{data.roles.filter((role) => role.role === "Technical Supervisor").map((role) => <option key={role.name}>{role.name}</option>)}<option>Leah Khan</option><option>Marcus Dean</option></select></label></div><button className="dialog-submit"><Plus size={16}/>Create installation</button></form></>}
      {dialog === "qualification" && <><span className="eyebrow">COMPETENCY REGISTER</span><h2>Add a qualification</h2><form className="dialog-form" onSubmit={addQualification}><label>Person<input name="name" required/></label><label>Technology scope<input name="scope" required placeholder="Solar PV · EESS"/></label><label>Qualification<input name="qualification" required/></label><label>Expiry date<input name="expires" type="date" required/></label><button className="dialog-submit"><Save size={16}/>Save qualification</button></form></>}
      {dialog === "roles" && <><span className="eyebrow">SCHEME OWNERSHIP</span><h2>Manage accountable roles</h2><form className="dialog-form" onSubmit={saveRoles}>{data.roles.map((role, index) => <label key={role.role}>{role.role}<input name={`role-${index}`} defaultValue={role.name} required/><small>{role.detail}</small></label>)}<button className="dialog-submit"><Save size={16}/>Save roles</button></form></>}
      {dialog === "serial" && <><span className="eyebrow">PRODUCT GUARD</span><h2>Capture installed serial</h2><p>{activeProject.ref} · {activeProject.site}</p><form className="dialog-form" onSubmit={saveSerial}><label>Product<select name="product">{(data.products[activeProject.id] ?? []).map((product, index) => <option key={`${product.type}-${index}`} value={index}>{product.type} · {product.model}</option>)}</select></label><label>Serial number<input name="serial" required autoFocus placeholder="Scan or type serial"/></label><button className="dialog-submit"><BadgeCheck size={16}/>Verify and lock</button></form></>}
      {dialog === "campaign" && <><span className="eyebrow">TERRITORY INTELLIGENCE</span><h2>Create a postcode campaign</h2><form className="dialog-form" onSubmit={createCampaign}><label>Target postcode<input name="postcode" defaultValue="SO21" required/></label><label>Technology<select name="segment"><option>Solar + battery</option><option>Solar PV</option><option>Heat pumps</option><option>Battery storage</option></select></label><button className="dialog-submit"><Download size={16}/>Create and export campaign</button></form></>}
      {dialog === "admin-user" && <><span className="eyebrow">ACCESS ADMINISTRATION</span><h2>Invite a workspace user</h2><p>Create their account record, assign least-privilege access and prepare the invitation email.</p><form className="dialog-form" onSubmit={addAdminUser}><label>Full name<input name="name" required autoFocus/></label><label>Email address<input name="email" type="email" required/></label><label>Workspace role<select name="role"><option>Installer</option><option>Technical Supervisor</option><option>Office</option><option>Auditor</option><option>Administrator</option></select></label><button className="dialog-submit"><Users size={16}/>Create and invite user</button></form></>}
      {dialog === "workflow" && <><span className="eyebrow">WORKFLOW AUTOMATION</span><h2>Create an administration rule</h2><p>Rules are saved with the organisation workspace and can be paused at any time.</p><form className="dialog-form" onSubmit={addWorkflow}><label>Rule name<input name="name" required autoFocus placeholder="e.g. Failed evidence escalation"/></label><label>When this happens<input name="trigger" required placeholder="Evidence is rejected twice"/></label><label>Then do this<input name="action" required placeholder="Notify administrator and Technical Supervisor"/></label><button className="dialog-submit"><Sparkles size={16}/>Activate workflow</button></form></>}
      {dialog === "integration" && <><span className="eyebrow">INTEGRATION ADMINISTRATION</span><h2>Add a connection</h2><form className="dialog-form" onSubmit={addIntegration}><label>Integration name<input name="name" required autoFocus/></label><label>Category<select name="category"><option>Certification</option><option>Grid</option><option>Communications</option><option>Data</option><option>Operations</option></select></label><label>Connection purpose<input name="detail" required placeholder="What this connection supports"/></label><button className="dialog-submit"><ExternalLink size={16}/>Add connection</button></form></>}
      {dialog === "notifications" && <><span className="eyebrow">WORKSPACE ALERTS</span><h2>Notifications</h2><div className="notification-list">{data.notifications.map((item) => <button key={item.id} className={item.read ? "read" : ""} onClick={() => setData((current) => ({ ...current, notifications: current.notifications.map((note) => note.id === item.id ? { ...note, read: true } : note) }))}><span>{item.read ? <CheckCircle2 size={16}/> : <Bell size={16}/>}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div></>}
      {dialog === "settings" && <><span className="eyebrow">SETTINGS & INTEGRATIONS</span><h2>Connected workspace</h2><div className={`storage-status ${storageMode}`}><ShieldCheck size={18}/><span><strong>{storageMode === "cloud" ? "Saved workspace" : storageMode === "local" ? "Device fallback mode" : "Connecting"}</strong><small>{storageMode === "cloud" ? "Records and upload metadata persist securely with this Site." : "The hosted data service is unavailable here; changes remain on this device."}</small></span></div><div className="resource-list">{officialResources.map((resource) => <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer"><span><strong>{resource.label}</strong><small>{resource.detail}</small></span><ExternalLink size={15}/></a>)}</div><button className="dialog-secondary" onClick={() => { downloadText("headroom-installer-os-backup.json", JSON.stringify(data, null, 2)); showToast("Workspace backup downloaded."); }}><Download size={15}/>Download workspace backup</button></>}
    </section>
  </div>;
}

const navItems: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Command centre", icon: LayoutDashboard },
  { id: "sites", label: "Sites & projects", icon: MapPinned },
  { id: "siteproof", label: "SiteProof", icon: Camera },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "mid", label: "MID preflight", icon: FileCheck2 },
  { id: "passport", label: "Customer passport", icon: ContactRound },
  { id: "products", label: "Product Guard", icon: BadgeCheck },
  { id: "territory", label: "Territory intelligence", icon: Map },
  { id: "admin", label: "Administration", icon: Settings },
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
  const { data, activeProject } = useOS();
  const evidenceCount = (data.evidence[activeProject.id] ?? []).length;
  const midRecord = data.mid[activeProject.id] ?? { cost: "", ibg: "", date: "" };
  const midReady = 18 + [midRecord.cost, midRecord.ibg, midRecord.date].filter(Boolean).length;
  const passportReady = (data.passportDocuments[activeProject.id] ?? defaultDocs).filter((document) => document.status !== "Required" && !document.status.startsWith("Awaiting")).length;
  const liveModules = modules.map((module) => module.id === "siteproof" ? { ...module, value: `${evidenceCount} / ${evidenceCategories.length}`, detail: `${Math.max(0, evidenceCategories.length - evidenceCount)} items needed before TS review` } : module.id === "mid" ? { ...module, value: `${midReady} / 21`, detail: midReady === 21 ? "Ready for authorised MID entry" : `${21 - midReady} fields require confirmation` } : module.id === "passport" ? { ...module, value: `${passportReady} / 10`, detail: passportReady === 10 ? "Complete handover pack" : "Complete outstanding handover records" } : module);
  const stages = [
    ["Site screened", "complete"], ["System designed", "complete"],
    ["Install proof", "current"], ["TS review", "next"],
    ["MID certificate", "next"], ["Passport shared", "next"],
  ];

  return (
    <div className="view-stack">
      <section className="project-hero">
        <div className="hero-copy">
          <div className="eyebrow">ACTIVE INSTALLATION · {activeProject.ref}</div>
          <div className="hero-title-row">
            <div><h1>{activeProject.site}</h1><p>{activeProject.place}, {activeProject.postcode} · {activeProject.system}</p></div>
            <span className="status-pill gold">{activeProject.stage.toUpperCase()}</span>
          </div>
          <div className="project-facts">
            <div><span>Commissioning</span><strong>{activeProject.date}</strong></div>
            <div><span>Technical supervisor</span><strong>{activeProject.technicalSupervisor}</strong></div>
            <div><span>MCS route</span><strong>{activeProject.system}</strong></div>
            <div><span>Grid route</span><strong>G99 · approved</strong></div>
          </div>
        </div>
        <div className="hero-score"><ProgressRing value={activeProject.progress} /><div><strong>Job readiness</strong><span>{Math.max(0, evidenceCategories.length - evidenceCount + (21 - midReady))} actions remaining</span></div></div>
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
          {liveModules.map((module) => {
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
  const { data, setData, openDialog } = useOS();
  const [query, setQuery] = useState("");
  const [actionOnly, setActionOnly] = useState(false);
  const projects = data.projects.filter((project) => (!actionOnly || project.progress < 90) && `${project.ref} ${project.site} ${project.place} ${project.postcode}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="module-page">
    <ModuleHeader eyebrow="SITES & PROJECTS" title="Every installation, one connected record" description="Move each job from survey to certificate without re-entering the same information." icon={MapPinned} action="New installation" onAction={() => openDialog("new-project")} />
    <MetricStrip items={[
      { label: "ACTIVE PROJECTS", value: String(data.projects.length), note: "Connected installation records" },
      { label: "INSTALLING NOW", value: String(data.projects.filter((project) => project.stage === "Installing").length), note: "Evidence capture active", tone: "gold-text" },
      { label: "AWAITING TS", value: String(data.projects.filter((project) => project.stage === "TS review").length), note: "Technical review queue" },
      { label: "READY TO CERTIFY", value: String(data.projects.filter((project) => project.progress >= 95).length), note: "No blocking actions", tone: "green-text" },
    ]} />
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">LIVE PORTFOLIO</span><h2>Installation pipeline</h2></div><div className="toolbar-actions"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a site or reference" /></label><button className={actionOnly ? "active-filter" : ""} onClick={() => setActionOnly((value) => !value)}><Filter size={15} /> {actionOnly ? "Action only" : "Filter"}</button></div></div>
      <div className="project-table" role="table" aria-label="Installation pipeline">
        <div className="project-row table-head" role="row"><span>Project</span><span>System</span><span>Stage</span><span>Readiness</span><span>Commission</span><span /></div>
        {projects.map((project) => <button className="project-row" role="row" key={project.ref} onClick={() => { setData((current) => ({ ...current, activeProjectId: project.id })); onOpen("siteproof"); }}>
          <span className="project-name"><strong>{project.site}</strong><small>{project.ref} · {project.place} · {project.postcode}</small></span>
          <span>{project.system}</span><span><i className={`dot ${project.tone}`} />{project.stage}</span>
          <span className="readiness"><strong>{project.progress}%</strong><i><b style={{ width: `${project.progress}%` }} /></i></span>
          <span>{project.date}</span><span><ChevronRight size={16} /></span>
        </button>)}
        {projects.length === 0 && <div className="empty-state"><Search size={20}/><strong>No matching installations</strong><span>Clear the search or turn off the action filter.</span></div>}
      </div>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><CalendarDays size={18} /></span><div><span className="eyebrow">CREW CAPACITY</span><h2>Next seven days</h2></div></div><div className="capacity-bars">{[["Mon",82],["Tue",100],["Wed",74],["Thu",91],["Fri",58]].map(([day, value]) => <div key={day as string}><span>{day}</span><i><b style={{ height: `${value}%` }} /></i><small>{value}%</small></div>)}</div></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile green"><CheckCircle2 size={18} /></span><div><span className="eyebrow">FLOW HEALTH</span><h2>What is slowing delivery</h2></div></div><div className="issue-list"><span><i className="dot gold" /> Evidence incomplete <strong>4</strong></span><span><i className="dot blue" /> TS review queue <strong>3</strong></span><span><i className="dot green" /> Ready for MID <strong>4</strong></span></div></article>
    </section>
  </div>;
}

function SiteProofView() {
  const { data, setData, activeProject, uploadFile, showToast } = useOS();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingCategory, setPendingCategory] = useState("");
  const [reviewBannerDismissed, setReviewBannerDismissed] = useState(false);
  const records = data.evidence[activeProject.id] ?? [];
  const captured = new Set(records.map((record) => record.category));
  const sent = Boolean(data.reviewRequested[activeProject.id]);
  const score = Math.round((captured.size / evidenceCategories.length) * 100);
  const requestCapture = (category?: string) => { setPendingCategory(category ?? evidenceCategories.find((item) => !captured.has(item)) ?? "Additional site evidence"); fileInput.current?.click(); };
  const captureFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const stored = await uploadFile(file, `evidence/${activeProject.id}`);
    const record = { id: crypto.randomUUID(), category: pendingCategory || "Additional site evidence", fileName: stored.fileName, fileKey: stored.fileKey, capturedAt: new Date().toISOString() };
    setData((current) => { const evidence = [...(current.evidence[activeProject.id] ?? []).filter((item) => item.category !== record.category), record]; const progress = Math.min(95, 30 + Math.round((evidence.length / evidenceCategories.length) * 60)); return { ...current, evidence: { ...current.evidence, [activeProject.id]: evidence }, projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, progress } : project) }; });
    event.target.value = ""; showToast(`${record.category} captured and time-stamped.`);
  };
  const sendReview = () => {
    setData((current) => ({ ...current, reviewRequested: { ...current.reviewRequested, [activeProject.id]: true }, projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, stage: "TS review", progress: Math.max(project.progress, 92), tone: "blue" } : project), notifications: [{ id: crypto.randomUUID(), title: "TS review requested", detail: `${activeProject.ref} was sent to ${activeProject.technicalSupervisor}.`, read: false }, ...current.notifications] }));
    showToast(`Review request recorded for ${activeProject.technicalSupervisor}.`);
  };
  return <div className="module-page">
    <input ref={fileInput} className="visually-hidden" type="file" accept="image/*,.pdf" capture="environment" onChange={captureFile}/>
    <ModuleHeader eyebrow="SITEPROOF" title="Capture it right the first time" description="Guided, time-stamped evidence that gives your Technical Supervisor a complete installation to review." icon={Camera} action="Capture evidence" onAction={() => requestCapture()} />
    <div className="project-context"><div><span className="eyebrow">ACTIVE JOB</span><strong>{activeProject.site}, {activeProject.place}</strong><small>{activeProject.ref} · {activeProject.system}</small></div><div><span>Installer</span><strong>J. Patel</strong></div><div><span>Technical Supervisor</span><strong>{activeProject.technicalSupervisor}</strong></div><div className="context-score"><strong>{captured.size}/{evidenceCategories.length}</strong><span>evidence gates</span></div></div>
    {sent && !reviewBannerDismissed && <div className="success-banner"><CheckCircle2 size={17} /><span><strong>Review requested.</strong> {activeProject.technicalSupervisor} has been notified with the locked evidence set.</span><button onClick={() => setReviewBannerDismissed(true)}><X size={15} /></button></div>}
    <section className="proof-layout">
      <article className="workspace-card">
        <div className="table-toolbar"><div><span className="eyebrow">REQUIRED EVIDENCE</span><h2>Solar PV + battery checklist</h2></div><span className="percentage-label">{score}% complete</span></div>
        <div className="big-progress"><span style={{ width: `${score}%` }} /></div>
        <div className="proof-checklist">{evidenceCategories.map((item,index) => { const record = records.find((entry) => entry.category === item); return <button key={item} className={record ? "done" : ""} onClick={() => record?.fileKey ? window.open(`/api/files?key=${encodeURIComponent(record.fileKey)}`, "_blank") : requestCapture(item)}><span>{record ? <Check size={15} /> : index + 1}</span><div><strong>{item}</strong><small>{record ? `Captured ${new Date(record.capturedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · ${record.fileName}` : "Select to add photo or PDF evidence"}</small></div>{record ? <BadgeCheck size={18} /> : <UploadCloud size={18} />}</button>; })}</div>
      </article>
      <aside className="proof-side">
        <article className="dark-card ts-gate"><span className="eyebrow">TECHNICAL SUPERVISOR GATE</span><div className="gate-score"><ProgressRing value={score} /><div><strong>{score === 100 ? "Ready to review" : "Evidence incomplete"}</strong><small>{evidenceCategories.length-captured.size} required items remain</small></div></div><ul><li className="complete"><Check size={13} /> Product set verified</li><li className="complete"><Check size={13} /> Installer competency current</li><li className={score === 100 ? "complete" : ""}><Check size={13} /> Required site evidence</li><li className={sent ? "complete" : ""}><Check size={13} /> TS declaration requested</li></ul><button disabled={score !== 100 || sent} onClick={sendReview}><Send size={15} /> {sent ? "Review requested" : `Send to ${activeProject.technicalSupervisor}`}</button></article>
        <article className="workspace-card evidence-gallery"><div className="card-title"><div><span className="eyebrow">LATEST CAPTURES</span><h2>Evidence feed</h2></div><button onClick={() => downloadText(`${activeProject.ref}-evidence.json`, JSON.stringify(records, null, 2))} aria-label="Export evidence register"><Download size={14} /></button></div><div className="evidence-thumbs">{records.slice(-3).map((record, index) => <button className={`thumb ${["roof","inverter","battery"][index % 3]}`} key={record.id} onClick={() => record.fileKey ? window.open(`/api/files?key=${encodeURIComponent(record.fileKey)}`, "_blank") : requestCapture(record.category)}><i>{new Date(record.capturedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</i><b>{record.category}</b></button>)}<button onClick={() => requestCapture()}><Plus size={18} /><small>Add capture</small></button></div></article>
      </aside>
    </section>
  </div>;
}

function ComplianceView() {
  const { data, setData, openDialog, showToast } = useOS();
  const [today] = useState(() => new Date().getTime());
  const resolved = data.correctiveActionResolved;
  const dueSoon = data.qualifications.filter((item) => new Date(item.expires).getTime() - today < 1000 * 60 * 60 * 24 * 90).length;
  return <div className="module-page">
    <ModuleHeader eyebrow="COMPLIANCE HUB" title="Know your position before the assessor does" description="Your operating scenario, people, processes and corrective actions in one current view." icon={ShieldCheck} action="Run readiness check" onAction={() => showToast(resolved && dueSoon === 0 ? "Readiness check passed with no open actions." : `${(resolved ? 0 : 1) + dueSoon} compliance action${(resolved ? 0 : 1) + dueSoon === 1 ? "" : "s"} identified.`)} />
    <MetricStrip items={[
      { label: "AUDIT READINESS", value: resolved ? "96%" : "92%", note: "Scenario C", tone: "green-text" },
      { label: "TECHNICAL SUPERVISORS", value: "3", note: "Across two technologies" },
      { label: "QUALIFICATIONS DUE", value: String(dueSoon), note: "Within 90 days", tone: "gold-text" },
      { label: "OPEN CORRECTIVE ACTIONS", value: resolved ? "0" : "1", note: resolved ? "All resolved" : "Minor · 12 days old" },
    ]} />
    <section className="compliance-grid">
      <article className="workspace-card roles-card"><div className="table-toolbar"><div><span className="eyebrow">ACCOUNTABLE ROLES</span><h2>Scheme ownership</h2></div><button className="quiet-button" onClick={() => openDialog("roles")}>Manage roles</button></div><div className="role-grid">{data.roles.map(({ role,name,detail }) => <div key={role}><span className="role-avatar">{name.split(" ").map((part) => part[0]).join("").slice(0,2)}</span><span><small>{role}</small><strong>{name}</strong><em>{detail}</em></span><BadgeCheck size={17} /></div>)}</div></article>
      <article className="dark-card risk-card"><div className="signal-top"><span className="eyebrow">RISK SIGNAL</span><Gauge size={18} /></div><strong>Reduced assessment is within reach.</strong><p>Close the remaining competency action and maintain two consecutive pass outcomes to strengthen your risk position.</p><div className="risk-meter"><span /><i>Current</i><b>Reduced</b></div></article>
    </section>
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">PEOPLE & COMPETENCY</span><h2>Technical Supervisor register</h2></div><button className="quiet-button" onClick={() => openDialog("qualification")}><GraduationCap size={15} /> Add qualification</button></div>
      <div className="data-table qualification-table"><div className="data-row data-head"><span>Person</span><span>Scope</span><span>Qualification</span><span>Expires</span><span>Status</span></div>{data.qualifications.map((item) => { const soon = new Date(item.expires).getTime() - today < 1000 * 60 * 60 * 24 * 90; return <div className="data-row" key={`${item.name}-${item.qualification}`}><span><span className="mini-avatar">{item.name.split(" ").map(n=>n[0]).join("")}</span><strong>{item.name}</strong></span><span>{item.scope}</span><span>{item.qualification}</span><span>{new Date(`${item.expires}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span><span className={`data-status ${soon ? "gold" : "green"}`}>{soon ? "Due soon" : "Current"}</span></div>; })}</div>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile gold"><RefreshCw size={18} /></span><div><span className="eyebrow">CORRECTIVE ACTION</span><h2>{resolved ? "Action resolved" : "Commissioning form version control"}</h2></div></div><p className="card-copy">{resolved ? "The revised checklist is active and team acknowledgement has been recorded." : "Two crews used an earlier checklist revision. Replace it and capture acknowledgement."}</p><button className={`wide-action ${resolved ? "complete" : ""}`} onClick={() => { setData((current) => ({ ...current, correctiveActionResolved: true })); showToast("Corrective action closed and recorded."); }}>{resolved ? <CheckCircle2 size={15} /> : <Wrench size={15} />}{resolved ? "Resolved today" : "Apply revised checklist"}</button></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><MessageSquare size={18} /></span><div><span className="eyebrow">CUSTOMER EXPERIENCE</span><h2>Feedback and complaints</h2></div></div><div className="feedback-score"><strong>4.8</strong><span>Average satisfaction<br/><small>64 responses · 0 open complaints</small></span></div></article>
    </section>
  </div>;
}

function MidView() {
  const { data, setData, activeProject, showToast } = useOS();
  const record = data.mid[activeProject.id] ?? { cost: "", ibg: "", date: "" };
  const filled = [record.cost, record.ibg, record.date].filter(Boolean).length; const ready = 18 + filled;
  const update = (field: "cost" | "ibg" | "date", value: string) => setData((current) => ({ ...current, mid: { ...current.mid, [activeProject.id]: { ...(current.mid[activeProject.id] ?? { cost: "", ibg: "", date: "" }), [field]: value } } }));
  const copySheet = `${activeProject.ref} — MCS MID preflight\nCustomer: ${activeProject.customer}\nSite: ${activeProject.site}, ${activeProject.postcode}\nSystem: ${activeProject.system}\nCost inc VAT: £${record.cost}\nFinancial protection: ${record.ibg}\nCommissioned: ${record.date}`;
  const preparePack = () => { downloadText(`${activeProject.ref}-mid-preflight.txt`, copySheet, "text/plain"); showToast("Validated MID copy sheet downloaded."); };
  return <div className="module-page">
    <ModuleHeader eyebrow="MID PREFLIGHT" title="Enter once. Certify with confidence." description="Validate the installation record before an authorised installer completes registration in the MCS Installations Database." icon={FileCheck2} action="MID guidance" onAction={() => window.open(officialResources[2].href, "_blank", "noopener,noreferrer")} />
    <div className="mid-layout">
      <section className="workspace-card mid-form-card">
        <div className="table-toolbar"><div><span className="eyebrow">{activeProject.ref} · {activeProject.system}</span><h2>Certificate preflight</h2></div><span className={`readiness-chip ${ready===21?"ready":""}`}>{ready}/21 fields ready</span></div>
        <div className="big-progress"><span style={{ width: `${(ready/21)*100}%` }} /></div>
        <div className="form-section"><div className="form-section-title"><span>01</span><div><strong>Contract and customer</strong><small>Source: accepted proposal</small></div><CheckCircle2 size={18} /></div><div className="summary-grid"><span><small>Contract type</small><strong>Domestic</strong></span><span><small>Customer</small><strong>{activeProject.customer}</strong></span><span><small>Installation postcode</small><strong>{activeProject.postcode}</strong></span><span><small>Incentive</small><strong>None</strong></span></div></div>
        <div className="form-section"><div className="form-section-title"><span>02</span><div><strong>System and products</strong><small>Source: Product Guard and SiteProof</small></div><CheckCircle2 size={18} /></div><div className="summary-grid"><span><small>Technology</small><strong>{activeProject.system}</strong></span><span><small>Products</small><strong>{(data.products[activeProject.id] ?? []).length}</strong></span><span><small>Evidence items</small><strong>{(data.evidence[activeProject.id] ?? []).length}</strong></span><span><small>Technical Supervisor</small><strong>{activeProject.technicalSupervisor}</strong></span></div></div>
        <div className="form-section outstanding"><div className="form-section-title"><span>03</span><div><strong>Confirm final details</strong><small>{21 - ready} items need installer confirmation</small></div><CircleAlert size={18} /></div><div className="field-grid"><label><span>Overall installation cost, inc VAT</span><div><b>£</b><input type="number" min="0" step="0.01" value={record.cost} onChange={e=>update("cost", e.target.value)} placeholder="12850" /></div></label><label><span>Financial protection reference</span><input value={record.ibg} onChange={e=>update("ibg", e.target.value)} placeholder="e.g. FP-82394" /></label><label><span>Commissioning date</span><input type="date" value={record.date} onChange={e=>update("date", e.target.value)} /></label></div></div>
      </section>
      <aside className="mid-side">
        <article className="dark-card preflight-score"><span className="eyebrow">PREFLIGHT STATUS</span><ProgressRing value={Math.round((ready/21)*100)} /><h2>{ready===21 ? "Ready for authorised MID entry" : `${21-ready} confirmations remain`}</h2><p>Headroom checks completeness and consistency. Final submission remains with the authorised MCS installer in MID.</p><button disabled={ready<21} onClick={preparePack}><Download size={15} /> Prepare copy sheet</button></article>
        <article className="workspace-card copy-sheet"><div className="card-title"><div><span className="eyebrow">COPY SHEET</span><h2>Validated field groups</h2></div><button onClick={async()=>{ await navigator.clipboard.writeText(copySheet); showToast("MID copy sheet copied to clipboard."); }}><Copy size={14} /></button></div>{["Customer & contract","Products & serials","Performance estimate","TS declaration"].map((label,index)=><span key={label}><CheckCircle2 size={15}/><strong>{label}</strong><small>{index===1?`${(data.products[activeProject.id] ?? []).length} products`:"Complete"}</small></span>)}<a className="official-link" href={officialResources[2].href} target="_blank" rel="noreferrer">Open official MID guidance <ExternalLink size={13}/></a></article>
      </aside>
    </div>
  </div>;
}

function PassportView() {
  const { data, setData, activeProject, uploadFile, showToast } = useOS();
  const docs = data.passportDocuments[activeProject.id] ?? defaultDocs;
  const shared = Boolean(data.passportShared[activeProject.id]);
  const [shareBanner, setShareBanner] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null); const [pendingDocument, setPendingDocument] = useState(0);
  const readyCount = docs.filter((document) => document.status !== "Required" && !document.status.startsWith("Awaiting")).length;
  const chooseDocument = (index: number) => { const document = docs[index]; if (document.fileKey) window.open(`/api/files?key=${encodeURIComponent(document.fileKey)}`, "_blank"); else { setPendingDocument(index); fileInput.current?.click(); } };
  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const stored = await uploadFile(file, `passport/${activeProject.id}`); setData((current) => ({ ...current, passportDocuments: { ...current.passportDocuments, [activeProject.id]: (current.passportDocuments[activeProject.id] ?? defaultDocs).map((document,index) => index === pendingDocument ? { ...document, status: "Ready", fileName: stored.fileName, fileKey: stored.fileKey } : document) } })); event.target.value = ""; showToast(`${docs[pendingDocument].name} added to the customer passport.`); };
  const sharePassport = () => { setData((current) => ({ ...current, passportShared: { ...current.passportShared, [activeProject.id]: true } })); setShareBanner(true); const subject = encodeURIComponent(`${activeProject.site} — your Headroom energy passport`); const body = encodeURIComponent(`Hello ${activeProject.customer},\n\nYour installation handover record for ${activeProject.site} is ready to review.\n\nRegards,\nStratford Energy Solutions`); window.location.href = `mailto:${activeProject.customerEmail}?subject=${subject}&body=${body}`; showToast("Customer email prepared and share recorded."); };
  return <div className="module-page">
    <input ref={fileInput} className="visually-hidden" type="file" accept=".pdf,image/*,.doc,.docx" onChange={uploadDocument}/>
    <ModuleHeader eyebrow="CUSTOMER PASSPORT" title="A handover customers can actually use" description="One branded home for certificates, warranties, system guidance, maintenance and support." icon={ContactRound} action="Export passport" onAction={()=>downloadText(`${activeProject.ref}-customer-passport.json`, JSON.stringify({ project: activeProject, documents: docs }, null, 2))} />
    {shareBanner&&<div className="success-banner"><CheckCircle2 size={17}/><span><strong>Passport invitation prepared.</strong> {activeProject.customer} can receive the handover record by email.</span><button onClick={()=>setShareBanner(false)}><X size={15}/></button></div>}
    <section className="passport-layout">
      <article className="workspace-card passport-docs"><div className="table-toolbar"><div><span className="eyebrow">HANDOVER PACK</span><h2>{activeProject.site}</h2></div><span className={`readiness-chip ${readyCount===10?"ready":""}`}>{readyCount}/10 available</span></div><div className="document-list">{docs.map((document,index)=><button key={document.name} onClick={() => chooseDocument(index)}><span className={`doc-icon ${document.status === "Ready" || document.fileKey ? "green" : "gold"}`}><FileText size={17}/></span><span><strong>{document.name}</strong><small>{document.fileName ? `${document.status} · ${document.fileName}` : `${document.status} · select to upload`}</small></span>{document.status === "Ready" || document.fileKey ? <CheckCircle2 size={16}/>:<FileUp size={16}/>}</button>)}</div></article>
      <aside className="customer-preview">
        <div className="passport-device">
          <div className="passport-brand"><Brand/><span>HOME ENERGY PASSPORT</span></div>
          <div className="passport-cover"><span>YOUR SYSTEM</span><h2>Home-grown energy,<br/>documented for life.</h2><p>{activeProject.site} · {activeProject.place}</p><div className="system-summary"><span><strong>{activeProject.system.split("+")[0].trim()}</strong><small>Primary system</small></span><span><strong>{(data.products[activeProject.id] ?? []).length}</strong><small>Products</small></span><span><strong>{activeProject.date}</strong><small>Commissioned</small></span></div></div>
          <div className="passport-owner"><span className="avatar">{activeProject.customer.split(" ").map((part) => part[0]).join("").slice(0,2)}</span><span><strong>{activeProject.customer}</strong><small>Owner · {shared ? "Shared" : "Draft access"}</small></span><ChevronRight size={16}/></div>
          <div className="passport-links"><button onClick={() => chooseDocument(0)}><ShieldCheck size={16}/>Certificates <strong>{docs.filter((document) => document.name.includes("certificate") && document.status === "Ready").length}</strong></button><button onClick={() => chooseDocument(8)}><BookOpenCheck size={16}/>How to use it <ChevronRight size={15}/></button><button onClick={() => window.location.href = "mailto:support@stratfordenergysolutions.co.uk?subject=Customer%20passport%20support"}><Wrench size={16}/>Service & support <ChevronRight size={15}/></button></div>
        </div>
        <button className="share-passport" onClick={sharePassport}><Mail size={16}/>{shared?"Share again":"Share customer passport"}</button>
        <small className="preview-note">Draft access can be shared before the MCS certificate arrives.</small>
      </aside>
    </section>
  </div>;
}

function ProductsView() {
  const { data, activeProject, openDialog, showToast } = useOS();
  const [verifiedBanner, setVerifiedBanner] = useState(true);
  const rows = data.products[activeProject.id] ?? [];
  const verified = rows.some((product) => Boolean(product.serial));
  const exportProducts = () => { const csv = ["type,model,quantity,certification,status,serial", ...rows.map((product) => [product.type, product.model, product.quantity, product.certification, product.status, product.serial ?? ""].map((value) => `"${value.replaceAll('"','""')}"`).join(","))].join("\n"); downloadText(`${activeProject.ref}-product-evidence.csv`, csv, "text/csv"); showToast("Product evidence exported."); };
  return <div className="module-page">
    <ModuleHeader eyebrow="PRODUCT GUARD" title="Certified at quote, order and install" description="Freeze product status against the job and catch substitutions before they become certification problems." icon={PackageCheck} action="Capture serial" onAction={()=>openDialog("serial")} />
    <MetricStrip items={[{label:"SELECTED PRODUCTS",value:String(rows.length),note:"Locked to this installation"},{label:"CERTIFIED / VERIFIED",value:`${rows.filter((product) => ["Certified","Verified","Compatible"].includes(product.status)).length} / ${rows.length}`,note:"Installer record",tone:"green-text"},{label:"SUBSTITUTIONS",value:verified?"0":"1",note:verified?"None outstanding":"Serial confirmation due",tone:"gold-text"},{label:"SERIALS CAPTURED",value:String(rows.filter((product) => product.serial).length),note:"Installed equipment"}]} />
    {verified&&verifiedBanner&&<div className="success-banner"><CheckCircle2 size={17}/><span><strong>Installed kit verified.</strong> Product models and serials now match the locked job record.</span><button onClick={()=>setVerifiedBanner(false)}><X size={15}/></button></div>}
    <section className="workspace-card">
      <div className="table-toolbar"><div><span className="eyebrow">LOCKED PRODUCT SET</span><h2>{activeProject.site} · {activeProject.ref}</h2></div><div className="toolbar-actions"><button onClick={() => { window.open(officialResources[0].href, "_blank", "noopener,noreferrer"); showToast("Opening the official MCS Product Directory for current status checks."); }}><RefreshCw size={15}/> Recheck status</button><button onClick={exportProducts}><Download size={15}/> Export evidence</button></div></div>
      <div className="data-table product-table"><div className="data-row data-head"><span>Type</span><span>Make & model</span><span>Qty</span><span>Certification reference</span><span>Status</span></div>{rows.map((product)=><div className="data-row" key={`${product.type}-${product.model}`}><span><span className="product-type-icon"><PackageCheck size={15}/></span><strong>{product.type}</strong></span><span>{product.model}{product.serial && <small className="serial-note">Serial: {product.serial}</small>}</span><span>{product.quantity}</span><span>{product.certification}</span><span className={`data-status ${product.status === "Certified" || product.status === "Verified" ? "green" : "blue"}`}>{product.status}</span></div>)}</div>
    </section>
    <section className="product-bottom-grid">
      <article className="workspace-card substitution-card"><div className="card-title"><span className="icon-tile gold"><RefreshCw size={18}/></span><div><span className="eyebrow">SUBSTITUTION CONTROL</span><h2>Inverter serial confirmation</h2></div><span className={`mini-status ${verified?"green":"gold"}`}>{verified?"Approved":"Needs approval"}</span></div><div className="compare-products"><span><small>QUOTED</small><strong>{rows.find((product) => product.type === "Inverter")?.model ?? "No inverter selected"}</strong><em>Model locked</em></span><ArrowRight size={18}/><span><small>INSTALLED</small><strong>{rows.find((product) => product.type === "Inverter")?.model ?? "Capture product"}</strong><em>{rows.find((product) => product.type === "Inverter")?.serial ? `Serial ${rows.find((product) => product.type === "Inverter")?.serial}` : "Serial not yet captured"}</em></span></div><button className={`wide-action ${verified?"complete":""}`} onClick={()=>openDialog("serial")}>{verified?<CheckCircle2 size={15}/>:<Camera size={15}/>}{verified?"Update serial record":"Capture serial and approve"}</button></article>
      <article className="dark-card product-watch"><div className="signal-top"><span className="eyebrow">CERTIFICATION WATCH</span><BadgeCheck size={18}/></div><h2>Official verification remains one click away.</h2><p>Headroom preserves the locked evidence record and opens the live MCS directory for authoritative certification status.</p><a href={officialResources[0].href} target="_blank" rel="noreferrer"><i className="dot green"/> Open MCS Product Directory <ExternalLink size={13}/></a></article>
    </section>
  </div>;
}

function TerritoryView() {
  const { openDialog, showToast } = useOS();
  const [segment,setSegment] = useState("All technologies");
  const [postcode, setPostcode] = useState("SO21");
  const score = 72 + (postcode.replace(/\s/g, "").split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 25);
  const cells=[34,67,48,82,92,55,74,28,63,88,44,71,96,58,39,77,84,52,69,91,46,79,61,86];
  return <div className="module-page">
    <ModuleHeader eyebrow="TERRITORY INTELLIGENCE" title="Find demand before your competitors do" description="Prioritise postcodes using adoption, installer density, housing suitability and your own conversion data." icon={Map} action="Create campaign" onAction={() => openDialog("campaign")} />
    <MetricStrip items={[{label:"SELECTED OPPORTUNITY",value:postcode,note:`Score ${score} / 100`,tone:"gold-text"},{label:"UNTAPPED HOMES",value:(4200 + score * 46).toLocaleString("en-GB"),note:"Modelled addressable homes"},{label:"INSTALLER DENSITY",value:score>85?"Low":"Medium",note:"Check live MCS listing",tone:"green-text"},{label:"30-DAY PIPELINE",value:`£${Math.round(score*3.08)}k`,note:"Illustrative weighted value"}]} />
    <section className="territory-layout">
      <article className="territory-map-card">
        <div className="map-toolbar"><div><span className="eyebrow">OPPORTUNITY MAP</span><h2>Hampshire and West Sussex</h2></div><div className="segment-picker"><label className="postcode-field"><Search size={14}/><input value={postcode} onChange={(event) => setPostcode(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") showToast(`${postcode} opportunity score refreshed.`); }} aria-label="Analyse postcode"/></label><button onClick={()=>setSegment(segment==="All technologies"?"Solar + battery":"All technologies")}>{segment}<ChevronDown size={14}/></button><button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(postcode + " UK")}`, "_blank", "noopener,noreferrer")} aria-label="Open selected postcode in maps"><MapPin size={15}/></button></div></div>
        <div className="map-canvas"><div className="map-grid">{cells.map((value,index)=><button key={index} onClick={() => setPostcode(index===4?"SO21":index===12?"SO51":index===19?"PO13":`SO${20+index}`)} style={{"--heat":value/100} as React.CSSProperties} title={`Opportunity score ${value}`}>{[4,12,19].includes(index)&&<span>{index===4?"SO21":index===12?"SO51":"PO13"}</span>}</button>)}</div><div className="map-routes"><i/><i/><i/></div><div className="map-pin primary"><MapPin size={22}/><b>{postcode}</b><small>{score}</small></div><div className="map-pin secondary"><MapPin size={19}/><b>SO51</b><small>86</small></div><div className="map-legend"><span>Lower potential</span><i/><span>Higher potential</span></div></div>
      </article>
      <aside className="opportunity-list workspace-card"><div className="card-title"><div><span className="eyebrow">NEXT-BEST POSTCODES</span><h2>Ranked opportunities</h2></div><button onClick={()=>setSegment(segment==="All technologies"?"Solar + battery":"All technologies")} aria-label="Change opportunity segment"><Filter size={14}/></button></div>{[
        ["SO21","Winchester rural","92","8,420 homes","+18%"],
        ["SO51","Romsey","86","6,180 homes","+14%"],
        ["PO13","Lee-on-Solent","81","5,760 homes","+11%"],
        ["SP2","West Salisbury","78","4,950 homes","+9%"],
      ].map(([code,place,rankScore,homes,growth],index)=><button key={code} onClick={() => setPostcode(code)}><span className="rank">0{index+1}</span><span><strong>{code}</strong><small>{place}</small></span><span><strong>{rankScore}</strong><small>{homes}</small></span><em>{growth}</em><ChevronRight size={15}/></button>)}</aside>
    </section>
    <section className="two-column-grid">
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile gold"><TrendingUp size={18}/></span><div><span className="eyebrow">WHY SO21</span><h2>Opportunity signals</h2></div></div><div className="signal-bars">{[["Suitable housing",91],["Low-carbon adoption gap",84],["Low installer density",88],["Your conversion rate",76]].map(([label,value])=><div key={label as string}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><strong>{value}</strong></div>)}</div></article>
      <article className="workspace-card compact-card"><div className="card-title"><span className="icon-tile blue"><Users size={18}/></span><div><span className="eyebrow">COMPETITIVE LANDSCAPE</span><h2>Installer presence</h2></div></div><div className="competitor-stat"><strong>3</strong><span>illustrative installers within target radius<small>Verify against the live MCS listing</small></span></div><div className="stacked-actions"><a className="wide-action" href="https://mcscertified.com/find-an-installer/" target="_blank" rel="noreferrer"><ExternalLink size={15}/> Check MCS installers</a><a className="wide-action" href={officialResources[5].href} target="_blank" rel="noreferrer"><ChartNoAxesCombined size={15}/> Open MCS data dashboard</a></div></article>
    </section>
  </div>;
}

function AdminView() {
  const { data, setData, openDialog, recordAudit, showToast, storageMode } = useOS();
  const [auditQuery, setAuditQuery] = useState("");
  const [auditCategory, setAuditCategory] = useState("All activity");
  const activeUsers = data.adminUsers.filter((user) => user.status === "Active").length;
  const healthyIntegrations = data.integrations.filter((integration) => integration.status === "Connected").length;
  const visibleAudit = data.auditLog.filter((entry) => (auditCategory === "All activity" || entry.category === auditCategory) && `${entry.actor} ${entry.action} ${entry.detail}`.toLowerCase().includes(auditQuery.toLowerCase()));
  const roles: AdminUser["role"][] = ["Administrator", "Technical Supervisor", "Installer", "Auditor", "Office"];
  const toggleSetting = (key: "requireMfa" | "nightlyBackup" | "customerPortal" | "evidenceQualityGate", label: string) => {
    const next = !data.adminSettings[key]; setData((current) => ({ ...current, adminSettings: { ...current.adminSettings, [key]: next } })); recordAudit(`${label} ${next ? "enabled" : "disabled"}`, "Organisation policy changed", "Policy"); showToast(`${label} ${next ? "enabled" : "disabled"}.`);
  };
  const changeUser = (id: string, patch: Partial<AdminUser>, action: string) => {
    const user = data.adminUsers.find((item) => item.id === id); setData((current) => ({ ...current, adminUsers: current.adminUsers.map((item) => item.id === id ? { ...item, ...patch } : item) })); recordAudit(action, user?.name ?? "Workspace user", "Access"); showToast(`${user?.name ?? "User"} updated.`);
  };
  const saveOrganisation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const settings = { ...data.adminSettings, companyName: String(form.get("companyName") ?? ""), mcsNumber: String(form.get("mcsNumber") ?? ""), certificationBody: String(form.get("certificationBody") ?? ""), officePostcode: String(form.get("officePostcode") ?? "").toUpperCase(), retentionYears: String(form.get("retentionYears") ?? "7") };
    setData((current) => ({ ...current, adminSettings: settings })); recordAudit("Organisation settings updated", `${settings.companyName} · ${settings.mcsNumber}`, "Policy"); showToast("Organisation profile and retention policy saved.");
  };
  const exportAudit = () => {
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = ["timestamp,category,actor,action,detail", ...data.auditLog.map((entry) => [entry.at, entry.category, entry.actor, entry.action, entry.detail].map(quote).join(","))].join("\n"); downloadText("headroom-installer-os-audit-log.csv", csv, "text/csv"); recordAudit("Audit log exported", `${data.auditLog.length} entries`, "Data"); showToast("Audit history exported.");
  };
  return <div className="module-page admin-page">
    <ModuleHeader eyebrow="ADMINISTRATION" title="Control the entire installer workspace" description="Manage people, permissions, policies, automation, integrations, data and a complete operational audit trail." icon={Settings} action="Invite user" onAction={() => openDialog("admin-user")} />
    <MetricStrip items={[{label:"ACTIVE USERS",value:String(activeUsers),note:`${data.adminUsers.length} total accounts`,tone:"green-text"},{label:"AUTOMATIONS",value:String(data.workflowRules.filter((rule) => rule.enabled).length),note:`${data.workflowRules.length} configured rules`},{label:"INTEGRATIONS",value:`${healthyIntegrations}/${data.integrations.length}`,note:"Connections healthy",tone:"green-text"},{label:"AUDIT EVENTS",value:String(data.auditLog.length),note:"Latest 250 retained"}]} />

    <section className="admin-grid">
      <article className="workspace-card admin-users-card">
        <div className="table-toolbar"><div><span className="eyebrow">USERS & ACCESS</span><h2>Workspace team</h2></div><div className="toolbar-actions"><button onClick={() => { downloadText("headroom-users.csv", ["name,email,role,status,last_active", ...data.adminUsers.map((user) => [user.name,user.email,user.role,user.status,user.lastActive].join(","))].join("\n"), "text/csv"); showToast("User register exported."); }}><Download size={15}/>Export</button><button onClick={() => openDialog("admin-user")}><Plus size={15}/>Invite user</button></div></div>
        <div className="admin-user-list"><div className="admin-user-row admin-user-head"><span>User</span><span>Role</span><span>Status</span><span>Last active</span><span>Controls</span></div>{data.adminUsers.map((user) => <div className="admin-user-row" key={user.id}><span className="admin-person"><i className="avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0,2)}</i><span><strong>{user.name}</strong><small>{user.email}</small></span></span><span><select value={user.role} onChange={(event) => changeUser(user.id, { role: event.target.value as AdminUser["role"] }, `Role changed to ${event.target.value}`)} aria-label={`Role for ${user.name}`}>{roles.map((role) => <option key={role}>{role}</option>)}</select></span><span><i className={`admin-state ${user.status.toLowerCase()}`}>{user.status}</i></span><span>{user.lastActive}</span><span className="admin-row-actions">{user.status === "Invited" && <button onClick={() => { window.location.href = `mailto:${user.email}?subject=${encodeURIComponent("Headroom Installer OS invitation")}`; recordAudit("Invitation resent", user.name, "Access"); }} aria-label={`Resend invitation to ${user.name}`}><Mail size={14}/></button>}<button onClick={() => changeUser(user.id, { status: user.status === "Suspended" ? "Active" : "Suspended", lastActive: user.status === "Suspended" ? "Reactivated now" : user.lastActive }, user.status === "Suspended" ? "User reactivated" : "User suspended")} aria-label={user.status === "Suspended" ? `Reactivate ${user.name}` : `Suspend ${user.name}`}><ShieldCheck size={14}/></button></span></div>)}</div>
      </article>

      <aside className="workspace-card admin-policy-card">
        <div className="table-toolbar"><div><span className="eyebrow">SECURITY & GOVERNANCE</span><h2>Workspace policies</h2></div><span className={`sync-chip ${storageMode}`}>{storageMode === "cloud" ? "CLOUD" : "LOCAL"}</span></div>
        <div className="policy-list">{[
          ["requireMfa","Require secure sign-in","Apply the hosted identity gate to workspace access"],
          ["nightlyBackup","Nightly workspace backup","Maintain a recoverable administration snapshot"],
          ["customerPortal","Customer passport sharing","Allow project teams to prepare customer access"],
          ["evidenceQualityGate","Evidence quality gate","Block TS review until required evidence is present"],
        ].map(([key,label,detail]) => { const enabled = data.adminSettings[key as keyof AdminSettings] as boolean; return <button key={key} className="policy-row" onClick={() => toggleSetting(key as "requireMfa" | "nightlyBackup" | "customerPortal" | "evidenceQualityGate", label)} role="switch" aria-checked={enabled}><span><strong>{label}</strong><small>{detail}</small></span><i className={enabled ? "on" : ""}><b/></i></button>; })}</div>
      </aside>
    </section>

    <section className="admin-grid balanced">
      <article className="workspace-card">
        <div className="table-toolbar"><div><span className="eyebrow">WORKFLOW AUTOMATION</span><h2>Rules and controls</h2></div><button className="quiet-button" onClick={() => openDialog("workflow")}><Plus size={15}/>New rule</button></div>
        <div className="workflow-list">{data.workflowRules.map((rule) => <div key={rule.id}><button className={`rule-toggle ${rule.enabled ? "on" : ""}`} onClick={() => { setData((current) => ({ ...current, workflowRules: current.workflowRules.map((item) => item.id === rule.id ? { ...item, enabled: !item.enabled } : item) })); recordAudit(`Automation ${rule.enabled ? "paused" : "enabled"}`, rule.name, "Workflow"); }} role="switch" aria-checked={rule.enabled}><i/></button><span><strong>{rule.name}</strong><small><b>When</b> {rule.trigger}</small><small><b>Then</b> {rule.action}</small></span><em>{rule.enabled ? "Active" : "Paused"}</em></div>)}</div>
      </article>
      <article className="workspace-card">
        <div className="table-toolbar"><div><span className="eyebrow">INTEGRATIONS</span><h2>Connection health</h2></div><button className="quiet-button" onClick={() => openDialog("integration")}><Plus size={15}/>Add</button></div>
        <div className="integration-list">{data.integrations.map((integration) => <div key={integration.id}><span className={`integration-icon ${integration.status.toLowerCase()}`}><ExternalLink size={16}/></span><span><strong>{integration.name}</strong><small>{integration.category} · {integration.detail}</small></span><span><i className={`dot ${integration.status === "Connected" ? "green" : integration.status === "Attention" ? "gold" : "blue"}`}/>{integration.status}<small>{integration.lastSync}</small></span><button onClick={() => { const next = integration.status === "Paused" ? "Connected" : "Paused"; setData((current) => ({ ...current, integrations: current.integrations.map((item) => item.id === integration.id ? { ...item, status: next, lastSync: next === "Connected" ? "Tested just now" : item.lastSync } : item) })); recordAudit(`Integration ${next === "Connected" ? "tested and connected" : "paused"}`, integration.name, "Integration"); showToast(`${integration.name} ${next === "Connected" ? "connection verified" : "paused"}.`); }} aria-label={`${integration.status === "Paused" ? "Connect" : "Pause"} ${integration.name}`}><RefreshCw size={14}/></button></div>)}</div>
      </article>
    </section>

    <section className="admin-grid balanced">
      <article className="workspace-card organisation-card">
        <div className="table-toolbar"><div><span className="eyebrow">ORGANISATION</span><h2>Installer account details</h2></div></div>
        <form className="admin-form" onSubmit={saveOrganisation}><label>Trading name<input name="companyName" defaultValue={data.adminSettings.companyName} required/></label><label>MCS installer number<input name="mcsNumber" defaultValue={data.adminSettings.mcsNumber} required/></label><label>Certification route<input name="certificationBody" defaultValue={data.adminSettings.certificationBody} required/></label><div className="admin-form-pair"><label>Office postcode<input name="officePostcode" defaultValue={data.adminSettings.officePostcode} required/></label><label>Record retention<select name="retentionYears" defaultValue={data.adminSettings.retentionYears}><option value="3">3 years</option><option value="5">5 years</option><option value="7">7 years</option><option value="10">10 years</option></select></label></div><button><Save size={15}/>Save organisation settings</button></form>
        <div className="data-actions"><button onClick={() => { downloadText("headroom-installer-os-backup.json", JSON.stringify(data, null, 2)); recordAudit("Workspace backup downloaded", "Complete organisation data", "Data"); showToast("Complete workspace backup downloaded."); }}><Download size={15}/><span><strong>Export complete workspace</strong><small>Projects, settings and administration records</small></span></button><button onClick={() => { recordAudit("Backup verification completed", `${data.projects.length} projects · ${data.adminUsers.length} users`, "Data"); showToast("Backup verification completed successfully."); }}><CheckCircle2 size={15}/><span><strong>Run data health check</strong><small>Validate core workspace records</small></span></button></div>
      </article>
      <article className="workspace-card audit-card">
        <div className="table-toolbar"><div><span className="eyebrow">AUDIT HISTORY</span><h2>Administrative activity</h2></div><button className="quiet-button" onClick={exportAudit}><Download size={15}/>Export log</button></div>
        <div className="audit-filters"><label><Search size={14}/><input value={auditQuery} onChange={(event) => setAuditQuery(event.target.value)} placeholder="Search activity"/></label><select value={auditCategory} onChange={(event) => setAuditCategory(event.target.value)}><option>All activity</option>{Array.from(new Set(data.auditLog.map((entry) => entry.category))).map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="audit-list">{visibleAudit.slice(0,8).map((entry) => <div key={entry.id}><span className="audit-dot"/><span><strong>{entry.action}</strong><small>{entry.detail}</small></span><span><strong>{entry.actor}</strong><small>{new Date(entry.at).toLocaleString("en-GB", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })} · {entry.category}</small></span></div>)}{visibleAudit.length === 0 && <div className="empty-state"><Search size={20}/><strong>No matching activity</strong><span>Change the search or category filter.</span></div>}</div>
      </article>
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
  if (view === "admin") return <AdminView/>;
  return <Overview onOpen={onOpen}/>;
}

function InstallerApp() {
  const { data, setData, storageMode, openDialog, showToast } = useOS();
  const [active, setActive] = useState<View>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const openView = (view: View) => { setActive(view); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);
  const runSearch = () => { const match = data.projects.find((project) => `${project.ref} ${project.site} ${project.place} ${project.postcode}`.toLowerCase().includes(globalSearch.toLowerCase())); if (match) { setData((current) => ({ ...current, activeProjectId: match.id })); openView("siteproof"); showToast(`${match.ref} selected.`); } else { openView("sites"); showToast("No exact project match — showing the full pipeline."); } };
  const currentAdmin = data.adminUsers.find((user) => user.role === "Administrator") ?? data.adminUsers[0];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top"><Brand /><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
        <div className="workspace-label"><span>WORKSPACE</span><strong>{data.adminSettings.companyName}</strong></div>
        <nav className="sidebar-nav" aria-label="Product navigation">
          {navItems.map((item) => { const Icon = item.icon; return (
            <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => openView(item.id)}>
              <Icon size={18} /><span>{item.label}</span>{item.id === "siteproof" && <em>4</em>}{item.id === "products" && <i />}
            </button>
          ); })}
        </nav>
        <div className="sidebar-footer">
          <div className="scheme-card"><div><ShieldCheck size={17} /><span>MCS Scheme</span></div><strong>{data.adminSettings.mcsNumber}</strong><small>Audit readiness 92%</small><div className="thin-progress"><span style={{ width: "92%" }} /></div></div>
          <button className="settings-button" onClick={() => openView("admin")}><Settings size={17} /> Administration centre</button>
          <div className="user-row"><span className="avatar">{currentAdmin?.name.split(" ").map((part) => part[0]).join("").slice(0,2) ?? "KD"}</span><span><strong>{currentAdmin?.name ?? "Kevin Doyle"}</strong><small>{currentAdmin?.role ?? "Administrator"}</small></span><CircleUserRound size={18} /></div>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div><span className="breadcrumb">INSTALLER OS /</span><strong>{navItems.find((item) => item.id === active)?.label}</strong></div></div>
          <div className="topbar-actions">
            <label className="quick-search"><Search size={16} /><input ref={searchRef} value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") runSearch(); }} aria-label="Search projects" placeholder="Search projects" /><kbd>⌘ K</kbd></label>
            <span className={`sync-chip ${storageMode}`} title={storageMode === "cloud" ? "Workspace saved" : "Device fallback"}>{storageMode === "cloud" ? "SAVED" : storageMode === "local" ? "LOCAL" : "SYNC"}</span>
            <button className="icon-button" aria-label="Notifications" onClick={() => openDialog("notifications")}><Bell size={18} />{data.notifications.some((item) => !item.read) && <i />}</button>
            <button className="icon-button help-button" aria-label="Official installer resources" onClick={() => openDialog("settings")}><HelpCircle size={18}/></button>
            <button className="primary-button" onClick={() => openDialog("new-project")}><ClipboardCheck size={17} /> New installation</button>
          </div>
        </header>
        <div className="content-wrap"><WorkspaceView view={active} onOpen={openView} /></div>
      </section>
    </main>
  );
}

export default function Home() {
  return <InstallerProvider><InstallerApp/></InstallerProvider>;
}
