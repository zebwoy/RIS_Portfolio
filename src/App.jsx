import { useState, useEffect, useRef, useCallback } from "react";

// ─── FALLBACK DATA (shown while loading / if DB unreachable) ─────────────────
const FALLBACK_DATA = {
  personal: {
    name: "Riyaz Ibrahim Shaikh",
    title: "Senior Civil Engineer & Project Coordinator",
    tagline: "15+ Years of Engineering Excellence Across the Gulf",
    phone1: "+91 7499145184", phone2: "+91 8779185464",
    email: "riyazibrahim2008@gmail.com", skype: "riyazibrahim2008@gmail.com",
    passport: "V2795500 (Valid until Aug 2031)", aramcoId: "8012199",
    licenseNo: "T.P./SUP-II/567", nationality: "Indian", dob: "19 June 1967",
    photoUrl: "", bio: "Loading…",
  },
  stats: [], experience: [], projects: [], education: [],
  courses: [], gallery: [], standards: [],
};

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const API = {
  /** Fetch entire portfolio from DB */
  async load() {
    const res = await fetch("/api/portfolio");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /** Verify admin password */
  async auth(password) {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return res.json();                // { ok: bool }
  },

  /** Authenticated mutation */
  async update(table, action, id, data, adminPw) {
    const res = await fetch("/api/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPw,
      },
      body: JSON.stringify({ table, action, id, data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, style = {}, className = "" }) => {
  const icons = {
    edit:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>,
    plus:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    phone:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.18 6.18l1.93-1.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    mail:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>,
    passport:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>,
    image:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
    upload:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    lock:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    unlock:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    close:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    award:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    building:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>,
    check:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>,
    menu:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    spinner: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:"spin 1s linear infinite",...style}}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/></svg>,
  };
  return <span style={{ display:"inline-flex", alignItems:"center", ...style }} className={className}>{icons[name]}</span>;
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      background: type==="error" ? "#c0392b" : "#1a6632",
      color:"#fff", padding:"10px 20px", borderRadius:8, zIndex:999,
      fontSize:"0.88rem", fontWeight:600, boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
      pointerEvents:"none",
    }}>{msg}</div>
  );
};

// ─── EDITABLE FIELD ──────────────────────────────────────────────────────────
const EditableField = ({ value, onSave, multiline = false, className = "", editMode, saving = false }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { if (!editing) setVal(value); }, [value, editing]);

  if (!editMode) return <span className={className}>{value}</span>;

  if (editing) {
    const inputStyle = { background:"#0a1628", border:"1.5px solid #c9a84c", color:"#fff", borderRadius:6, padding:"6px 10px", width:"100%", fontFamily:"inherit", fontSize:"inherit" };
    return (
      <span style={{ display:"block", width:"100%" }}>
        {multiline
          ? <textarea value={val} onChange={e=>setVal(e.target.value)} style={{...inputStyle, minHeight:80, resize:"vertical"}} autoFocus />
          : <input value={val} onChange={e=>setVal(e.target.value)} style={inputStyle} autoFocus onKeyDown={e=>e.key==="Enter"&&(onSave(val),setEditing(false))} />
        }
        <span style={{ display:"flex", gap:8, marginTop:6 }}>
          <button onClick={()=>{onSave(val);setEditing(false);}} style={{background:"#c9a84c",color:"#0a1628",border:"none",borderRadius:6,padding:"4px 12px",fontWeight:700,cursor:"pointer",fontSize:"0.8rem"}}>
            {saving ? "…" : "Save"}
          </button>
          <button onClick={()=>{setVal(value);setEditing(false);}} style={{background:"#1e3a5f",color:"#c9a84c",border:"none",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:"0.8rem"}}>
            Cancel
          </button>
        </span>
      </span>
    );
  }
  return (
    <span className={`group ${className}`} style={{cursor:"pointer",position:"relative"}} onClick={()=>{setVal(value);setEditing(true);}}>
      {value}
      <span style={{marginLeft:6,color:"#c9a84c",fontSize:12,opacity:0.7}}>✎</span>
    </span>
  );
};

// ─── IMAGE UPLOADER ──────────────────────────────────────────────────────────
const ImageUploader = ({ imageUrl, onUpload, editMode, style = {}, placeholder="Upload Image" }) => {
  const ref = useRef();
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpload(ev.target.result);
    reader.readAsDataURL(file);
  };
  const base = { width:"100%", height:180, objectFit:"cover", display:"block", ...style };
  if (imageUrl) return (
    <div style={{ position:"relative", ...base, overflow:"hidden" }}>
      <img src={imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      {editMode && (
        <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",opacity:0,transition:"opacity .2s",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}
          onClick={()=>ref.current.click()}>
          <Icon name="upload" size={28} style={{color:"#c9a84c"}} />
          <input type="file" accept="image/*" ref={ref} onChange={handleFile} style={{display:"none"}} />
        </div>
      )}
    </div>
  );
  return (
    <div style={{ ...base, display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      border:`2px dashed ${editMode?"#c9a84c":"#1e3a5f"}`, background:"#0d1f3c", cursor: editMode?"pointer":"default" }}
      onClick={()=>editMode&&ref.current.click()}>
      <Icon name="image" size={32} style={{color: editMode?"#c9a84c":"#2a4a6a", marginBottom:8}} />
      {editMode && <span style={{color:"#c9a84c",fontSize:"0.78rem",fontWeight:700}}>{placeholder}</span>}
      {!editMode && <span style={{color:"#2a4a6a",fontSize:"0.78rem"}}>No image</span>}
      <input type="file" accept="image/*" ref={ref} onChange={handleFile} style={{display:"none"}} />
    </div>
  );
};

