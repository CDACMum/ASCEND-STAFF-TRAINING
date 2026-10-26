/* =====================================================================
   ASCEND 2026 — application
   Vanilla JS single-page app. Talks to Supabase; falls back to a demo
   store (seeded sample data) when credentials aren't configured yet.
   ===================================================================== */
(() => {
"use strict";

const CFG  = window.ASCEND_CONFIG;
const DEMO = window.ASCEND_DEMO;

/* ---------------------------------------------------------------- icons */
const I = {
  peak:`<svg viewBox="0 0 48 48" fill="none"><path d="M6 40 L20 12 L29 27 L35 18 L42 32" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 8 h6 v6" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 20 L42 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  dash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>`,
  clip:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l2 2 4-4"/></svg>`,
  inbox:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 13l3-8h12l3 8"/><path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/></svg>`,
  users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6"/><path d="M17.5 14.4A5.5 5.5 0 0 1 20.5 20"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`,
  logout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M15 5v-.5A1.5 1.5 0 0 0 13.5 3h-7A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h7a1.5 1.5 0 0 0 1.5-1.5V19"/><path d="M10 12h11m0 0-3-3m3 3-3 3"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17z"/><path d="M14 7l3 3"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  cal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v4M16 3v4"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  play:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.5v5l4-2.5z" fill="currentColor"/></svg>`,
  link:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1"/></svg>`,
  file:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/></svg>`,
  slides:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>`,
  git:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="17" cy="9" r="2.5"/><path d="M6 8.5v7M6 15a6 6 0 0 0 6-6h2.5"/></svg>`,
  ext:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>`,
  chev:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 6l6 6-6 6"/></svg>`,
  menu:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l4 4L19 7"/></svg>`,
  award:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h0"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M15 6l-6 6 6 6"/></svg>`,
};

/* ---------------------------------------------------------------- utils */
const $  = (s, r=document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = (n) => (n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
const fmtDate = (v) => { if(!v) return "—"; const d=new Date(v); return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); };
const fmtDT   = (v) => { if(!v) return "—"; const d=new Date(v); return d.toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}); };
const isPast  = (v) => v && new Date(v).getTime() < Date.now();
const toLocalInput = (iso) => { if(!iso) return ""; const d=new Date(iso); const p=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const fromLocalInput = (v) => v ? new Date(v).toISOString() : null;

function toast(msg, kind="ok"){
  const t = document.createElement("div");
  t.className = `toast ${kind}`;
  t.innerHTML = `${kind==="err"?I.alert:I.check}<span>${esc(msg)}</span>`;
  $("#toast-root").appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transform="translateY(6px)"; setTimeout(()=>t.remove(),200); }, 2800);
}

/* generic modal + form builder */
function closeModal(){ $("#modal-root").innerHTML=""; }
function openModal({title, bodyHTML, wide, footerHTML}){
  $("#modal-root").innerHTML = `
    <div class="modal-scrim" data-scrim>
      <div class="modal ${wide?"modal--wide":""}" role="dialog" aria-modal="true">
        <div class="modal__h"><h3>${esc(title)}</h3><button data-close aria-label="Close">${I.x}</button></div>
        <div class="modal__b">${bodyHTML}</div>
        ${footerHTML ? `<div class="modal__f">${footerHTML}</div>` : ""}
      </div>
    </div>`;
  const scrim = $("[data-scrim]");
  scrim.addEventListener("mousedown", e=>{ if(e.target===scrim) closeModal(); });
  $("[data-close]").addEventListener("click", closeModal);
  return $(".modal");
}
function fieldHTML(f, val){
  const v = val ?? f.value ?? "";
  const lbl = `<label>${esc(f.label)} ${f.hint?`<span class="hint">${esc(f.hint)}</span>`:""}</label>`;
  if(f.type==="textarea") return `<div class="field">${lbl}<textarea name="${f.name}" placeholder="${esc(f.placeholder||"")}">${esc(v)}</textarea></div>`;
  if(f.type==="select"){
    const opts = f.options.map(o=>`<option value="${esc(o.value)}" ${String(v)===String(o.value)?"selected":""}>${esc(o.label)}</option>`).join("");
    return `<div class="field">${lbl}<select name="${f.name}">${opts}</select></div>`;
  }
  const type = f.type==="datetime" ? "datetime-local" : (f.type||"text");
  const vv = f.type==="datetime" ? toLocalInput(v) : v;
  return `<div class="field">${lbl}<input class="input" type="${type}" name="${f.name}" value="${esc(vv)}" placeholder="${esc(f.placeholder||"")}"/></div>`;
}
function formModal({title, fields, values={}, submitLabel="Save", wide, onSubmit}){
  const body = `<form data-form>${fields.map(f=>{
    return f.row ? `<div class="row2">${f.row.map(sub=>fieldHTML(sub, values[sub.name])).join("")}</div>` : fieldHTML(f, values[f.name]);
  }).join("")}</form>`;
  const footer = `<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--primary" data-save>${esc(submitLabel)}</button>`;
  openModal({title, bodyHTML:body, wide, footerHTML:footer});
  $("[data-cancel]").addEventListener("click", closeModal);
  $("[data-save]").addEventListener("click", async ()=>{
    const form = $("[data-form]");
    const data = {};
    const flat = fields.flatMap(f=>f.row||[f]);
    for(const f of flat){
      const inp = form.elements[f.name];
      let val = inp.value.trim();
      if(f.required && !val){ inp.focus(); inp.style.borderColor="var(--ember)"; return; }
      if(f.type==="datetime") val = fromLocalInput(val);
      if(f.type==="number") val = val===""?null:Number(val);
      data[f.name]=val;
    }
    const btn=$("[data-save]"); btn.disabled=true; btn.textContent="Saving…";
    try{ await onSubmit(data); closeModal(); }
    catch(e){ btn.disabled=false; btn.textContent=submitLabel; toast(e.message||"Something went wrong","err"); }
  });
}
function confirmModal(msg, onYes){
  openModal({title:"Please confirm", bodyHTML:`<p class="muted" style="margin:0">${esc(msg)}</p>`,
    footerHTML:`<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--danger" data-yes>Delete</button>`});
  $("[data-cancel]").addEventListener("click", closeModal);
  $("[data-yes]").addEventListener("click", async ()=>{ try{ await onYes(); closeModal(); }catch(e){ toast(e.message,"err"); } });
}

/* ================================================================ DATA */
let sb = null;
if(!DEMO){ sb = supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY); }

/* ---- demo store (in-memory; resets on refresh) ---- */
const DemoStore = (() => {
  const uid=(p)=>p+"-"+Math.random().toString(36).slice(2,9);
  const courses=[
    {id:"c1",title:"Git & Version Control Fundamentals",summary:"Branching, pull requests and collaborative workflows every ASCEND submission relies on.",instructor:"C-DAC Faculty",accent:"navy",sort_order:1,is_published:true},
    {id:"c2",title:"Python for Automation",summary:"Scripting, data handling and building small tools to remove repetitive work.",instructor:"C-DAC Faculty",accent:"violet",sort_order:2,is_published:true},
    {id:"c3",title:"Cloud & Containers",summary:"Docker, images and deploying services — from laptop to production.",instructor:"C-DAC Faculty",accent:"flame",sort_order:3,is_published:true},
  ];
  const sessions=[
    {id:"s1",course_id:"c1",title:"ASCEND Inauguration — Kickstarting Our Journey",description:"Programme overview and how to use this platform.",scheduled_at:"2026-09-01T16:30:00+05:30",platform:"Zoom",join_url:"",recording_url:"https://example.com/recording",duration_mins:60,sort_order:1},
    {id:"s2",course_id:"c1",title:"Branching & Merging in Practice",description:"Feature branches, resolving conflicts, and clean history.",scheduled_at:"2026-09-04T16:30:00+05:30",platform:"Zoom",join_url:"https://zoom.us/j/example",recording_url:"",duration_mins:90,sort_order:2},
    {id:"s3",course_id:"c2",title:"Python Basics Refresher",description:"Types, loops, functions and files.",scheduled_at:"2026-09-06T16:30:00+05:30",platform:"Zoom",join_url:"",recording_url:"https://example.com/rec2",duration_mins:75,sort_order:1},
  ];
  const materials=[
    {id:"m1",course_id:"c1",title:"Git cheat-sheet (PDF)",kind:"doc",url:"https://example.com/git.pdf"},
    {id:"m2",course_id:"c1",title:"Session 1 slides",kind:"slides",url:"https://example.com/slides"},
    {id:"m3",course_id:"c2",title:"Starter notebook",kind:"code",url:"https://example.com/nb"},
  ];
  const assignments=[
    {id:"a1",course_id:"c1",title:"Set up your Git repository",brief:"Create a public repo named ascend-<your-name>, add a README describing yourself, and submit the repository link.",due_at:"2026-09-08T23:59:00+05:30",points:100,is_open:true},
    {id:"a2",course_id:"c2",title:"Automate a daily report",brief:"Write a Python script that reads a CSV and prints a summary. Submit the repo link.",due_at:"2026-09-15T23:59:00+05:30",points:100,is_open:true},
  ];
  const profiles=[
    {id:"u-admin",full_name:"Programme Admin",email:"admin@cdac.in",role:"admin",team:"L&D"},
    {id:"u-staff",full_name:"Asha Menon",email:"asha@cdac.in",role:"staff",team:"Engineering"},
    {id:"u-2",full_name:"Ravi Kulkarni",email:"ravi@cdac.in",role:"staff",team:"Engineering"},
    {id:"u-3",full_name:"Priya Nair",email:"priya@cdac.in",role:"staff",team:"Design"},
  ];
  const submissions=[
    {id:"sub1",assignment_id:"a1",user_id:"u-2",git_url:"https://github.com/ravi/ascend-ravi",notes:"Done!",status:"reviewed",grade:92,feedback:"Great README.",submitted_at:"2026-09-05T10:00:00+05:30"},
    {id:"sub2",assignment_id:"a1",user_id:"u-3",git_url:"https://github.com/priya/ascend-priya",notes:"",status:"submitted",grade:null,feedback:"",submitted_at:"2026-09-06T12:00:00+05:30"},
  ];
  return {uid,courses,sessions,materials,assignments,profiles,submissions};
})();

/* ---- unified data API ---- */
const db = {
  async profile(id){
    if(DEMO) return DemoStore.profiles.find(p=>p.id===id) || null;
    const {data,error}=await sb.from("profiles").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async courses(){
    if(DEMO) return [...DemoStore.courses].sort((a,b)=>a.sort_order-b.sort_order);
    const {data,error}=await sb.from("courses").select("*").order("sort_order");
    if(error) throw error; return data;
  },
  async course(id){
    if(DEMO) return DemoStore.courses.find(c=>c.id===id);
    const {data,error}=await sb.from("courses").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async sessions(courseId){
    if(DEMO) return DemoStore.sessions.filter(s=>s.course_id===courseId).sort((a,b)=>a.sort_order-b.sort_order);
    const {data,error}=await sb.from("sessions").select("*").eq("course_id",courseId).order("sort_order");
    if(error) throw error; return data;
  },
  async materials(courseId){
    if(DEMO) return DemoStore.materials.filter(m=>m.course_id===courseId);
    const {data,error}=await sb.from("materials").select("*").eq("course_id",courseId).order("created_at");
    if(error) throw error; return data;
  },
  async assignments(){
    if(DEMO) return [...DemoStore.assignments];
    const {data,error}=await sb.from("assignments").select("*").order("due_at",{nullsFirst:false});
    if(error) throw error; return data;
  },
  async assignment(id){
    if(DEMO) return DemoStore.assignments.find(a=>a.id===id);
    const {data,error}=await sb.from("assignments").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async mySubmission(assignmentId, userId){
    if(DEMO) return DemoStore.submissions.find(s=>s.assignment_id===assignmentId && s.user_id===userId) || null;
    const {data,error}=await sb.from("submissions").select("*").eq("assignment_id",assignmentId).eq("user_id",userId).maybeSingle();
    if(error) throw error; return data;
  },
  async mySubmissions(userId){
    if(DEMO) return DemoStore.submissions.filter(s=>s.user_id===userId);
    const {data,error}=await sb.from("submissions").select("*").eq("user_id",userId);
    if(error) throw error; return data;
  },
  async submissionsFor(assignmentId){
    if(DEMO) return DemoStore.submissions.filter(s=>s.assignment_id===assignmentId);
    const {data,error}=await sb.from("submissions").select("*").eq("assignment_id",assignmentId).order("submitted_at");
    if(error) throw error; return data;
  },
  async submit({assignment_id,user_id,git_url,notes}){
    if(DEMO){
      let ex=DemoStore.submissions.find(s=>s.assignment_id===assignment_id && s.user_id===user_id);
      if(ex){ Object.assign(ex,{git_url,notes,status:"submitted",submitted_at:new Date().toISOString()}); return ex; }
      const row={id:DemoStore.uid("sub"),assignment_id,user_id,git_url,notes,status:"submitted",grade:null,feedback:"",submitted_at:new Date().toISOString()};
      DemoStore.submissions.push(row); return row;
    }
    const {data,error}=await sb.from("submissions").upsert(
      {assignment_id,user_id,git_url,notes,status:"submitted",submitted_at:new Date().toISOString()},
      {onConflict:"assignment_id,user_id"}).select().single();
    if(error) throw error; return data;
  },
  async review(id,{status,grade,feedback}){
    if(DEMO){ const s=DemoStore.submissions.find(x=>x.id===id); Object.assign(s,{status,grade,feedback,reviewed_at:new Date().toISOString()}); return s; }
    const {data,error}=await sb.from("submissions").update({status,grade,feedback,reviewed_at:new Date().toISOString()}).eq("id",id).select().single();
    if(error) throw error; return data;
  },
  async people(){
    if(DEMO) return [...DemoStore.profiles];
    const {data,error}=await sb.from("profiles").select("*").order("full_name");
    if(error) throw error; return data;
  },
  async setRole(id,role){
    if(DEMO){ DemoStore.profiles.find(p=>p.id===id).role=role; return; }
    const {error}=await sb.from("profiles").update({role}).eq("id",id); if(error) throw error;
  },
  // generic admin create/update/delete
  async create(table,row){
    if(DEMO){ const r={id:DemoStore.uid(table),...row}; DemoStore[table].push(r); return r; }
    const {data,error}=await sb.from(table).insert(row).select().single(); if(error) throw error; return data;
  },
  async update(table,id,row){
    if(DEMO){ const r=DemoStore[table].find(x=>x.id===id); Object.assign(r,row); return r; }
    const {data,error}=await sb.from(table).update(row).eq("id",id).select().single(); if(error) throw error; return data;
  },
  async remove(table,id){
    if(DEMO){ const arr=DemoStore[table]; arr.splice(arr.findIndex(x=>x.id===id),1); return; }
    const {error}=await sb.from(table).delete().eq("id",id); if(error) throw error;
  },
};

/* ================================================================ AUTH */
const Auth = {
  user:null, profile:null,
  get isAdmin(){ return this.profile?.role==="admin"; },
  async init(){
    if(DEMO) return; // demo starts logged-out
    const {data}=await sb.auth.getSession();
    if(data.session){ this.user=data.session.user; this.profile=await db.profile(this.user.id); }
    sb.auth.onAuthStateChange(async (_e,session)=>{
      if(session?.user){ this.user=session.user; try{ this.profile=await db.profile(this.user.id);}catch{} }
      else { this.user=null; this.profile=null; }
      render();
    });
  },
  async signUp(name,email,password){
    const {error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
    if(error) throw error;
  },
  async signIn(email,password){
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error) throw error;
  },
  async signOut(){
    if(DEMO){ this.user=null; this.profile=null; location.hash="#/"; render(); return; }
    await sb.auth.signOut();
  },
  demoEnter(role){
    this.user={id: role==="admin"?"u-admin":"u-staff"};
    this.profile=DemoStore.profiles.find(p=>p.id===this.user.id);
    location.hash="#/dashboard"; render();
  },
};

/* ============================================================== ROUTER */
function route(){
  const h=(location.hash||"#/dashboard").replace(/^#/,"");
  const parts=h.split("/").filter(Boolean); // e.g. ["course","c1"]
  return {name:parts[0]||"dashboard", id:parts[1], sub:parts[1]};
}

/* ============================================================ RENDER */
async function render(){
  const root=$("#root");
  if(!Auth.user){ renderAuth(root); return; }
  if(!Auth.profile){ try{ Auth.profile=await db.profile(Auth.user.id);}catch{} }
  renderShell(root);
  const mount=$("#view");
  const r=route();
  mount.innerHTML=`<div class="spinner"></div>`;
  try{
    const map={
      dashboard:viewDashboard, courses:viewCourses, course:viewCourse,
      assignments:viewAssignments, assignment:viewAssignment,
      submissions:viewMySubmissions, profile:viewProfile, admin:viewAdmin,
    };
    await (map[r.name]||viewDashboard)(mount, r);
  }catch(e){
    mount.innerHTML=`<div class="empty">${I.alert}<h3>Couldn't load this page</h3><p>${esc(e.message||e)}</p></div>`;
  }
  markActiveNav(r.name);
}

/* ---------------------------------------------------------- auth view */
function renderAuth(root){
  let mode="signin";
  const paint=()=>{
    root.innerHTML=`
    <div class="auth">
      <div class="auth__brand">
        <div class="auth__org">${esc(CFG.ORG)}</div>
        <div>
          <div class="auth__big">ASC<em>END</em></div>
          <div class="auth__tag">Staff training &amp; upskilling. Watch sessions, pick up materials, and submit your work — all in one place.</div>
        </div>
        <div class="auth__foot">
          <div><b>Ascend</b>Learn continuously</div>
          <div><b>Empower</b>Grow your craft</div>
          <div><b>Achieve</b>Ship real work</div>
        </div>
        <div class="auth__peak" style="color:#3a2f8f">${I.peak}</div>
      </div>
      <div class="auth__form">
        <div class="auth__card">
          <div class="mark" style="margin-bottom:1.2rem"><span class="wordmark" style="font-size:1.5rem">ASCEND 2026</span></div>
          <h1 style="font-family:var(--font-d);font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .2rem">${mode==="signin"?"Sign in":"Create your account"}</h1>
          <p class="muted" style="margin:0 0 1.2rem">${mode==="signin"?"Welcome back — enter your details to continue.":"Use your official email to join the programme."}</p>
          ${DEMO?`<div class="demo-flag" style="margin-bottom:1rem">${I.alert} Demo mode — Supabase not configured yet</div>`:""}
          <form data-af>
            ${mode==="signup"?`<div class="field"><label>Full name</label><input class="input" name="name" placeholder="Asha Menon" autocomplete="name"/></div>`:""}
            <div class="field"><label>Email</label><input class="input" name="email" type="email" placeholder="you@cdac.in" autocomplete="email"/></div>
            <div class="field"><label>Password</label><input class="input" name="password" type="password" placeholder="••••••••" autocomplete="${mode==="signin"?"current-password":"new-password"}"/></div>
            <button class="btn btn--primary" data-go style="width:100%;margin-top:.3rem">${mode==="signin"?"Sign in":"Create account"}</button>
          </form>
          ${DEMO?`<div style="display:flex;gap:.5rem;margin-top:.9rem">
            <button class="btn btn--ghost btn--sm" data-demo="staff" style="flex:1">Explore as staff</button>
            <button class="btn btn--ghost btn--sm" data-demo="admin" style="flex:1">Explore as admin</button></div>`:""}
          <div class="auth__switch">${mode==="signin"?"New here?":"Already have an account?"}
            <button data-switch>${mode==="signin"?"Create an account":"Sign in"}</button></div>
        </div>
      </div>
    </div>`;
    $("[data-switch]").addEventListener("click",()=>{ mode=mode==="signin"?"signup":"signin"; paint(); });
    if(DEMO) root.querySelectorAll("[data-demo]").forEach(b=>b.addEventListener("click",()=>Auth.demoEnter(b.dataset.demo)));
    $("[data-go]").addEventListener("click", async (e)=>{
      e.preventDefault();
      const f=$("[data-af]"); const email=f.elements.email.value.trim(); const password=f.elements.password.value;
      const name=f.elements.name?f.elements.name.value.trim():"";
      if(!email||!password){ toast("Enter your email and password","err"); return; }
      const btn=$("[data-go]"); btn.disabled=true; btn.textContent="Please wait…";
      try{
        if(mode==="signup"){ await Auth.signUp(name,email,password); toast("Account created — check your email to confirm, then sign in."); mode="signin"; paint(); }
        else{ await Auth.signIn(email,password); }
      }catch(err){ toast(err.message||"Authentication failed","err"); btn.disabled=false; btn.textContent=mode==="signin"?"Sign in":"Create account"; }
    });
  };
  paint();
}

/* -------------------------------------------------------- app shell */
const NAV=[
  {name:"dashboard",label:"Dashboard",icon:I.dash},
  {name:"courses",label:"Courses",icon:I.book},
  {name:"assignments",label:"Assignments",icon:I.clip},
  {name:"submissions",label:"My submissions",icon:I.inbox},
];
const ADMIN_NAV=[
  {name:"admin",label:"Manage programme",icon:I.award},
];
function renderShell(root){
  const p=Auth.profile||{};
  const nav=(items)=>items.map(n=>`<a href="#/${n.name}" data-nav="${n.name}">${n.icon}<span>${n.label}</span></a>`).join("");
  root.innerHTML=`
  <div class="app" id="app">
    <div class="scrim" data-scrim-close></div>
    <aside class="side">
      <div class="side__brand">
        <div style="width:34px;height:34px;color:#f2661f">${I.peak}</div>
        <div><div class="wm">ASCEND</div><div class="sub">2026 · C-DAC MUMBAI</div></div>
      </div>
      <div class="side__group">Learning</div>
      <nav class="nav">${nav(NAV)}
        ${Auth.isAdmin?`<div class="side__group" style="margin-top:.6rem">Admin</div>${nav(ADMIN_NAV)}`:""}
        <div class="side__group" style="margin-top:.6rem">Account</div>
        <a href="#/profile" data-nav="profile">${I.user}<span>Profile</span></a>
      </nav>
      <div class="side__user">
        <div class="av">${esc(initials(p.full_name))}</div>
        <div style="min-width:0"><div class="nm">${esc(p.full_name||"You")}</div>
          <div class="rl">${Auth.isAdmin?"Administrator":"Staff"}</div></div>
        <button data-logout title="Sign out">${I.logout}</button>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <button class="burger" data-burger>${I.menu}</button>
        <span class="wm">ASCEND 2026</span>
      </div>
      <div class="content" id="view"></div>
    </div>
  </div>`;
  $("[data-logout]").addEventListener("click",()=>Auth.signOut());
  const app=$("#app");
  $("[data-burger]")?.addEventListener("click",()=>app.dataset.open=app.dataset.open==="1"?"0":"1");
  $("[data-scrim-close]")?.addEventListener("click",()=>app.dataset.open="0");
  root.querySelectorAll("[data-nav]").forEach(a=>a.addEventListener("click",()=>{ app.dataset.open="0"; }));
}
function markActiveNav(name){
  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===name));
}

/* helper components */
const accentIcon=(a)=>({navy:I.git,violet:I.book,flame:I.play,teal:I.clip}[a]||I.book);
function courseCard(c){
  return `<button class="course" data-open-course="${c.id}" data-accent="${esc(c.accent||"navy")}">
    <div class="course__band" style="color:#fff">${I.peak}</div>
    <div class="course__body">
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.summary||"")}</p>
      <div class="course__meta"><span>${I.user}${esc(c.instructor||"C-DAC")}</span></div>
    </div></button>`;
}
const matIcon=(k)=>({slides:I.slides,doc:I.file,code:I.git,video:I.play,link:I.link}[k]||I.link);
function statusBadge(s){
  if(!s) return `<span class="badge closed">Not submitted</span>`;
  const map={submitted:"submitted",reviewed:"reviewed",returned:"returned"};
  const lbl={submitted:"Submitted",reviewed:"Reviewed",returned:"Returned"}[s.status]||s.status;
  return `<span class="badge ${map[s.status]||"submitted"}">${lbl}</span>`
       + (s.grade!=null?` <span class="badge grade">${s.grade} pts</span>`:"");
}

/* =============================================================== VIEWS */

async function viewDashboard(mount){
  const [courses,assignments]=await Promise.all([db.courses(),db.assignments()]);
  const mine=await db.mySubmissions(Auth.user.id).catch(()=>[]);
  const submittedIds=new Set(mine.map(m=>m.assignment_id));
  const pending=assignments.filter(a=>a.is_open && !submittedIds.has(a.id));
  // next upcoming session across all courses
  let upcoming=null;
  for(const c of courses){ const ss=await db.sessions(c.id); for(const s of ss){ if(s.scheduled_at && !isPast(s.scheduled_at)){ if(!upcoming||new Date(s.scheduled_at)<new Date(upcoming.scheduled_at)) upcoming={...s,course:c.title}; } } }
  const first=(Auth.profile?.full_name||"there").split(" ")[0];

  mount.innerHTML=`
    <div class="hero">
      <div class="kicker">${Auth.isAdmin?"Administrator":"Welcome back"}</div>
      <h2>Hello, ${esc(first)} 👋</h2>
      <p>Ascend. Empower. Achieve. Keep climbing — here's where things stand today.</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>

    <div class="stats">
      <div class="stat"><div class="n navy">${courses.length}</div><div class="l">Active courses</div></div>
      <div class="stat"><div class="n violet">${assignments.length}</div><div class="l">Assignments</div></div>
      <div class="stat"><div class="n flame">${pending.length}</div><div class="l">Pending from you</div></div>
      <div class="stat"><div class="n">${mine.length}</div><div class="l">Your submissions</div></div>
    </div>

    ${upcoming?`
    <div class="section-h"><h2>Next up</h2></div>
    <div class="rowc">
      <div class="rowc__ic">${I.cal}</div>
      <div class="rowc__main"><h4>${esc(upcoming.title)}</h4>
        <div class="sub"><span>${esc(upcoming.course)}</span><span>${fmtDT(upcoming.scheduled_at)}</span><span>${esc(upcoming.platform||"Zoom")}</span></div></div>
      ${upcoming.join_url?`<div class="rowc__act"><a class="btn btn--primary btn--sm" href="${esc(upcoming.join_url)}" target="_blank" rel="noopener">Join ${I.ext}</a></div>`:""}
    </div>`:""}

    <div class="section-h"><h2>Continue learning</h2><span class="count">${courses.length} courses</span></div>
    <div class="grid">${courses.slice(0,3).map(courseCard).join("")||emptyBlock("No courses yet","Your programme catalogue will appear here.")}</div>

    ${pending.length?`
    <div class="section-h"><h2>Assignments to finish</h2></div>
    <div class="stack">${pending.slice(0,3).map(a=>assignmentRow(a,courses)).join("")}</div>`:""}
  `;
  wireCourseOpen(mount);
  mount.querySelectorAll("[data-open-assign]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.openAssign}`));
}
function assignmentRow(a,courses){
  const c=courses.find(x=>x.id===a.course_id);
  return `<div class="rowc" data-open-assign="${a.id}" style="cursor:pointer">
    <div class="rowc__ic">${I.clip}</div>
    <div class="rowc__main"><h4>${esc(a.title)}</h4>
      <div class="sub">${c?`<span>${esc(c.title)}</span>`:""}<span>Due ${fmtDate(a.due_at)}</span></div></div>
    <div class="rowc__act"><span class="chev" style="color:var(--muted-2)">${I.chev}</span></div></div>`;
}
function emptyBlock(title,sub){ return `<div class="empty">${I.book}<h3>${esc(title)}</h3><p>${esc(sub)}</p></div>`; }
function wireCourseOpen(mount){ mount.querySelectorAll("[data-open-course]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/course/${el.dataset.openCourse}`)); }

async function viewCourses(mount){
  const courses=await db.courses();
  mount.innerHTML=`
    <div class="page-h"><div><h1>Courses</h1><p>Everything in the ASCEND 2026 curriculum.</p></div>
      ${Auth.isAdmin?`<button class="btn btn--primary" data-add>${I.plus} New course</button>`:""}</div>
    <div class="grid">${courses.map(courseCard).join("")||emptyBlock("No courses yet","Admins can add the first course.")}</div>`;
  wireCourseOpen(mount);
  $("[data-add]")?.addEventListener("click",()=>editCourse(null));
}

async function viewCourse(mount,r){
  const c=await db.course(r.id);
  if(!c){ mount.innerHTML=emptyBlock("Course not found","It may have been removed."); return; }
  const [sessions,materials,assignments]=await Promise.all([db.sessions(c.id),db.materials(c.id),db.assignments()]);
  const courseAssign=assignments.filter(a=>a.course_id===c.id);
  const A=Auth.isAdmin;

  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All courses</button>
    <div class="hero" data-accent="${esc(c.accent)}">
      <div class="kicker">${esc(c.instructor||"C-DAC")}</div>
      <h2>${esc(c.title)}</h2><p>${esc(c.summary||"")}</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>

    <div class="section-h"><h2>Sessions &amp; recordings</h2><span class="count">${sessions.length}</span>
      ${A?`<button class="btn btn--ghost btn--sm" style="margin-left:auto" data-add-session>${I.plus} Add session</button>`:""}</div>
    <div class="rows">${sessions.map(s=>sessionRow(s,A)).join("")||emptyBlock("No sessions yet","Sessions and their recordings will show here.")}</div>

    <div class="section-h"><h2>Materials</h2><span class="count">${materials.length}</span>
      ${A?`<button class="btn btn--ghost btn--sm" style="margin-left:auto" data-add-material>${I.plus} Add material</button>`:""}</div>
    ${materials.length?`<div class="chips">${materials.map(m=>materialChip(m,A)).join("")}</div>`:`<p class="muted">No materials attached yet.</p>`}

    <div class="section-h"><h2>Assignments</h2><span class="count">${courseAssign.length}</span></div>
    <div class="stack">${courseAssign.map(a=>assignmentRow(a,[c])).join("")||`<p class="muted">No assignments for this course.</p>`}</div>

    ${A?`<div class="between" style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--line)">
      <span class="muted" style="font-size:.85rem">Admin actions</span>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn--ghost btn--sm" data-edit-course>${I.edit} Edit course</button>
        <button class="btn btn--danger btn--sm" data-del-course>${I.trash} Delete</button></div></div>`:""}
  `;
  $("[data-back]").addEventListener("click",()=>location.hash="#/courses");
  mount.querySelectorAll("[data-open-assign]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.openAssign}`));
  if(A){
    $("[data-add-session]").addEventListener("click",()=>editSession(c.id,null));
    $("[data-add-material]").addEventListener("click",()=>editMaterial(c.id,null));
    $("[data-edit-course]").addEventListener("click",()=>editCourse(c));
    $("[data-del-course]").addEventListener("click",()=>confirmModal("Delete this course and all its sessions, materials and assignments?",async()=>{ await db.remove("courses",c.id); toast("Course deleted"); location.hash="#/courses"; }));
    mount.querySelectorAll("[data-edit-session]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();editSession(c.id,sessions.find(s=>s.id===b.dataset.editSession));}));
    mount.querySelectorAll("[data-del-session]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();confirmModal("Delete this session?",async()=>{await db.remove("sessions",b.dataset.delSession);toast("Session deleted");render();});}));
    mount.querySelectorAll("[data-edit-material]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();editMaterial(c.id,materials.find(m=>m.id===b.dataset.editMaterial));}));
    mount.querySelectorAll("[data-del-material]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();confirmModal("Remove this material?",async()=>{await db.remove("materials",b.dataset.delMaterial);toast("Material removed");render();});}));
  }
}
function sessionRow(s,admin){
  const past=isPast(s.scheduled_at);
  let action="";
  if(s.recording_url) action=`<a class="btn btn--primary btn--sm" href="${esc(s.recording_url)}" target="_blank" rel="noopener">${I.play} Recording</a>`;
  else if(s.join_url && !past) action=`<a class="btn btn--primary btn--sm" href="${esc(s.join_url)}" target="_blank" rel="noopener">Join ${I.ext}</a>`;
  else if(past) action=`<span class="badge closed">Recording soon</span>`;
  return `<div class="rowc">
    <div class="rowc__ic">${s.recording_url?I.play:I.cal}</div>
    <div class="rowc__main"><h4>${esc(s.title)}</h4>
      <div class="sub"><span>${fmtDT(s.scheduled_at)}</span><span>${esc(s.platform||"Zoom")}</span><span>${s.duration_mins||60} min</span></div></div>
    <div class="rowc__act">${action}
      ${admin?`<button class="btn btn--ghost btn--sm" data-edit-session="${s.id}">${I.edit}</button>
      <button class="btn btn--danger btn--sm" data-del-session="${s.id}">${I.trash}</button>`:""}</div></div>`;
}
function materialChip(m,admin){
  return `<span style="display:inline-flex;align-items:center;gap:.3rem">
    <a class="mchip" href="${esc(m.url)}" target="_blank" rel="noopener">${matIcon(m.kind)} ${esc(m.title)}</a>
    ${admin?`<button class="btn btn--ghost btn--sm" data-edit-material="${m.id}" title="Edit">${I.edit}</button>
      <button class="btn btn--danger btn--sm" data-del-material="${m.id}" title="Remove">${I.trash}</button>`:""}</span>`;
}

async function viewAssignments(mount){
  const [assignments,courses]=await Promise.all([db.assignments(),db.courses()]);
  const mine=await db.mySubmissions(Auth.user.id).catch(()=>[]);
  const byId=Object.fromEntries(mine.map(s=>[s.assignment_id,s]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>Assignments</h1><p>Submit your work as a Git repository link.</p></div>
      ${Auth.isAdmin?`<button class="btn btn--primary" data-add>${I.plus} New assignment</button>`:""}</div>
    <div class="stack">${assignments.map(a=>{
      const c=courses.find(x=>x.id===a.course_id); const sub=byId[a.id];
      const overdue=!sub && isPast(a.due_at);
      return `<div class="assign" data-open="${a.id}" style="cursor:pointer">
        <div class="assign__top">
          <div><h3>${esc(a.title)}</h3><div class="course-tag">${c?esc(c.title):"General"}</div></div>
          <div>${statusBadge(sub)}</div>
        </div>
        <p class="brief">${esc((a.brief||"").slice(0,160))}${(a.brief||"").length>160?"…":""}</p>
        <div class="assign__foot">
          <div class="meta">
            <span>Due <b>${fmtDate(a.due_at)}</b></span>
            <span>${a.points} points</span>
            ${overdue?`<span class="badge due">Overdue</span>`:(a.is_open?`<span class="badge open">Open</span>`:`<span class="badge closed">Closed</span>`)}
          </div>
          <span class="btn btn--ghost btn--sm">${sub?"View / update":"Submit work"} ${I.chev}</span>
        </div></div>`;
    }).join("")||emptyBlock("No assignments yet","They'll appear here once published.")}</div>`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.open}`));
  $("[data-add]")?.addEventListener("click",()=>editAssignment(null));
}

async function viewAssignment(mount,r){
  const a=await db.assignment(r.id);
  if(!a){ mount.innerHTML=emptyBlock("Assignment not found",""); return; }
  const courses=await db.courses();
  const c=courses.find(x=>x.id===a.course_id);
  const sub=await db.mySubmission(a.id,Auth.user.id).catch(()=>null);
  const overdue=isPast(a.due_at);

  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All assignments</button>
    <div class="card card--pad">
      <div class="between"><div>
        <div class="course-tag muted" style="font-size:.85rem">${c?esc(c.title):"General"}</div>
        <h1 style="font-family:var(--font-d);font-size:1.6rem;letter-spacing:-.02em;margin:.2rem 0 0">${esc(a.title)}</h1>
      </div><div style="text-align:right">
        <div class="badge ${overdue&&!sub?"due":"open"}">Due ${fmtDate(a.due_at)}</div>
        <div class="muted" style="font-size:.85rem;margin-top:.3rem">${a.points} points</div>
      </div></div>
      <p style="white-space:pre-wrap;color:var(--muted);margin:1rem 0 0">${esc(a.brief||"")}</p>
    </div>

    <div class="section-h"><h2>Your submission</h2></div>
    <div class="card card--pad">
      ${sub?`<div class="between" style="margin-bottom:1rem">
        <div>${statusBadge(sub)}<div class="muted" style="font-size:.85rem;margin-top:.35rem">Submitted ${fmtDT(sub.submitted_at)}</div></div>
        <a class="btn btn--ghost btn--sm" href="${esc(sub.git_url)}" target="_blank" rel="noopener">${I.git} Open repo ${I.ext}</a></div>
        ${sub.feedback?`<div class="card--pad" style="background:var(--paper-2);border-radius:12px;margin-bottom:1rem">
          <b style="font-size:.85rem">Feedback from reviewer</b><p class="muted" style="margin:.3rem 0 0">${esc(sub.feedback)}</p></div>`:""}`:""}
      <form data-sform>
        <div class="field"><label>Git repository link <span class="hint">Public GitHub / GitLab URL</span></label>
          <input class="input" name="git" type="url" placeholder="https://github.com/you/ascend-you" value="${esc(sub?.git_url||"")}"/></div>
        <div class="field"><label>Notes for reviewer <span class="hint">optional</span></label>
          <textarea name="notes" placeholder="Anything the reviewer should know…">${esc(sub?.notes||"")}</textarea></div>
        <button class="btn btn--primary" data-submit>${sub?"Update submission":"Submit work"}</button>
      </form>
    </div>`;
  $("[data-back]").addEventListener("click",()=>location.hash="#/assignments");
  $("[data-submit]").addEventListener("click", async (e)=>{
    e.preventDefault();
    const f=$("[data-sform]"); const git=f.elements.git.value.trim();
    if(!git){ toast("Add your Git repository link","err"); f.elements.git.focus(); return; }
    if(!/^https?:\/\/.+/i.test(git)){ toast("That doesn't look like a valid URL","err"); return; }
    const btn=$("[data-submit]"); btn.disabled=true; btn.textContent="Submitting…";
    try{ await db.submit({assignment_id:a.id,user_id:Auth.user.id,git_url:git,notes:f.elements.notes.value.trim()}); toast("Submission saved"); render(); }
    catch(err){ toast(err.message||"Couldn't submit","err"); btn.disabled=false; btn.textContent=sub?"Update submission":"Submit work"; }
  });
}

async function viewMySubmissions(mount){
  const [subs,assignments]=await Promise.all([db.mySubmissions(Auth.user.id),db.assignments()]);
  const byId=Object.fromEntries(assignments.map(a=>[a.id,a]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>My submissions</h1><p>Every assignment you've turned in and its status.</p></div></div>
    ${subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Assignment</th><th>Repository</th><th>Submitted</th><th>Status</th><th>Grade</th></tr></thead>
      <tbody>${subs.map(s=>{const a=byId[s.assignment_id]||{};return `<tr data-open="${s.assignment_id}" style="cursor:pointer">
        <td class="who">${esc(a.title||"—")}</td>
        <td><a class="git" href="${esc(s.git_url)}" target="_blank" rel="noopener">${esc(s.git_url)}</a></td>
        <td>${fmtDate(s.submitted_at)}</td>
        <td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("Nothing submitted yet","Head to Assignments to turn in your first piece of work.")}`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.open}`));
}

async function viewProfile(mount){
  const p=Auth.profile||{};
  mount.innerHTML=`
    <div class="page-h"><div><h1>Profile</h1><p>Your account details.</p></div></div>
    <div class="card card--pad" style="max-width:520px">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.3rem">
        <div class="av" style="width:56px;height:56px;border-radius:14px;font-size:1.3rem">${esc(initials(p.full_name))}</div>
        <div><div style="font-family:var(--font-d);font-weight:600;font-size:1.2rem">${esc(p.full_name||"You")}</div>
          <div>${Auth.isAdmin?`<span class="badge admin">Administrator</span>`:`<span class="badge closed">Staff</span>`}</div></div>
      </div>
      <form data-pform>
        <div class="field"><label>Full name</label><input class="input" name="full_name" value="${esc(p.full_name||"")}"/></div>
        <div class="field"><label>Team <span class="hint">optional</span></label><input class="input" name="team" value="${esc(p.team||"")}"/></div>
        <div class="field"><label>Email</label><input class="input" value="${esc(p.email||"")}" disabled/></div>
        <button class="btn btn--primary" data-save>Save changes</button>
      </form>
    </div>`;
  $("[data-save]").addEventListener("click",async e=>{
    e.preventDefault();
    const f=$("[data-pform]");
    const patch={full_name:f.elements.full_name.value.trim(),team:f.elements.team.value.trim()};
    try{ await db.update("profiles",p.id,patch); Auth.profile={...p,...patch}; toast("Profile updated"); render(); }
    catch(err){ toast(err.message,"err"); }
  });
}

/* ------------------------------------------------------------- ADMIN */
async function viewAdmin(mount,r){
  if(!Auth.isAdmin){ mount.innerHTML=emptyBlock("Admins only","You don't have access to this page."); return; }
  const tab=r.sub||"overview";
  mount.innerHTML=`
    <div class="page-h"><div><h1>Manage programme</h1><p>Curate courses, assignments and review submissions.</p></div></div>
    <div class="tabs">
      ${["overview","courses","assignments","review","people"].map(t=>`<button data-tab="${t}" class="${t===tab?"active":""}">${({overview:"Overview",courses:"Courses & content",assignments:"Assignments",review:"Review work",people:"People"})[t]}</button>`).join("")}
    </div>
    <div id="adminbody"><div class="spinner"></div></div>`;
  mount.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>location.hash=`#/admin/${b.dataset.tab}`));
  const body=$("#adminbody");
  const T={overview:adminOverview,courses:adminCourses,assignments:adminAssignments,review:adminReview,people:adminPeople};
  await (T[tab]||adminOverview)(body);
}

async function adminOverview(body){
  const [courses,assignments,people]=await Promise.all([db.courses(),db.assignments(),db.people()]);
  let totalSubs=0;
  for(const a of assignments){ const s=await db.submissionsFor(a.id); totalSubs+=s.length; }
  body.innerHTML=`
    <div class="stats">
      <div class="stat"><div class="n navy">${courses.length}</div><div class="l">Courses</div></div>
      <div class="stat"><div class="n violet">${assignments.length}</div><div class="l">Assignments</div></div>
      <div class="stat"><div class="n flame">${totalSubs}</div><div class="l">Submissions</div></div>
      <div class="stat"><div class="n">${people.length}</div><div class="l">Members</div></div>
    </div>
    <div class="section-h"><h2>Quick actions</h2></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="btn btn--primary" data-qc>${I.plus} New course</button>
      <button class="btn btn--ghost" data-qa>${I.plus} New assignment</button>
      <a class="btn btn--ghost" href="#/admin/review">${I.inbox} Review submissions</a>
    </div>`;
  $("[data-qc]").addEventListener("click",()=>editCourse(null));
  $("[data-qa]").addEventListener("click",()=>editAssignment(null));
}

async function adminCourses(body){
  const courses=await db.courses();
  body.innerHTML=`
    <div class="between" style="margin-bottom:1rem"><span class="muted">Open a course to manage its sessions and materials.</span>
      <button class="btn btn--primary btn--sm" data-add>${I.plus} New course</button></div>
    <div class="grid">${courses.map(courseCard).join("")||emptyBlock("No courses","Add your first course.")}</div>`;
  wireCourseOpen(body);
  $("[data-add]").addEventListener("click",()=>editCourse(null));
}

async function adminAssignments(body){
  const [assignments,courses]=await Promise.all([db.assignments(),db.courses()]);
  body.innerHTML=`
    <div class="between" style="margin-bottom:1rem"><span class="muted">Assignments staff submit as Git links.</span>
      <button class="btn btn--primary btn--sm" data-add>${I.plus} New assignment</button></div>
    <div class="tablewrap"><table>
      <thead><tr><th>Assignment</th><th>Course</th><th>Due</th><th>Status</th><th></th></tr></thead>
      <tbody>${assignments.map(a=>{const c=courses.find(x=>x.id===a.course_id);
        return `<tr><td class="who">${esc(a.title)}</td><td>${c?esc(c.title):"General"}</td>
          <td>${fmtDate(a.due_at)}</td><td>${a.is_open?`<span class="badge open">Open</span>`:`<span class="badge closed">Closed</span>`}</td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn btn--ghost btn--sm" data-edit="${a.id}">${I.edit}</button>
            <button class="btn btn--danger btn--sm" data-del="${a.id}">${I.trash}</button></td></tr>`;
      }).join("")||`<tr><td colspan="5"><div class="empty">${I.clip}<h3>No assignments</h3></div></td></tr>`}</tbody>
    </table></div>`;
  $("[data-add]").addEventListener("click",()=>editAssignment(null));
  body.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editAssignment(assignments.find(a=>a.id===b.dataset.edit))));
  body.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>confirmModal("Delete this assignment and its submissions?",async()=>{await db.remove("assignments",b.dataset.del);toast("Assignment deleted");render();})));
}