// ─── MODAL ───────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#0d1f3c",border:"1.5px solid #c9a84c",borderRadius:12,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",padding:28,position:"relative"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"Georgia,serif",color:"#c9a84c",fontSize:"1.1rem",fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer"}}><Icon name="close" size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
const Field = ({ label, name, form, setForm, textarea=false }) => (
  <div style={{marginBottom:14}}>
    <label style={{color:"#c9a84c",fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>{label}</label>
    {textarea
      ? <textarea rows={3} value={form[name]||""} onChange={e=>setForm(p=>({...p,[name]:e.target.value}))}
          style={{background:"#0a1628",border:"1.5px solid #1e3a5f",color:"#fff",padding:"8px 12px",borderRadius:8,width:"100%",fontSize:"0.9rem",fontFamily:"inherit",resize:"vertical"}} />
      : <input type="text" value={form[name]||""} onChange={e=>setForm(p=>({...p,[name]:e.target.value}))}
          style={{background:"#0a1628",border:"1.5px solid #1e3a5f",color:"#fff",padding:"8px 12px",borderRadius:8,width:"100%",fontSize:"0.9rem",fontFamily:"inherit"}} />
    }
  </div>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const G="#c9a84c", N="#0a1628", NM="#0d1f3c", NL="#1e3a5f";
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:${N};color:#e8e8e8;font-family:'Lato',sans-serif;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 ${G}60}50%{box-shadow:0 0 0 10px transparent}}
  .fade-up{animation:fadeUp .7s ease forwards;}
  .section-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:900;color:#fff;}
  .section-title span{color:${G};}
  .gold-line{width:56px;height:3px;background:linear-gradient(90deg,${G},transparent);margin:10px 0 36px;}
  .card{background:${NM};border:1px solid ${NL};border-radius:12px;transition:border-color .3s,transform .25s;}
  .card:hover{border-color:${G}44;transform:translateY(-3px);}
  .btn-gold{background:${G};color:${N};font-weight:700;padding:11px 26px;border-radius:7px;border:none;cursor:pointer;font-family:'Lato',sans-serif;font-size:.9rem;letter-spacing:.5px;transition:opacity .2s;}
  .btn-gold:hover{opacity:.86;}
  .btn-gold:disabled{opacity:.45;cursor:not-allowed;}
  .btn-outline{background:transparent;color:${G};border:1.5px solid ${G};font-weight:700;padding:9px 22px;border-radius:7px;cursor:pointer;font-family:'Lato',sans-serif;font-size:.9rem;transition:background .2s;}
  .btn-outline:hover{background:${G}20;}
  .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;letter-spacing:.5px;background:${G}18;color:${G};border:1px solid ${G}30;margin:2px;}
  .nav-link{color:#8fa8c4;font-weight:500;cursor:pointer;transition:color .2s;font-size:.88rem;letter-spacing:.4px;}
  .nav-link:hover,.nav-link.active{color:${G};}
  .hero-bg{background:linear-gradient(135deg,${N} 0%,#0d2240 50%,${N} 100%);position:relative;overflow:hidden;}
  .hero-bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,${G}14 0%,transparent 65%);pointer-events:none;}
  .hero-grid{position:absolute;inset:0;background-image:linear-gradient(${NL}40 1px,transparent 1px),linear-gradient(90deg,${NL}40 1px,transparent 1px);background-size:60px 60px;pointer-events:none;opacity:.35;}
  .stat-num{font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;color:${G};line-height:1;}
  .cert-card{border-left:3px solid ${G};padding-left:16px;}
  .gallery-item{cursor:pointer;overflow:hidden;border-radius:10px;aspect-ratio:4/3;}
  .gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
  .gallery-item:hover img{transform:scale(1.06);}
  input[type=text],input[type=email],input[type=password],textarea,select{background:${NM};border:1.5px solid ${NL};color:#fff;padding:9px 13px;border-radius:8px;font-family:'Lato',sans-serif;font-size:.9rem;width:100%;outline:none;}
  input:focus,textarea:focus,select:focus{border-color:${G};}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:${N};}::-webkit-scrollbar-thumb{background:${NL};border-radius:3px;}
  @media(max-width:768px){.hide-mobile{display:none!important}.show-mobile{display:block!important}.grid-2col{grid-template-columns:1fr!important}.grid-contact{grid-template-columns:1fr!important}}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [data, setData]             = useState(FALLBACK_DATA);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [adminPw, setAdminPw]       = useState("");        // stored in memory only
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState({ msg:"", type:"" });
  const [passwordModal, setPasswordModal] = useState(false);
  const [pwInput, setPwInput]       = useState("");
  const [pwError, setPwError]       = useState(false);
  const [pwLoading, setPwLoading]   = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [addModal, setAddModal]     = useState(null);
  const [addForm, setAddForm]       = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [lightbox, setLightbox]     = useState(null);

  // ── Toast helper ──────────────────────────────────────────────
  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3000);
  }, []);

  // ── Load data from API ────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const d = await API.load();
      // Merge with FALLBACK_DATA so missing keys never break the UI
      setData({ ...FALLBACK_DATA, ...d });
    } catch (err) {
      // Running locally without Netlify Functions? Use fallback data — that's fine.
      console.warn("API unavailable — using built-in data:", err.message);
      setData(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Scroll spy ────────────────────────────────────────────────
  useEffect(() => {
    const sections = ["home","about","experience","projects","education","gallery","contact"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.4 });
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // ── Admin login ───────────────────────────────────────────────
  const handleLogin = async () => {
    if (!pwInput) return;
    setPwLoading(true); setPwError(false);
    try {
      const res = await API.auth(pwInput);
      if (res.ok) {
        setAdminPw(pwInput);                    // keep pw in memory for mutations
        setEditMode(true);
        setPasswordModal(false);
        setPwInput("");
        showToast("Edit mode enabled");
      } else {
        setPwError(true);
      }
    } catch {
      setPwError(true);
      showToast("Network error – could not verify password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    setEditMode(false);
    setAdminPw("");
    showToast("Edit mode disabled");
  };

  // ── Generic mutation helper ───────────────────────────────────
  const mutate = useCallback(async (table, action, id, data, onSuccess) => {
    setSaving(true);
    try {
      await API.update(table, action, id, data, adminPw);
      await loadData();           // re-fetch from DB to stay in sync
      if (onSuccess) onSuccess();
      showToast(action === "delete" ? "Deleted" : "Saved");
    } catch (err) {
      console.error("Mutation error:", err);
      showToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  }, [adminPw, loadData, showToast]);

  // ── Personal field save ───────────────────────────────────────
  const savePersonal = useCallback((key) => async (value) => {
    await mutate("personal_info", "upsert", null, { [key]: value });
  }, [mutate]);

  // ── Array item field save ─────────────────────────────────────
  const saveField = useCallback((table, id, field, normFn) => async (value) => {
    // Build the update payload from current data + one changed field
    const current = data[table]?.find(x => x.id === id) || {};
    const payload  = normFn ? normFn({ ...current, [field]: value }) : { ...current, [field]: value };
    await mutate(table, "update", id, payload);
  }, [data, mutate]);

  // ── Delete ────────────────────────────────────────────────────
  const deleteItem = useCallback((table, id, extra) => {
    if (!window.confirm("Delete this item?")) return;
    mutate(table, "delete", id, extra);
  }, [mutate]);

  // ── Add item ──────────────────────────────────────────────────
  const addItem = useCallback(async (table, formData) => {
    setAddLoading(true);
    try {
      await API.update(table, "insert", null, formData, adminPw);
      await loadData();
      setAddModal(null);
      showToast("Added successfully");
    } catch (err) {
      showToast(`Add failed: ${err.message}`, "error");
    } finally {
      setAddLoading(false);
    }
  }, [adminPw, loadData, showToast]);

  // ── Scroll nav ────────────────────────────────────────────────
  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    setMobileMenu(false);
  };

  const navItems = [
    {id:"home",label:"Home"},{id:"about",label:"About"},
    {id:"experience",label:"Experience"},{id:"projects",label:"Projects"},
    {id:"education",label:"Education"},{id:"gallery",label:"Gallery"},
    {id:"contact",label:"Contact"},
  ];

  // ── Loading screen ────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,background:N}}>
        <Icon name="spinner" size={40} style={{color:G}} />
        <span style={{color:"#8fa8c4",fontSize:"0.95rem",letterSpacing:1}}>Loading portfolio…</span>
      </div>
    </>
  );

  const p = data.personal || {};

  return (
    <>
      <style>{globalStyles}</style>
      <Toast msg={toast.msg} type={toast.type} />

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:99,background:`${N}f2`,backdropFilter:"blur(14px)",borderBottom:`1px solid ${NL}`}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:"1.05rem",fontWeight:700,color:G,cursor:"pointer"}} onClick={()=>scrollTo("home")}>
            RIS <span style={{color:"#8fa8c4",fontWeight:300,fontSize:"0.82rem"}}>Civil Engineer</span>
          </div>
          <div className="hide-mobile" style={{display:"flex",gap:28,alignItems:"center"}}>
            {navItems.map(n=>(
              <span key={n.id} className={`nav-link${activeSection===n.id?" active":""}`} onClick={()=>scrollTo(n.id)}>{n.label}</span>
            ))}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button className="btn-gold" style={{padding:"7px 16px",fontSize:"0.82rem"}} onClick={()=>scrollTo("contact")}>Hire Me</button>
            <button className="show-mobile" style={{background:"none",border:"none",cursor:"pointer",color:G,display:"none"}} onClick={()=>setMobileMenu(!mobileMenu)}>
              <Icon name="menu" size={22}/>
            </button>
          </div>
        </div>
        {mobileMenu&&(
          <div style={{background:NM,borderTop:`1px solid ${NL}`,padding:"12px 24px"}}>
            {navItems.map(n=>(
              <div key={n.id} className="nav-link" style={{padding:"10px 0",borderBottom:`1px solid ${NL}30`}} onClick={()=>scrollTo(n.id)}>{n.label}</div>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section id="home" className="hero-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",paddingTop:64}}>
        <div className="hero-grid"/>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 24px",width:"100%"}}>
          <div className="fade-up" style={{maxWidth:760}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:36,height:2,background:G}}/>
              <span style={{color:G,fontSize:"0.78rem",letterSpacing:3,textTransform:"uppercase",fontWeight:700}}>Civil & Structural Engineer</span>
            </div>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:"clamp(2.2rem,6vw,4.8rem)",fontWeight:900,color:"#fff",lineHeight:1.05,marginBottom:8}}>
              <EditableField value={p.name||""} onSave={savePersonal("name")} editMode={editMode} saving={saving}/>
            </h1>
            <h2 style={{fontSize:"clamp(1rem,2.5vw,1.45rem)",color:G,fontWeight:300,marginBottom:22,letterSpacing:.5}}>
              <EditableField value={p.title||""} onSave={savePersonal("title")} editMode={editMode} saving={saving}/>
            </h2>
            <p style={{color:"#8fa8c4",fontSize:"1rem",maxWidth:540,lineHeight:1.75,marginBottom:34}}>
              <EditableField value={p.tagline||""} onSave={savePersonal("tagline")} editMode={editMode} saving={saving}/>
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:54}}>
              <button className="btn-gold" onClick={()=>scrollTo("projects")}>View Projects</button>
              <button className="btn-outline" onClick={()=>scrollTo("contact")}>Get In Touch</button>
            </div>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:2}}>
              {(data.stats||[]).map((s,i)=>(
                <div key={s.id||i} style={{padding:"18px 0",borderRight:i<(data.stats.length-1)?`1px solid ${NL}`:"none"}}>
                  <div className="stat-num">
                    <EditableField value={s.value} onSave={v=>mutate("stats","update",s.id,{...s,value:v})} editMode={editMode} saving={saving}/>
                  </div>
                  <div style={{color:"#8fa8c4",fontSize:"0.75rem",letterSpacing:1,textTransform:"uppercase",marginTop:4}}>
                    <EditableField value={s.label} onSave={v=>mutate("stats","update",s.id,{...s,label:v})} editMode={editMode} saving={saving}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* PMP Badge */}
          <div className="hide-mobile" style={{position:"absolute",right:"8%",top:"38%",display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.65}}>
            <div style={{width:80,height:80,borderRadius:"50%",border:`2px solid ${G}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:G,fontSize:"1.4rem",fontFamily:"Playfair Display,serif",fontWeight:900}}>PMP</span>
            </div>
            <span style={{color:G,fontSize:"0.62rem",letterSpacing:2,textTransform:"uppercase"}}>Certified</span>
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────── */}
      <section id="about" style={{background:NM,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:60,alignItems:"start"}}>
            <div>
              <h2 className="section-title">About <span>Me</span></h2>
              <div className="gold-line"/>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {[
                  {icon:"phone",  label:"Phone",    val:`${p.phone1||""} / ${p.phone2||""}`},
                  {icon:"mail",   label:"Email",     val:p.email||""},
                  {icon:"passport",label:"Passport", val:p.passport||""},
                ].map(item=>(
                  <div key={item.label} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,background:`${G}18`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name={item.icon} size={16} style={{color:G}}/>
                    </div>
                    <div>
                      <div style={{color:"#8fa8c4",fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:1}}>{item.label}</div>
                      <div style={{color:"#e8e8e8",fontSize:"0.9rem",marginTop:2}}>{item.val}</div>
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",gap:10}}>
                  {[{label:"Aramco ID",val:p.aramcoId},{label:"License",val:p.licenseNo}].map(x=>(
                    <div key={x.label} style={{flex:1,padding:"10px 14px",background:`${G}12`,border:`1px solid ${G}30`,borderRadius:8,textAlign:"center"}}>
                      <div style={{color:G,fontSize:"0.7rem",letterSpacing:1,textTransform:"uppercase"}}>{x.label}</div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:"0.82rem",marginTop:2}}>{x.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 14px",background:`${G}12`,border:`1px solid ${G}30`,borderRadius:8,textAlign:"center"}}>
                  <div style={{color:G,fontSize:"0.7rem",letterSpacing:1,textTransform:"uppercase"}}>BNCMC Registered Valuer</div>
                </div>
              </div>
            </div>
            <div>
              <p style={{color:"#b0c4d8",lineHeight:1.85,fontSize:"1rem",marginBottom:32}}>
                <EditableField value={p.bio||""} onSave={savePersonal("bio")} editMode={editMode} multiline saving={saving}/>
              </p>
              <div style={{marginBottom:24}}>
                <h4 style={{color:G,fontSize:"0.75rem",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Codes & Standards</h4>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {(data.standards||[]).map((s,i)=>(
                    <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>
                      <span className="tag">{s}</span>
                      {editMode&&<button onClick={()=>deleteItem("standards",null,{name:s})} style={{background:"none",border:"none",cursor:"pointer",color:"#e55",fontSize:14,padding:0}}>×</button>}
                    </span>
                  ))}
                  {editMode&&(
                    <button className="btn-outline" style={{padding:"3px 10px",fontSize:"0.7rem"}}
                      onClick={()=>{const v=prompt("Add standard:");if(v?.trim())addItem("standards",{name:v.trim()});}}>+ Add</button>
                  )}
                </div>
              </div>
              <h4 style={{color:G,fontSize:"0.75rem",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Software Proficiency</h4>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["AutoCAD","Revit BIM","STAAD Pro","ETABS","Primavera P6","MicroStation","MS Office"].map(s=>(
                  <span key={s} className="tag" style={{background:NL,borderColor:NL,color:"#b0c4d8"}}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ─────────────────────────────────────────── */}
      <section id="experience" style={{background:N,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <h2 className="section-title">Work <span>Experience</span></h2>
          <div className="gold-line"/>
          <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {(data.experience||[]).map(exp=>(
              <div key={exp.id} className="card" style={{padding:24,position:"relative"}}>
                {editMode&&(
                  <button onClick={()=>deleteItem("experience",exp.id)} style={{position:"absolute",top:12,right:12,background:"#e5555520",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#e55"}}>
                    <Icon name="trash" size={14}/>
                  </button>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                  <span style={{color:G,fontSize:"0.75rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>
                    <EditableField value={exp.year||""} onSave={saveField("experience",exp.id,"year")} editMode={editMode} saving={saving}/>
                  </span>
                  <span style={{color:"#4a7fa5",fontSize:"0.75rem",textAlign:"right"}}>
                    <EditableField value={exp.location||""} onSave={saveField("experience",exp.id,"location")} editMode={editMode} saving={saving}/>
                  </span>
                </div>
                <h3 style={{fontFamily:"Playfair Display,serif",fontSize:"1.1rem",color:"#fff",fontWeight:700,marginBottom:2}}>
                  <EditableField value={exp.role||""} onSave={saveField("experience",exp.id,"role")} editMode={editMode} saving={saving}/>
                </h3>
                <div style={{color:G,fontSize:"0.86rem",fontWeight:600,marginBottom:10}}>
                  <EditableField value={exp.company||""} onSave={saveField("experience",exp.id,"company")} editMode={editMode} saving={saving}/>
                </div>
                <p style={{color:"#8fa8c4",fontSize:"0.85rem",lineHeight:1.65}}>
                  <EditableField value={exp.desc||exp.description||""} onSave={saveField("experience",exp.id,"desc")} editMode={editMode} multiline saving={saving}/>
                </p>
              </div>
            ))}
            {editMode&&(
              <div className="card" style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`2px dashed ${G}44`,minHeight:140}}
                onClick={()=>{setAddForm({year:"",company:"",location:"",role:"",desc:""});setAddModal("experience");}}>
                <div style={{textAlign:"center",color:G}}>
                  <Icon name="plus" size={28}/><div style={{marginTop:8,fontSize:"0.82rem",fontWeight:700}}>Add Experience</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ───────────────────────────────────────────── */}
      <section id="projects" style={{background:NM,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <h2 className="section-title">Notable <span>Projects</span></h2>
          <div className="gold-line"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:24}}>
            {(data.projects||[]).map(proj=>(
              <div key={proj.id} className="card" style={{overflow:"hidden",position:"relative"}}>
                <ImageUploader imageUrl={proj.imageUrl||proj.image_url||""} editMode={editMode}
                  onUpload={url=>mutate("projects","update",proj.id,{...proj,imageUrl:url,desc:proj.desc||proj.description,tags:proj.tags||[]})}
                  placeholder="Upload Project Photo"/>
                {editMode&&(
                  <button onClick={()=>deleteItem("projects",proj.id)} style={{position:"absolute",top:8,right:8,background:"#e5555590",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#fff",zIndex:2}}>
                    <Icon name="trash" size={14}/>
                  </button>
                )}
                <div style={{padding:20}}>
                  <span className="tag" style={{marginBottom:8}}>{proj.category}</span>
                  <h3 style={{fontFamily:"Playfair Display,serif",fontSize:"1rem",color:"#fff",fontWeight:700,margin:"8px 0 4px",lineHeight:1.3}}>
                    <EditableField value={proj.title||""} onSave={saveField("projects",proj.id,"title")} editMode={editMode} saving={saving}/>
                  </h3>
                  <div style={{color:G,fontSize:"0.76rem",marginBottom:10,fontWeight:600}}>
                    <EditableField value={proj.client||""} onSave={saveField("projects",proj.id,"client")} editMode={editMode} saving={saving}/>
                  </div>
                  <p style={{color:"#8fa8c4",fontSize:"0.83rem",lineHeight:1.6,marginBottom:12}}>
                    <EditableField value={proj.desc||proj.description||""} onSave={saveField("projects",proj.id,"desc")} editMode={editMode} multiline saving={saving}/>
                  </p>
                  <div>{(proj.tags||[]).map(t=><span key={t} className="tag" style={{fontSize:"0.66rem"}}>{t}</span>)}</div>
                </div>
              </div>
            ))}
            {editMode&&(
              <div className="card" style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`2px dashed ${G}44`,minHeight:200}}
                onClick={()=>{setAddForm({title:"",category:"",client:"",desc:"",tags:""});setAddModal("projects");}}>
                <div style={{textAlign:"center",color:G}}>
                  <Icon name="plus" size={28}/><div style={{marginTop:8,fontSize:"0.82rem",fontWeight:700}}>Add Project</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ──────────────────────────────────────────── */}
      <section id="education" style={{background:N,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <h2 className="section-title">Education & <span>Certifications</span></h2>
          <div className="gold-line"/>
          <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
            <div>
              <h3 style={{color:G,fontSize:"0.76rem",letterSpacing:2,textTransform:"uppercase",marginBottom:22}}>Academic Background</h3>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {(data.education||[]).map(e=>(
                  <div key={e.id} className="cert-card" style={{position:"relative"}}>
                    {editMode&&<button onClick={()=>deleteItem("education",e.id)} style={{position:"absolute",top:0,right:-8,background:"none",border:"none",cursor:"pointer",color:"#e55"}}><Icon name="trash" size={13}/></button>}
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <Icon name={e.type==="certification"?"award":"building"} size={15} style={{color:G,marginTop:2,flexShrink:0}}/>
                      <div>
                        <h4 style={{color:"#fff",fontSize:"0.92rem",fontWeight:700,lineHeight:1.3}}>
                          <EditableField value={e.degree||""} onSave={saveField("education",e.id,"degree")} editMode={editMode} saving={saving}/>
                        </h4>
                        <div style={{color:G,fontSize:"0.78rem",marginTop:2}}>
                          <EditableField value={e.institution||""} onSave={saveField("education",e.id,"institution")} editMode={editMode} saving={saving}/>
                        </div>
                        <div style={{color:"#8fa8c4",fontSize:"0.74rem",marginTop:2}}>
                          <EditableField value={e.year||e.year_detail||""} onSave={saveField("education",e.id,"year")} editMode={editMode} saving={saving}/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {editMode&&<button className="btn-outline" style={{padding:"7px 14px",fontSize:"0.78rem",marginTop:8}} onClick={()=>{setAddForm({degree:"",institution:"",year:"",type:"degree"});setAddModal("education");}}>+ Add Education</button>}
              </div>
            </div>
            <div>
              <h3 style={{color:G,fontSize:"0.76rem",letterSpacing:2,textTransform:"uppercase",marginBottom:22}}>Courses & Software Training</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {(data.courses||[]).map(c=>(
                  <div key={c.id} className="card" style={{padding:"13px 15px",position:"relative"}}>
                    {editMode&&<button onClick={()=>deleteItem("courses",c.id)} style={{position:"absolute",top:6,right:6,background:"none",border:"none",cursor:"pointer",color:"#e55"}}><Icon name="trash" size={12}/></button>}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <Icon name="check" size={13} style={{color:G,flexShrink:0}}/>
                      <span style={{color:"#fff",fontSize:"0.86rem",fontWeight:700}}>
                        <EditableField value={c.name||""} onSave={saveField("courses",c.id,"name")} editMode={editMode} saving={saving}/>
                      </span>
                    </div>
                    <div style={{color:"#8fa8c4",fontSize:"0.73rem",paddingLeft:22}}>
                      <EditableField value={c.detail||""} onSave={saveField("courses",c.id,"detail")} editMode={editMode} saving={saving}/>
                    </div>
                  </div>
                ))}
                {editMode&&(
                  <div className="card" style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`2px dashed ${G}44`,minHeight:70}} onClick={()=>{setAddForm({name:"",detail:""});setAddModal("courses");}}>
                    <span style={{color:G,fontSize:"0.78rem"}}>+ Add Course</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────── */}
      <section id="gallery" style={{background:NM,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <h2 className="section-title">Project <span>Gallery</span></h2>
          <div className="gold-line"/>
          {(data.gallery||[]).length===0&&!editMode&&(
            <div style={{textAlign:"center",padding:"60px 0",color:"#4a7fa5"}}>
              <Icon name="image" size={48} style={{display:"block",margin:"0 auto 16px",color:NL}}/>
              <p>Gallery is empty. Enable Edit Mode to upload construction photos, drawings and site images.</p>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {(data.gallery||[]).map((img,i)=>(
              <div key={img.id||i} className="gallery-item" style={{position:"relative"}}>
                <img src={img.url||img.image_url} alt={img.caption||"Gallery"} onClick={()=>setLightbox(i)}/>
                {editMode&&<button onClick={()=>deleteItem("gallery",img.id)} style={{position:"absolute",top:8,right:8,background:"#e5555590",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#fff"}}><Icon name="trash" size={13}/></button>}
                {img.caption&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.75))",padding:"18px 12px 10px",color:"#e8e8e8",fontSize:"0.78rem"}}>{img.caption}</div>}
              </div>
            ))}
            {editMode&&(
              <div style={{border:`2px dashed ${G}44`,borderRadius:10,aspectRatio:"4/3",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:NM}} onClick={()=>{setAddForm({url:"",caption:""});setAddModal("gallery");}}>
                <Icon name="upload" size={30} style={{color:G}}/>
                <span style={{color:G,fontSize:"0.78rem",marginTop:8,fontWeight:700}}>Upload Image</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────── */}
      <section id="contact" style={{background:N,padding:"96px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <h2 className="section-title">Get In <span>Touch</span></h2>
          <div className="gold-line"/>
          <div className="grid-contact" style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:56}}>
            <div>
              <p style={{color:"#b0c4d8",lineHeight:1.8,marginBottom:32,fontSize:"1rem"}}>Available for project consultations, contracts, and opportunities across the Gulf region and India. Experienced with Aramco, GACA, and international Gulf standards.</p>
              {[
                {icon:"phone",label:"Phone / WhatsApp",val:p.phone1||""},
                {icon:"mail",label:"Email",val:p.email||""},
                {icon:"passport",label:"Skype",val:p.skype||""},
              ].map(item=>(
                <div key={item.label} style={{display:"flex",gap:14,alignItems:"center",marginBottom:20}}>
                  <div style={{width:44,height:44,background:`${G}18`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={item.icon} size={18} style={{color:G}}/>
                  </div>
                  <div>
                    <div style={{color:"#8fa8c4",fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:1}}>{item.label}</div>
                    <div style={{color:"#e8e8e8",fontSize:"0.92rem",fontWeight:600,marginTop:2}}>{item.val}</div>
                  </div>
                </div>
              ))}
              <div style={{padding:18,background:`${G}10`,border:`1px solid ${G}30`,borderRadius:10,marginTop:8}}>
                <div style={{color:G,fontSize:"0.7rem",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Driving License</div>
                <div style={{color:"#e8e8e8",fontSize:"0.9rem"}}>Saudi Arabia ✦ India (Both valid)</div>
              </div>
            </div>
            <div className="card" style={{padding:30}}>
              <h3 style={{fontFamily:"Playfair Display,serif",color:"#fff",fontSize:"1.25rem",marginBottom:22}}>Send a Message</h3>
              <ContactForm showToast={showToast}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{background:"#060f1c",borderTop:`1px solid ${NL}`,padding:24,textAlign:"center"}}>
        <div style={{fontFamily:"Playfair Display,serif",color:G,fontSize:"1.05rem",marginBottom:5}}>Riyaz Ibrahim Shaikh</div>
        <div style={{color:"#4a7fa5",fontSize:"0.78rem"}}>Senior Civil Engineer & Project Coordinator | Gulf Region Specialist</div>
        <div style={{color:"#1e3a5f",fontSize:"0.7rem",marginTop:12}}>© {new Date().getFullYear()} All rights reserved</div>
      </footer>

      {/* ── ADMIN BAR ──────────────────────────────────────────── */}
      <div style={{position:"fixed",bottom:22,right:22,zIndex:200,display:"flex",gap:8,alignItems:"center"}}>
        {saving&&<div style={{background:NM,border:`1px solid ${G}`,borderRadius:8,padding:"7px 14px",color:G,fontSize:"0.78rem",display:"flex",alignItems:"center",gap:6}}><Icon name="spinner" size={14} style={{color:G}}/>Saving…</div>}
        {editMode ? (
          <>
            <div style={{background:NM,border:`1px solid ${G}`,borderRadius:8,padding:"7px 14px",color:G,fontSize:"0.78rem",display:"flex",alignItems:"center",gap:6}}>
              <Icon name="unlock" size={13}/>Edit Mode ON — click any text to edit
            </div>
            <button onClick={handleLogout} style={{background:"#c0392b",border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",cursor:"pointer",fontSize:"0.8rem",fontWeight:700}}>Exit Edit</button>
          </>
        ) : (
          <button className="btn-gold" onClick={()=>setPasswordModal(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",animation:"pulse 2.5s infinite"}}>
            <Icon name="lock" size={15}/>Admin Edit
          </button>
        )}
      </div>

      {/* ── PASSWORD MODAL ─────────────────────────────────────── */}
      <Modal open={passwordModal} onClose={()=>{setPasswordModal(false);setPwInput("");setPwError(false);}} title="Admin Login">
        <p style={{color:"#8fa8c4",marginBottom:16,fontSize:"0.88rem"}}>Enter the admin password to enable edit mode.</p>
        <input type="password" placeholder="Password" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoFocus/>
        {pwError&&<p style={{color:"#e55",fontSize:"0.8rem",marginTop:8}}>Incorrect password. Please try again.</p>}
        <button className="btn-gold" onClick={handleLogin} disabled={pwLoading} style={{width:"100%",marginTop:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {pwLoading?<><Icon name="spinner" size={16}/>Verifying…</>:"Login"}
        </button>
      </Modal>

      {/* ── ADD MODALS ─────────────────────────────────────────── */}
      <Modal open={addModal==="experience"} onClose={()=>setAddModal(null)} title="Add Experience">
        <Field label="Period (e.g. 2020–2023)" name="year" form={addForm} setForm={setAddForm}/>
        <Field label="Company" name="company" form={addForm} setForm={setAddForm}/>
        <Field label="Location" name="location" form={addForm} setForm={setAddForm}/>
        <Field label="Role / Title" name="role" form={addForm} setForm={setAddForm}/>
        <Field label="Description" name="desc" form={addForm} setForm={setAddForm} textarea/>
        <button className="btn-gold" disabled={addLoading||!addForm.company} onClick={()=>addItem("experience",addForm)} style={{width:"100%",marginTop:8}}>
          {addLoading?"Saving…":"Add Experience"}
        </button>
      </Modal>

      <Modal open={addModal==="projects"} onClose={()=>setAddModal(null)} title="Add Project">
        <Field label="Title" name="title" form={addForm} setForm={setAddForm}/>
        <Field label="Category" name="category" form={addForm} setForm={setAddForm}/>
        <Field label="Client" name="client" form={addForm} setForm={setAddForm}/>
        <Field label="Description" name="desc" form={addForm} setForm={setAddForm} textarea/>
        <Field label="Tags (comma-separated)" name="tags" form={addForm} setForm={setAddForm}/>
        <button className="btn-gold" disabled={addLoading||!addForm.title} onClick={()=>addItem("projects",{...addForm,tags:(addForm.tags||"").split(",").map(t=>t.trim()).filter(Boolean),imageUrl:""})} style={{width:"100%",marginTop:8}}>
          {addLoading?"Saving…":"Add Project"}
        </button>
      </Modal>

      <Modal open={addModal==="education"} onClose={()=>setAddModal(null)} title="Add Education">
        <Field label="Degree / Certification Name" name="degree" form={addForm} setForm={setAddForm}/>
        <Field label="Institution" name="institution" form={addForm} setForm={setAddForm}/>
        <Field label="Year / Grade" name="year" form={addForm} setForm={setAddForm}/>
        <div style={{marginBottom:14}}>
          <label style={{color:G,fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:5}}>Type</label>
          <select value={addForm.type||"degree"} onChange={e=>setAddForm(p=>({...p,type:e.target.value}))}>
            <option value="degree">Degree</option>
            <option value="certification">Certification</option>
          </select>
        </div>
        <button className="btn-gold" disabled={addLoading||!addForm.degree} onClick={()=>addItem("education",addForm)} style={{width:"100%",marginTop:8}}>
          {addLoading?"Saving…":"Add Education"}
        </button>
      </Modal>

      <Modal open={addModal==="courses"} onClose={()=>setAddModal(null)} title="Add Course">
        <Field label="Course Name" name="name" form={addForm} setForm={setAddForm}/>
        <Field label="Detail / Institution" name="detail" form={addForm} setForm={setAddForm}/>
        <button className="btn-gold" disabled={addLoading||!addForm.name} onClick={()=>addItem("courses",addForm)} style={{width:"100%",marginTop:8}}>
          {addLoading?"Saving…":"Add Course"}
        </button>
      </Modal>

      <Modal open={addModal==="gallery"} onClose={()=>setAddModal(null)} title="Upload Gallery Image">
        <div style={{marginBottom:16}}>
          {addForm.url ? (
            <img src={addForm.url} alt="" style={{width:"100%",borderRadius:8,maxHeight:200,objectFit:"cover"}}/>
          ) : (
            <label style={{display:"block",border:`2px dashed ${G}44`,borderRadius:8,padding:32,textAlign:"center",cursor:"pointer"}}>
              <Icon name="upload" size={30} style={{display:"block",margin:"0 auto 8px",color:G}}/>
              <span style={{color:G,fontSize:"0.85rem"}}>Click to select image</span>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                const file=e.target.files[0];
                if(file){const r=new FileReader();r.onload=ev=>setAddForm(p=>({...p,url:ev.target.result}));r.readAsDataURL(file);}
              }}/>
            </label>
          )}
        </div>
        <Field label="Caption (optional)" name="caption" form={addForm} setForm={setAddForm}/>
        <button className="btn-gold" disabled={addLoading||!addForm.url} onClick={()=>addItem("gallery",{url:addForm.url,caption:addForm.caption||""})} style={{width:"100%",marginTop:8,opacity:addForm.url?1:0.5}}>
          {addLoading?"Saving…":"Add to Gallery"}
        </button>
      </Modal>

      {/* ── LIGHTBOX ───────────────────────────────────────────── */}
      {lightbox!==null&&(
        <div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setLightbox(null)}>
          <img src={(data.gallery[lightbox]?.url||data.gallery[lightbox]?.image_url)} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:8}}/>
          <button onClick={()=>setLightbox(null)} style={{position:"absolute",top:20,right:20,background:"none",border:"none",color:G,cursor:"pointer"}}><Icon name="close" size={28}/></button>
          {lightbox>0&&<button onClick={e=>{e.stopPropagation();setLightbox(l=>l-1);}} style={{position:"absolute",left:20,background:`${G}30`,border:"none",color:G,cursor:"pointer",padding:"8px 16px",borderRadius:6,fontSize:"1.4rem"}}>‹</button>}
          {lightbox<(data.gallery.length-1)&&<button onClick={e=>{e.stopPropagation();setLightbox(l=>l+1);}} style={{position:"absolute",right:20,background:`${G}30`,border:"none",color:G,cursor:"pointer",padding:"8px 16px",borderRadius:6,fontSize:"1.4rem"}}>›</button>}
        </div>
      )}
    </>
  );
}

// ─── CONTACT FORM (isolated state) ───────────────────────────────────────────
function ContactForm({ showToast }) {
  const [form, setForm] = useState({ name:"", email:"", company:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in name, email, and message", "error"); return;
    }
    setSending(true);
    // Replace this with a real email service (e.g. Netlify Forms, EmailJS, Resend)
    await new Promise(r=>setTimeout(r,800));
    showToast("Message sent! Riyaz will get back to you shortly.");
    setForm({ name:"", email:"", company:"", subject:"", message:"" });
    setSending(false);
  };

  const iStyle = { background:"#0a1628", border:`1.5px solid ${NL}`, color:"#fff", padding:"9px 13px", borderRadius:8, fontFamily:"Lato,sans-serif", fontSize:".9rem", width:"100%", outline:"none", marginBottom:12 };

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0}}>
        <input type="text"  placeholder="Your Name"           value={form.name}    onChange={e=>setForm(p=>({...p,name:e.target.value}))}    style={{...iStyle,marginBottom:0}}/>
        <input type="email" placeholder="Your Email"          value={form.email}   onChange={e=>setForm(p=>({...p,email:e.target.value}))}   style={{...iStyle,marginBottom:0}}/>
      </div>
      <div style={{height:12}}/>
      <input type="text" placeholder="Company / Organization" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} style={iStyle}/>
      <input type="text" placeholder="Subject"                value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} style={iStyle}/>
      <textarea rows={4} placeholder="Your Message"           value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} style={{...iStyle,resize:"vertical"}}/>
      <button className="btn-gold" onClick={handleSend} disabled={sending} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {sending ? <><Icon name="spinner" size={16}/>Sending…</> : "Send Message"}
      </button>
    </div>
  );
}