async function adminReview(body){
  const [assignments,courses,people]=await Promise.all([db.assignments(),db.courses(),db.people()]);
  const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
  body.innerHTML=`
    <div class="field" style="max-width:420px"><label>Choose an assignment</label>
      <select class="input" data-pick>${assignments.map(a=>`<option value="${a.id}">${esc(a.title)}</option>`).join("")}</select></div>
    <div id="revbody"></div>`;
  const pick=$("[data-pick]");
  const load=async ()=>{
    const aid=pick.value; const subs=await db.submissionsFor(aid);
    $("#revbody").innerHTML = subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Member</th><th>Repository</th><th>Submitted</th><th>Status</th><th>Grade</th><th></th></tr></thead>
      <tbody>${subs.map(s=>{const p=pmap[s.user_id]||{};return `<tr>
        <td class="who">${esc(p.full_name||s.user_id)}<div class="muted" style="font-weight:400;font-size:.8rem">${esc(p.email||"")}</div></td>
        <td><a class="git" href="${esc(s.git_url)}" target="_blank" rel="noopener">${esc(s.git_url)}</a></td>
        <td>${fmtDate(s.submitted_at)}</td><td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td>
        <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-rev="${s.id}">Review</button></td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("No submissions yet","No one has submitted this assignment.");
    $("#revbody").querySelectorAll("[data-rev]").forEach(b=>b.addEventListener("click",()=>reviewSubmission(subs.find(s=>s.id===b.dataset.rev),pmap,load)));
  };
  pick.addEventListener("change",load); await load();
}
function reviewSubmission(s,pmap,after){
  const p=pmap[s.user_id]||{};
  openModal({title:`Review — ${p.full_name||"Member"}`,wide:true,bodyHTML:`
    <a class="mchip" href="${esc(s.git_url)}" target="_blank" rel="noopener" style="margin-bottom:1rem">${I.git} ${esc(s.git_url)}</a>
    ${s.notes?`<p class="muted"><b>Their notes:</b> ${esc(s.notes)}</p>`:""}
    <form data-rf>
      <div class="row2">
        <div class="field"><label>Status</label><select class="input" name="status">
          ${["submitted","reviewed","returned"].map(o=>`<option value="${o}" ${s.status===o?"selected":""}>${o[0].toUpperCase()+o.slice(1)}</option>`).join("")}</select></div>
        <div class="field"><label>Grade <span class="hint">out of 100</span></label><input class="input" type="number" name="grade" value="${s.grade??""}" min="0" max="100"/></div>
      </div>
      <div class="field"><label>Feedback</label><textarea name="feedback" placeholder="What was strong, what to improve…">${esc(s.feedback||"")}</textarea></div>
    </form>`,
    footerHTML:`<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--primary" data-save>Save review</button>`});
  $("[data-cancel]").addEventListener("click",closeModal);
  $("[data-save]").addEventListener("click",async()=>{
    const f=$("[data-rf]");
    try{ await db.review(s.id,{status:f.elements.status.value,grade:f.elements.grade.value===""?null:Number(f.elements.grade.value),feedback:f.elements.feedback.value.trim()}); toast("Review saved"); closeModal(); after(); }
    catch(e){ toast(e.message,"err"); }
  });
}

async function adminPeople(body){
  const people=await db.people();
  body.innerHTML=`<div class="tablewrap"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Team</th><th>Role</th><th></th></tr></thead>
    <tbody>${people.map(p=>`<tr>
      <td class="who">${esc(p.full_name||"—")}</td><td>${esc(p.email||"")}</td><td>${esc(p.team||"—")}</td>
      <td>${p.role==="admin"?`<span class="badge admin">Admin</span>`:`<span class="badge closed">Staff</span>`}</td>
      <td style="text-align:right">${p.id===Auth.user.id?`<span class="muted" style="font-size:.8rem">You</span>`:
        `<button class="btn btn--ghost btn--sm" data-role="${p.id}" data-to="${p.role==="admin"?"staff":"admin"}">${p.role==="admin"?"Make staff":"Make admin"}</button>`}</td></tr>`).join("")}</tbody>
  </table></div>`;
  body.querySelectorAll("[data-role]").forEach(b=>b.addEventListener("click",async()=>{
    try{ await db.setRole(b.dataset.role,b.dataset.to); toast(`Role updated to ${b.dataset.to}`); render(); }catch(e){ toast(e.message,"err"); }
  }));
}

/* ---- admin editors (create/update via generic form modal) ---- */
function editCourse(c){
  formModal({title:c?"Edit course":"New course", submitLabel:c?"Save":"Create course",
    fields:[
      {name:"title",label:"Course title",required:true,placeholder:"Git & Version Control Fundamentals"},
      {name:"summary",label:"Summary",type:"textarea",placeholder:"One or two lines about this course."},
      {row:[{name:"instructor",label:"Instructor",placeholder:"C-DAC Faculty"},
            {name:"accent",label:"Colour",type:"select",options:[{value:"navy",label:"Navy"},{value:"violet",label:"Violet"},{value:"flame",label:"Flame"},{value:"teal",label:"Teal"}]}]},
    ], values:c||{accent:"navy",instructor:"C-DAC Faculty"},
    onSubmit:async(d)=>{ if(c) await db.update("courses",c.id,d); else await db.create("courses",{...d,is_published:true,sort_order:Date.now()}); toast(c?"Course saved":"Course created"); render(); }});
}
function editSession(courseId,s){
  formModal({title:s?"Edit session":"Add session", submitLabel:s?"Save":"Add session", wide:true,
    fields:[
      {name:"title",label:"Session title",required:true,placeholder:"Branching & Merging in Practice"},
      {name:"description",label:"Description",type:"textarea"},
      {row:[{name:"scheduled_at",label:"Date & time",type:"datetime"},{name:"duration_mins",label:"Duration (min)",type:"number",placeholder:"60"}]},
      {row:[{name:"platform",label:"Platform",placeholder:"Zoom"},{name:"join_url",label:"Live join link",placeholder:"https://zoom.us/j/…"}]},
      {name:"recording_url",label:"Recording link",hint:"add after the class",placeholder:"https://…"},
    ], values:s||{platform:"Zoom",duration_mins:60},
    onSubmit:async(d)=>{ d.course_id=courseId; if(s) await db.update("sessions",s.id,d); else await db.create("sessions",{...d,sort_order:Date.now()}); toast(s?"Session saved":"Session added"); render(); }});
}
function editMaterial(courseId,m){
  formModal({title:m?"Edit material":"Add material", submitLabel:m?"Save":"Add material",
    fields:[
      {name:"title",label:"Title",required:true,placeholder:"Session 1 slides"},
      {name:"url",label:"Link",required:true,placeholder:"https://…  (Drive, PDF, repo…)"},
      {name:"kind",label:"Type",type:"select",options:[{value:"link",label:"Link"},{value:"slides",label:"Slides"},{value:"doc",label:"Document"},{value:"code",label:"Code / repo"},{value:"video",label:"Video"}]},
    ], values:m||{kind:"link"},
    onSubmit:async(d)=>{ d.course_id=courseId; if(m) await db.update("materials",m.id,d); else await db.create("materials",d); toast(m?"Material saved":"Material added"); render(); }});
}
async function editAssignment(a){
  const courses=await db.courses();
  formModal({title:a?"Edit assignment":"New assignment", submitLabel:a?"Save":"Create assignment", wide:true,
    fields:[
      {name:"title",label:"Title",required:true,placeholder:"Set up your Git repository"},
      {name:"brief",label:"Brief",type:"textarea",placeholder:"What to do, and what to submit."},
      {row:[{name:"course_id",label:"Course",type:"select",options:[{value:"",label:"— General —"},...courses.map(c=>({value:c.id,label:c.title}))]},
            {name:"due_at",label:"Due date",type:"datetime"}]},
      {row:[{name:"points",label:"Points",type:"number",placeholder:"100"},
            {name:"is_open",label:"Accepting submissions",type:"select",options:[{value:"true",label:"Open"},{value:"false",label:"Closed"}]}]},
    ], values:a?{...a,is_open:String(a.is_open)}:{points:100,is_open:"true"},
    onSubmit:async(d)=>{ d.is_open=d.is_open==="true"; if(!d.course_id) d.course_id=null;
      if(a) await db.update("assignments",a.id,d); else await db.create("assignments",d); toast(a?"Assignment saved":"Assignment created"); render(); }});
}

/* =============================================================== BOOT */
window.addEventListener("hashchange", render);
(async()=>{ await Auth.init(); render(); })();

})();
