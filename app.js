/* =====================================================================
   ASCEND 2026 — application  (v2)
   Vanilla JS single-page app. Talks to Supabase; falls back to a demo
   store (seeded sample data) when credentials aren't configured yet.

   Roles:  staff (executive / upskilling) · trainer (faculty) · admin
   Modules: courses · sessions & recordings · faculty notes · materials ·
            assignments · practice quizzes · capstone project.
   Submissions accept a Git link + Google Drive link + recording link.
   ===================================================================== */
(() => {
"use strict";

const CFG  = window.ASCEND_CONFIG;
const DEMO = window.ASCEND_DEMO;

/* ---------------------------------------------------------------- icons */
const I = {
  peak:`<svg viewBox="0 0 48 48" fill="none"><path d="M6 40 L20 12 L29 27 L35 18 L42 32" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 8 h6 v6" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 20 L42 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  // ASCEND brand logomark — gradient badge with an ascending peak + arrow
  logo:`<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ascLogoGrad" x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse"><stop stop-color="#152a63"/><stop offset=".52" stop-color="#5a2f9e"/><stop offset="1" stop-color="#f2661f"/></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="13" fill="url(#ascLogoGrad)"/><path d="M9 33 L19.5 15.5 L27 26 L32.5 15.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.5 12 H37 V20.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 20 L37 12" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>`,
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
  drive:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3h8l4 7h-8z" opacity=".9"/><path d="M2 17l4-7 4 7z"/><path d="M8 17h12l-2 4H6z"/></svg>`,
  ext:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>`,
  chev:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 6l6 6-6 6"/></svg>`,
  menu:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12l4 4L19 7"/></svg>`,
  award:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h0"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M15 6l-6 6 6 6"/></svg>`,
  note:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>`,
  quiz:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2"/><circle cx="11.5" cy="17.5" r=".6" fill="currentColor"/><rect x="3.5" y="3.5" width="17" height="17" rx="3"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 13v3M9 20h6M10 20l.5-4h3l.5 4"/></svg>`,
  rocket:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 15l-3-3c3-6 8-9 13-9 0 5-3 10-9 13z"/><circle cx="14.5" cy="9.5" r="1.5"/></svg>`,
  teach:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 5h18v11H3z"/><path d="M3 20h18M8 16v4M16 16v4"/><path d="M7 9h7M7 12h4"/></svg>`,
  chat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 17v5M9 3h6l-1 6 3 3H7l3-3z"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>`,
  send:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 12l16-8-6 16-3.5-6.5z"/><path d="M10.5 13.5L20 4"/></svg>`,
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
const isURL = (v) => /^https?:\/\/.+/i.test(v);
const roleLabel = (r) => ({staff:"Executive",trainer:"Trainer",admin:"Administrator"}[r]||"Executive");
// First given name, stripping an honorific like Mr / Ms / Mrs / Dr / Miss.
const firstName = (full) => {
  const parts=String(full||"").trim().replace(/[.,]/g,"").split(/\s+/).filter(Boolean);
  if(parts.length>1 && /^(mr|mrs|ms|miss|dr|shri|smt)$/i.test(parts[0])) parts.shift();
  return parts[0] || "there";
};

// Staff sign in with their employee number; it maps to an internal email.
// (No real mail is sent — this is just the account identifier in Supabase.)
const LOGIN_DOMAIN = "ascend.cdac.in";
const toLoginEmail = (id) => { id=String(id||"").trim(); return id.includes("@") ? id : id.replace(/\s+/g,"") + "@" + LOGIN_DOMAIN; };

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
  if(f.type==="textarea") return `<div class="field">${lbl}<textarea name="${f.name}" rows="${f.rows||4}" placeholder="${esc(f.placeholder||"")}">${esc(v)}</textarea></div>`;
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
  const notes=[
    {id:"n1",course_id:"c1",title:"Welcome note — how ASCEND works",body:"Welcome to ASCEND 2026!\n\n• Watch each session (live or the recording).\n• Read the faculty notes for each topic.\n• Submit assignments as a Git repo link (Drive / recording optional).\n• Try the practice quiz to check your understanding.\n• Finish with the capstone project.\n\nAscend. Empower. Achieve.",attachment_url:"",author:"Programme Office",created_at:"2026-09-01T10:00:00+05:30"},
    {id:"n2",course_id:"c1",title:"Git internals — the object model",body:"A commit points to a tree; a tree points to blobs. Branches are just movable pointers to commits. Understanding this makes merges and rebases far less mysterious.",attachment_url:"https://example.com/git-internals.pdf",author:"C-DAC Faculty",created_at:"2026-09-05T10:00:00+05:30"},
  ];
  const assignments=[
    {id:"a1",course_id:"c1",title:"Set up your Git repository",brief:"Create a public repo named ascend-<your-name>, add a README describing yourself, and submit the repository link.",due_at:"2026-09-08T23:59:00+05:30",points:100,is_open:true},
    {id:"a2",course_id:"c2",title:"Automate a daily report",brief:"Write a Python script that reads a CSV and prints a summary. Submit the repo link and a short recording of it running.",due_at:"2026-09-15T23:59:00+05:30",points:100,is_open:true},
  ];
  const profiles=[
    {id:"u-admin",full_name:"Programme Admin",email:"admin@ascend.cdac.in",role:"admin",team:"L&D",designation:"Programme Office",emp_no:"admin",must_change_password:false},
    {id:"u-trainer",full_name:"Dr. Meera Rao",email:"trainer@ascend.cdac.in",role:"trainer",team:"Faculty",designation:"Module Leader",emp_no:"trainer",must_change_password:false},
    {id:"u-staff",full_name:"Asha Menon",email:"asha@ascend.cdac.in",role:"staff",team:"Kharghar",designation:"Project Engineer",emp_no:"344809",must_change_password:false},
    {id:"u-2",full_name:"Ravi Kulkarni",email:"ravi@ascend.cdac.in",role:"staff",team:"Kharghar",designation:"Project Engineer",must_change_password:false},
    {id:"u-3",full_name:"Priya Nair",email:"priya@ascend.cdac.in",role:"staff",team:"Juhu",designation:"Project Associate",must_change_password:false},
  ];
  const submissions=[
    {id:"sub1",assignment_id:"a1",user_id:"u-2",git_url:"https://github.com/ravi/ascend-ravi",drive_url:"",recording_url:"",notes:"Done!",status:"reviewed",grade:92,feedback:"Great README.",submitted_at:"2026-09-05T10:00:00+05:30"},
    {id:"sub2",assignment_id:"a1",user_id:"u-3",git_url:"https://github.com/priya/ascend-priya",drive_url:"https://drive.google.com/priya",recording_url:"",notes:"",status:"submitted",grade:null,feedback:"",submitted_at:"2026-09-06T12:00:00+05:30"},
  ];
  const quizzes=[
    {id:"qz1",course_id:"c1",title:"Git basics — quick check",description:"A short 3-question quiz on core Git concepts.",pass_pct:60,is_published:true,sort_order:1},
    {id:"qz2",course_id:"c2",title:"Python fundamentals",description:"Warm-up questions on Python syntax and types.",pass_pct:60,is_published:true,sort_order:2},
  ];
  const quiz_questions=[
    {id:"qq1",quiz_id:"qz1",prompt:"Which command creates a new branch and switches to it?",options:["git branch new","git checkout -b new","git switch main","git merge new"],correct_index:1,explanation:"git checkout -b <name> creates the branch and moves onto it in one step.",points:1,sort_order:1},
    {id:"qq2",quiz_id:"qz1",prompt:'What does "git clone" do?',options:["Deletes a repository","Copies a remote repository to your machine","Pushes local commits","Creates a pull request"],correct_index:1,explanation:"Clone downloads a full copy of a remote repository locally.",points:1,sort_order:2},
    {id:"qq3",quiz_id:"qz1",prompt:"A pull request is used to…",options:["Delete branches automatically","Propose and review changes before merging","Rename the repository","Undo the last commit"],correct_index:1,explanation:"PRs let others review your proposed changes before they merge.",points:1,sort_order:3},
    {id:"qq4",quiz_id:"qz2",prompt:"Which of these is a Python list?",options:["{1,2,3}","(1,2,3)","[1,2,3]","<1,2,3>"],correct_index:2,explanation:"Square brackets denote a list.",points:1,sort_order:1},
    {id:"qq5",quiz_id:"qz2",prompt:"What keyword defines a function?",options:["func","def","function","fn"],correct_index:1,explanation:"Python uses the def keyword.",points:1,sort_order:2},
  ];
  const quiz_attempts=[
    {id:"at1",quiz_id:"qz1",user_id:"u-2",score:3,total:3,pct:100,passed:true,answers:[1,1,1],submitted_at:"2026-09-06T09:00:00+05:30"},
  ];
  const capstones=[
    {id:"cap1",title:"ASCEND 2026 Capstone Project",brief:"Apply everything you learned across the programme to build one meaningful project — a tool, automation, or service that solves a real problem in your team.",guidelines:"Deliverables:\n1. A public Git repository with clean, documented code and a README.\n2. A short write-up / slides on Google Drive explaining the problem and your solution.\n3. A recording (5–8 min) demoing the project.\n\nEvaluation: problem clarity, technical execution, documentation, and demo quality.",due_at:"2026-10-31T23:59:00+05:30",points:200,is_open:true,sort_order:1},
  ];
  const capstone_submissions=[
    {id:"cs1",capstone_id:"cap1",user_id:"u-2",project_title:"Auto-roster generator",summary:"A tool that builds duty rosters from a spreadsheet.",git_url:"https://github.com/ravi/roster",drive_url:"https://drive.google.com/roster-slides",recording_url:"https://youtu.be/demo",status:"submitted",grade:null,feedback:"",submitted_at:"2026-10-20T10:00:00+05:30"},
  ];
  const threads=[
    {id:"th1",course_id:"c1",author_id:"u-2",title:"Getting a 'permission denied (publickey)' error on git push",body:"When I try to push to GitHub I get permission denied (publickey). I've created the repo. What am I missing?",is_resolved:true,is_pinned:false,reply_count:2,created_at:"2026-09-05T09:00:00+05:30",updated_at:"2026-09-05T11:00:00+05:30"},
    {id:"th2",course_id:null,author_id:"u-3",title:"Can we submit the assignment as a Google Drive link instead of GitHub?",body:"Some of us are more comfortable with Drive. Is that allowed?",is_resolved:false,is_pinned:true,reply_count:1,created_at:"2026-09-06T10:00:00+05:30",updated_at:"2026-09-06T10:30:00+05:30"},
  ];
  const thread_replies=[
    {id:"rep1",thread_id:"th1",author_id:"u-trainer",body:"You need to add an SSH key to your GitHub account, or use the HTTPS URL instead. For beginners, HTTPS + a personal access token is easiest.",is_answer:true,created_at:"2026-09-05T10:30:00+05:30"},
    {id:"rep2",thread_id:"th1",author_id:"u-2",body:"Switched to HTTPS and it worked. Thanks!",is_answer:false,created_at:"2026-09-05T11:00:00+05:30"},
    {id:"rep3",thread_id:"th2",author_id:"u-trainer",body:"Yes — Git, Google Drive or a recording link all work. At least one is required.",is_answer:true,created_at:"2026-09-06T10:30:00+05:30"},
  ];
  return {uid,courses,sessions,materials,notes,assignments,profiles,submissions,quizzes,quiz_questions,quiz_attempts,capstones,capstone_submissions,threads,thread_replies};
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
  async allSessions(){
    if(DEMO) return [...DemoStore.sessions];
    const {data,error}=await sb.from("sessions").select("*").order("scheduled_at");
    if(error) throw error; return data;
  },
  async materials(courseId){
    if(DEMO) return DemoStore.materials.filter(m=>m.course_id===courseId);
    const {data,error}=await sb.from("materials").select("*").eq("course_id",courseId).order("created_at");
    if(error) throw error; return data;
  },
  async notes(courseId){
    if(DEMO) return DemoStore.notes.filter(n=>!courseId||n.course_id===courseId).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    let q=sb.from("notes").select("*").order("created_at",{ascending:false});
    if(courseId) q=q.eq("course_id",courseId);
    const {data,error}=await q; if(error) throw error; return data;
  },
  async allNotes(){ return this.notes(null); },
  async note(id){
    if(DEMO) return DemoStore.notes.find(n=>n.id===id)||null;
    const {data,error}=await sb.from("notes").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async session(id){
    if(DEMO) return DemoStore.sessions.find(s=>s.id===id)||null;
    const {data,error}=await sb.from("sessions").select("*").eq("id",id).single();
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
  async allSubmissions(){
    if(DEMO) return [...DemoStore.submissions];
    const {data,error}=await sb.from("submissions").select("*").order("submitted_at",{ascending:false});
    if(error) throw error; return data;
  },
  async submit({assignment_id,user_id,git_url,drive_url,recording_url,notes}){
    const payload={git_url:git_url||"",drive_url:drive_url||"",recording_url:recording_url||"",notes:notes||"",status:"submitted",submitted_at:new Date().toISOString()};
    if(DEMO){
      let ex=DemoStore.submissions.find(s=>s.assignment_id===assignment_id && s.user_id===user_id);
      if(ex){ Object.assign(ex,payload); return ex; }
      const row={id:DemoStore.uid("sub"),assignment_id,user_id,grade:null,feedback:"",...payload};
      DemoStore.submissions.push(row); return row;
    }
    const {data,error}=await sb.from("submissions").upsert(
      {assignment_id,user_id,...payload},{onConflict:"assignment_id,user_id"}).select().single();
    if(error) throw error; return data;
  },
  async review(id,{status,grade,feedback}){
    if(DEMO){ const s=DemoStore.submissions.find(x=>x.id===id); Object.assign(s,{status,grade,feedback,reviewed_at:new Date().toISOString()}); return s; }
    const {data,error}=await sb.from("submissions").update({status,grade,feedback,reviewed_at:new Date().toISOString()}).eq("id",id).select().single();
    if(error) throw error; return data;
  },
  /* ---- quizzes ---- */
  async quizzes(){
    if(DEMO) return [...DemoStore.quizzes].sort((a,b)=>a.sort_order-b.sort_order);
    const {data,error}=await sb.from("quizzes").select("*").order("sort_order");
    if(error) throw error; return data;
  },
  async quiz(id){
    if(DEMO) return DemoStore.quizzes.find(q=>q.id===id);
    const {data,error}=await sb.from("quizzes").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async quizQuestions(quizId){
    if(DEMO) return DemoStore.quiz_questions.filter(q=>q.quiz_id===quizId).sort((a,b)=>a.sort_order-b.sort_order);
    const {data,error}=await sb.from("quiz_questions").select("*").eq("quiz_id",quizId).order("sort_order");
    if(error) throw error; return data;
  },
  async myAttempts(userId){
    if(DEMO) return DemoStore.quiz_attempts.filter(a=>a.user_id===userId);
    const {data,error}=await sb.from("quiz_attempts").select("*").eq("user_id",userId).order("submitted_at",{ascending:false});
    if(error) throw error; return data;
  },
  async attemptsFor(quizId){
    if(DEMO) return DemoStore.quiz_attempts.filter(a=>a.quiz_id===quizId);
    const {data,error}=await sb.from("quiz_attempts").select("*").eq("quiz_id",quizId);
    if(error) throw error; return data;
  },
  async saveAttempt(row){
    if(DEMO){ const r={id:DemoStore.uid("at"),...row}; DemoStore.quiz_attempts.push(r); return r; }
    const {data,error}=await sb.from("quiz_attempts").insert(row).select().single();
    if(error) throw error; return data;
  },
  /* ---- capstone ---- */
  async capstones(){
    if(DEMO) return [...DemoStore.capstones].sort((a,b)=>a.sort_order-b.sort_order);
    const {data,error}=await sb.from("capstones").select("*").order("sort_order");
    if(error) throw error; return data;
  },
  async capstone(id){
    if(DEMO) return DemoStore.capstones.find(c=>c.id===id);
    const {data,error}=await sb.from("capstones").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async myCapstone(capId,userId){
    if(DEMO) return DemoStore.capstone_submissions.find(s=>s.capstone_id===capId && s.user_id===userId)||null;
    const {data,error}=await sb.from("capstone_submissions").select("*").eq("capstone_id",capId).eq("user_id",userId).maybeSingle();
    if(error) throw error; return data;
  },
  async capSubmissionsFor(capId){
    if(DEMO) return DemoStore.capstone_submissions.filter(s=>s.capstone_id===capId);
    const {data,error}=await sb.from("capstone_submissions").select("*").eq("capstone_id",capId).order("submitted_at");
    if(error) throw error; return data;
  },
  async submitCapstone({capstone_id,user_id,project_title,summary,git_url,drive_url,recording_url}){
    const payload={project_title:project_title||"",summary:summary||"",git_url:git_url||"",drive_url:drive_url||"",recording_url:recording_url||"",status:"submitted",submitted_at:new Date().toISOString()};
    if(DEMO){
      let ex=DemoStore.capstone_submissions.find(s=>s.capstone_id===capstone_id && s.user_id===user_id);
      if(ex){ Object.assign(ex,payload); return ex; }
      const row={id:DemoStore.uid("cs"),capstone_id,user_id,grade:null,feedback:"",...payload};
      DemoStore.capstone_submissions.push(row); return row;
    }
    const {data,error}=await sb.from("capstone_submissions").upsert(
      {capstone_id,user_id,...payload},{onConflict:"capstone_id,user_id"}).select().single();
    if(error) throw error; return data;
  },
  async reviewCapstone(id,{status,grade,feedback}){
    if(DEMO){ const s=DemoStore.capstone_submissions.find(x=>x.id===id); Object.assign(s,{status,grade,feedback,reviewed_at:new Date().toISOString()}); return s; }
    const {data,error}=await sb.from("capstone_submissions").update({status,grade,feedback,reviewed_at:new Date().toISOString()}).eq("id",id).select().single();
    if(error) throw error; return data;
  },
  /* ---- forum ---- */
  async threads(){
    if(DEMO) return [...DemoStore.threads].sort((a,b)=> (b.is_pinned-a.is_pinned) || (new Date(b.updated_at)-new Date(a.updated_at)));
    const {data,error}=await sb.from("threads").select("*").order("is_pinned",{ascending:false}).order("updated_at",{ascending:false});
    if(error) throw error; return data;
  },
  async thread(id){
    if(DEMO) return DemoStore.threads.find(t=>t.id===id);
    const {data,error}=await sb.from("threads").select("*").eq("id",id).single();
    if(error) throw error; return data;
  },
  async threadReplies(threadId){
    if(DEMO) return DemoStore.thread_replies.filter(r=>r.thread_id===threadId).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    const {data,error}=await sb.from("thread_replies").select("*").eq("thread_id",threadId).order("created_at");
    if(error) throw error; return data;
  },
  async createThread({course_id,title,body}){
    const row={course_id:course_id||null,author_id:Auth.user.id,title,body:body||"",updated_at:new Date().toISOString()};
    if(DEMO){ const r={id:DemoStore.uid("th"),is_resolved:false,is_pinned:false,reply_count:0,created_at:new Date().toISOString(),...row}; DemoStore.threads.push(r); return r; }
    const {data,error}=await sb.from("threads").insert(row).select().single(); if(error) throw error; return data;
  },
  async createReply({thread_id,body}){
    const row={thread_id,author_id:Auth.user.id,body};
    if(DEMO){ const r={id:DemoStore.uid("rep"),is_answer:false,created_at:new Date().toISOString(),...row}; DemoStore.thread_replies.push(r);
      const t=DemoStore.threads.find(x=>x.id===thread_id); if(t){ t.reply_count++; t.updated_at=new Date().toISOString(); } return r; }
    const {data,error}=await sb.from("thread_replies").insert(row).select().single(); if(error) throw error; return data;
  },

  /* ---- people ---- */
  async people(){
    if(DEMO) return [...DemoStore.profiles];
    const {data,error}=await sb.from("profiles").select("*").order("full_name");
    if(error) throw error; return data;
  },
  async setRole(id,role){
    if(DEMO){ DemoStore.profiles.find(p=>p.id===id).role=role; return; }
    const {error}=await sb.from("profiles").update({role}).eq("id",id); if(error) throw error;
  },
  // generic manager create/update/delete
  async create(table,row){
    if(DEMO){ const r={id:DemoStore.uid(table),created_at:new Date().toISOString(),...row}; DemoStore[table].push(r); return r; }
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
  get role(){ return this.profile?.role || "staff"; },
  get isAdmin(){ return this.role==="admin"; },
  get isTrainer(){ return this.role==="trainer"; },
  get isStaff(){ return this.role==="staff"; },
  get canManage(){ return this.role==="trainer" || this.role==="admin"; }, // content managers
  async init(){
    if(DEMO) return; // demo starts logged-out
    const {data}=await sb.auth.getSession();
    if(data.session){ this.user=data.session.user; this.profile=await db.profile(this.user.id); }
    // Defer all work out of the callback — doing async/auth calls *inside* it
    // deadlocks supabase-js's auth lock (updateUser would hang forever).
    sb.auth.onAuthStateChange((_e,session)=>{
      setTimeout(async ()=>{
        if(session?.user){ this.user=session.user; try{ this.profile=await db.profile(this.user.id);}catch{} }
        else { this.user=null; this.profile=null; }
        render();
      },0);
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
  async changePassword(newPassword){
    if(DEMO){ return; } // nothing to persist in demo mode
    const {error}=await sb.auth.updateUser({password:newPassword});
    if(error) throw error;
  },
  async signOut(){
    if(DEMO){ this.user=null; this.profile=null; location.hash="#/"; render(); return; }
    await sb.auth.signOut();
  },
  demoEnter(role){
    const id = role==="admin"?"u-admin" : role==="trainer"?"u-trainer" : "u-staff";
    this.user={id};
    this.profile=DemoStore.profiles.find(p=>p.id===id);
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
  if(!DEMO && Auth.profile?.must_change_password){ renderPasswordGate(root); return; }
  renderShell(root);
  const mount=$("#view");
  const r=route();
  mount.innerHTML=`<div class="spinner"></div>`;
  try{
    const map={
      dashboard:viewDashboard, courses:viewCourses, course:viewCourse,
      notes:viewNotes, note:viewNote, prereq:viewPrereq,
      assignments:viewAssignments, assignment:viewAssignment,
      quizzes:viewQuizzes, quiz:viewQuiz,
      playground:viewPlayground,
      capstone:viewCapstone,
      schedule:viewSchedule, recordings:viewRecordings, session:viewSession,
      forum:viewForum, thread:viewThread,
      submissions:viewMySubmissions, review:viewReview,
      profile:viewProfile, admin:viewAdmin,
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
          <div class="auth__tag">Staff training &amp; upskilling. Watch sessions, read faculty notes, take quizzes, and submit your work — all in one place.</div>
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
          <div class="mark" style="margin-bottom:1.3rem;gap:.6rem"><span class="auth__logo">${I.logo}</span><span class="wordmark" style="font-size:1.5rem">ASCEND 2026</span></div>
          <h1 style="font-family:var(--font-d);font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .2rem">${mode==="signin"?"Sign in":"Create your account"}</h1>
          <p class="muted" style="margin:0 0 1.2rem">${mode==="signin"?"Staff: sign in with your employee number.":"Use your official email to join the programme."}</p>
          ${DEMO?`<div class="demo-flag" style="margin-bottom:1rem">${I.alert} Demo mode — Supabase not configured yet</div>`:""}
          <form data-af>
            ${mode==="signup"?`<div class="field"><label>Full name</label><input class="input" name="name" placeholder="Asha Menon" autocomplete="name"/></div>`:""}
            ${mode==="signin"
              ?`<div class="field"><label>Employee number <span class="hint">or email</span></label><input class="input" name="email" type="text" placeholder="e.g. 344809" autocomplete="username"/></div>`
              :`<div class="field"><label>Email</label><input class="input" name="email" type="email" placeholder="you@cdac.in" autocomplete="email"/></div>`}
            <div class="field"><label>Password</label><input class="input" name="password" type="password" placeholder="••••••••" autocomplete="${mode==="signin"?"current-password":"new-password"}"/></div>
            <button class="btn btn--primary" data-go style="width:100%;margin-top:.3rem">${mode==="signin"?"Sign in":"Create account"}</button>
          </form>
          ${mode==="signin"&&!DEMO?`<p class="muted" style="font-size:.8rem;margin:.8rem 0 0">First time? Default password is <b>ascend123</b> — you'll set your own right after signing in.</p>`:""}
          ${DEMO?`<div class="muted" style="font-size:.8rem;margin:.9rem 0 .4rem">Preview a dashboard →</div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="btn btn--ghost btn--sm" data-demo="staff" style="flex:1">Executive</button>
            <button class="btn btn--ghost btn--sm" data-demo="trainer" style="flex:1">Trainer</button>
            <button class="btn btn--ghost btn--sm" data-demo="admin" style="flex:1">Admin</button></div>`:""}
          <div class="auth__switch">${mode==="signin"?"New here?":"Already have an account?"}
            <button data-switch>${mode==="signin"?"Create an account":"Sign in"}</button></div>
        </div>
      </div>
    </div>`;
    $("[data-switch]").addEventListener("click",()=>{ mode=mode==="signin"?"signup":"signin"; paint(); });
    if(DEMO) root.querySelectorAll("[data-demo]").forEach(b=>b.addEventListener("click",()=>Auth.demoEnter(b.dataset.demo)));
    $("[data-go]").addEventListener("click", async (e)=>{
      e.preventDefault();
      const f=$("[data-af]"); const idInput=f.elements.email.value.trim(); const password=f.elements.password.value;
      const name=f.elements.name?f.elements.name.value.trim():"";
      if(!idInput||!password){ toast(mode==="signin"?"Enter your employee number and password":"Enter your email and password","err"); return; }
      const btn=$("[data-go]"); btn.disabled=true; btn.textContent="Please wait…";
      try{
        if(mode==="signup"){ await Auth.signUp(name,idInput,password); toast("Account created — check your email to confirm, then sign in."); mode="signin"; paint(); }
        else{ await Auth.signIn(toLoginEmail(idInput),password); }
      }catch(err){ toast(err.message||"Sign-in failed — check your employee number and password","err"); btn.disabled=false; btn.textContent=mode==="signin"?"Sign in":"Create account"; }
    });
  };
  paint();
}

/* --------------------------------------------- forced first-login change */
function renderPasswordGate(root){
  const first=firstName(Auth.profile?.full_name);
  root.innerHTML=`
    <div class="gate">
      <div class="gate__card">
        <div class="mark" style="margin-bottom:1.1rem;gap:.6rem"><span class="auth__logo">${I.logo}</span><span class="wordmark" style="font-size:1.35rem">ASCEND 2026</span></div>
        <h1 style="font-family:var(--font-d);font-size:1.4rem;letter-spacing:-.02em;margin:0 0 .2rem">Set your password</h1>
        <p class="muted" style="margin:0 0 1.2rem">Welcome, ${esc(Auth.profile?.full_name||"")}. For your security, please replace the default password before you continue.</p>
        <form data-gform>
          <div class="field"><label>New password <span class="hint">at least 6 characters</span></label>
            <input class="input" name="p1" type="password" placeholder="••••••••" autocomplete="new-password"/></div>
          <div class="field"><label>Confirm new password</label>
            <input class="input" name="p2" type="password" placeholder="••••••••" autocomplete="new-password"/></div>
          <button class="btn btn--primary" data-set style="width:100%;margin-top:.3rem">Save &amp; continue</button>
        </form>
        <button class="btn btn--ghost btn--sm" data-signout style="margin-top:.8rem;width:100%">Sign out</button>
      </div>
    </div>`;
  $("[data-signout]").addEventListener("click",()=>Auth.signOut());
  $("[data-set]").addEventListener("click", async (e)=>{
    e.preventDefault();
    const f=$("[data-gform]"); const p1=f.elements.p1.value, p2=f.elements.p2.value;
    if(p1.length<6){ toast("Password must be at least 6 characters","err"); return; }
    if(p1!==p2){ toast("The two passwords don't match","err"); return; }
    if(p1==="ascend123"){ toast("Please choose a password different from the default","err"); return; }
    const btn=$("[data-set]"); btn.disabled=true; btn.textContent="Saving…";
    try{
      await Auth.changePassword(p1);
      try{ await db.update("profiles",Auth.profile.id,{must_change_password:false}); }catch(_){}
      Auth.profile.must_change_password=false;
      toast("Password updated — welcome to ASCEND!");
      setTimeout(()=>location.reload(), 500);   // clean reload into the app
    }catch(err){ toast(err.message||"Couldn't update password","err"); btn.disabled=false; btn.textContent="Save & continue"; }
  });
}

/* -------------------------------------------------------- app shell */
function navForRole(){
  const base=[
    {name:"dashboard",label:"Dashboard",icon:I.dash},
    {name:"courses",label:"Courses",icon:I.book},
    {name:"schedule",label:"Schedule",icon:I.cal},
    {name:"recordings",label:"Recordings",icon:I.play},
    {name:"prereq",label:"Prerequisites",icon:I.book},
    {name:"notes",label:"Faculty notes",icon:I.note},
    {name:"assignments",label:"Assignments",icon:I.clip},
    {name:"quizzes",label:"Practice quizzes",icon:I.quiz},
    {name:"playground",label:"Python playground",icon:I.git},
    {name:"capstone",label:"Capstone project",icon:I.rocket},
    {name:"forum",label:"Discussion forum",icon:I.chat},
  ];
  const staffExtra=[{name:"submissions",label:"My submissions",icon:I.inbox}];
  const mgrExtra=[{name:"review",label:"Review work",icon:I.inbox}];
  const learning = Auth.canManage ? [...base, ...mgrExtra] : [...base, ...staffExtra];
  const admin = Auth.isAdmin ? [{name:"admin",label:"Manage people",icon:I.award}] : [];
  return {learning, admin};
}
function renderShell(root){
  const p=Auth.profile||{};
  const {learning, admin}=navForRole();
  const nav=(items)=>items.map(n=>`<a href="#/${n.name}" data-nav="${n.name}">${n.icon}<span>${n.label}</span></a>`).join("");
  root.innerHTML=`
  <div class="app" id="app">
    <div class="scrim" data-scrim-close></div>
    <aside class="side">
      <div class="side__brand">
        <div class="side__logo">${I.logo}</div>
        <div><div class="wm">ASCEND</div><div class="sub">2026 · C-DAC MUMBAI</div></div>
      </div>
      <div class="side__group">${Auth.canManage?"Programme":"Learning"}</div>
      <nav class="nav">${nav(learning)}
        ${admin.length?`<div class="side__group" style="margin-top:.6rem">Admin</div>${nav(admin)}`:""}
        <div class="side__group" style="margin-top:.6rem">Account</div>
        <a href="#/profile" data-nav="profile">${I.user}<span>Profile</span></a>
        <a href="#" data-signout-nav>${I.logout}<span>Sign out</span></a>
      </nav>
      <div class="side__user">
        <div class="av">${esc(initials(p.full_name))}</div>
        <div style="min-width:0"><div class="nm">${esc(p.full_name||"You")}</div>
          <div class="rl">${roleLabel(Auth.role)}</div></div>
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
  $("[data-signout-nav]")?.addEventListener("click",(e)=>{ e.preventDefault(); Auth.signOut(); });
  const app=$("#app");
  $("[data-burger]")?.addEventListener("click",()=>app.dataset.open=app.dataset.open==="1"?"0":"1");
  $("[data-scrim-close]")?.addEventListener("click",()=>app.dataset.open="0");
  root.querySelectorAll("[data-nav]").forEach(a=>a.addEventListener("click",()=>{ app.dataset.open="0"; }));
}
function markActiveNav(name){
  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===name));
}

/* helper components */
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
// Render the submission links (git / drive / recording) as chips.
function linkChips(s){
  const out=[];
  if(s.git_url)       out.push(`<a class="mchip" href="${esc(s.git_url)}" target="_blank" rel="noopener">${I.git} Git repo ${I.ext}</a>`);
  if(s.drive_url)     out.push(`<a class="mchip" href="${esc(s.drive_url)}" target="_blank" rel="noopener">${I.drive} Drive ${I.ext}</a>`);
  if(s.recording_url) out.push(`<a class="mchip" href="${esc(s.recording_url)}" target="_blank" rel="noopener">${I.play} Recording ${I.ext}</a>`);
  return out.length?`<div class="chips">${out.join("")}</div>`:`<span class="muted">No links</span>`;
}
function emptyBlock(title,sub,icon){ return `<div class="empty">${icon||I.book}<h3>${esc(title)}</h3><p>${esc(sub)}</p></div>`; }
function wireCourseOpen(mount){ mount.querySelectorAll("[data-open-course]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/course/${el.dataset.openCourse}`)); }

/* =============================================================== DASHBOARDS */
async function viewDashboard(mount){
  if(Auth.isAdmin)   return dashAdmin(mount);
  if(Auth.isTrainer) return dashTrainer(mount);
  return dashStaff(mount);
}

/* ---- Executive / staff dashboard ---- */
async function dashStaff(mount){
  const [courses,assignments,quizzes,capstones]=await Promise.all([db.courses(),db.assignments(),db.quizzes(),db.capstones()]);
  const [mine,attempts]=await Promise.all([db.mySubmissions(Auth.user.id).catch(()=>[]),db.myAttempts(Auth.user.id).catch(()=>[])]);
  const submittedIds=new Set(mine.map(m=>m.assignment_id));
  const pending=assignments.filter(a=>a.is_open && !submittedIds.has(a.id));
  const cap=capstones[0];
  const myCap=cap?await db.myCapstone(cap.id,Auth.user.id).catch(()=>null):null;
  let upcoming=null;
  const allS=await db.allSessions().catch(()=>[]);
  for(const s of allS){ if(s.scheduled_at && !isPast(s.scheduled_at)){ if(!upcoming||new Date(s.scheduled_at)<new Date(upcoming.scheduled_at)){ const c=courses.find(x=>x.id===s.course_id); upcoming={...s,course:c?.title||""}; } } }
  const first=firstName(Auth.profile?.full_name);

  mount.innerHTML=`
    <div class="hero">
      <div class="kicker">Welcome back · Executive</div>
      <h2>Hello, ${esc(first)} 👋</h2>
      <p>Ascend. Empower. Achieve. Keep climbing — here's where things stand today.</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="n navy">${courses.length}</div><div class="l">Active courses</div></div>
      <div class="stat"><div class="n flame">${pending.length}</div><div class="l">Assignments pending</div></div>
      <div class="stat"><div class="n violet">${quizzes.length}</div><div class="l">Quizzes available</div></div>
      <div class="stat"><div class="n">${attempts.length}</div><div class="l">Quizzes attempted</div></div>
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

    ${cap?`
    <div class="section-h"><h2>Capstone project</h2></div>
    <div class="rowc" data-cap style="cursor:pointer">
      <div class="rowc__ic">${I.rocket}</div>
      <div class="rowc__main"><h4>${esc(cap.title)}</h4>
        <div class="sub"><span>Due ${fmtDate(cap.due_at)}</span><span>${cap.points} pts</span></div></div>
      <div class="rowc__act">${myCap?statusBadge(myCap):`<span class="badge due">Not started</span>`} <span style="color:var(--muted-2)">${I.chev}</span></div>
    </div>`:""}
  `;
  wireCourseOpen(mount);
  mount.querySelectorAll("[data-open-assign]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.openAssign}`));
  $("[data-cap]")?.addEventListener("click",()=>location.hash="#/capstone");
}

/* ---- Trainer dashboard ---- */
async function dashTrainer(mount){
  const [courses,assignments,quizzes,notes,allSubs]=await Promise.all([db.courses(),db.assignments(),db.quizzes(),db.allNotes().catch(()=>[]),db.allSubmissions().catch(()=>[])]);
  const toReview=allSubs.filter(s=>s.status==="submitted");
  const first=firstName(Auth.profile?.full_name);
  mount.innerHTML=`
    <div class="hero">
      <div class="kicker">Trainer workspace</div>
      <h2>Welcome, ${esc(first)}</h2>
      <p>Post recordings and notes, publish assignments and quizzes, and review what your learners submit.</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.teach}</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="n navy">${courses.length}</div><div class="l">Courses</div></div>
      <div class="stat"><div class="n violet">${assignments.length}</div><div class="l">Assignments</div></div>
      <div class="stat"><div class="n">${quizzes.length}</div><div class="l">Quizzes</div></div>
      <div class="stat"><div class="n flame">${toReview.length}</div><div class="l">Awaiting review</div></div>
    </div>

    <div class="section-h"><h2>Quick actions</h2></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="btn btn--primary" data-note>${I.plus} Post faculty note</button>
      <button class="btn btn--ghost" data-assign>${I.plus} New assignment</button>
      <button class="btn btn--ghost" data-quiz>${I.plus} New quiz</button>
      <a class="btn btn--ghost" href="#/review">${I.inbox} Review submissions</a>
    </div>

    <div class="section-h"><h2>Recently submitted</h2><span class="count">${toReview.length} awaiting review</span></div>
    <div class="stack">${toReview.slice(0,5).map(s=>{
      const a=assignments.find(x=>x.id===s.assignment_id);
      return `<div class="rowc"><div class="rowc__ic">${I.clip}</div>
        <div class="rowc__main"><h4>${esc(a?.title||"Assignment")}</h4>
          <div class="sub"><span>Submitted ${fmtDT(s.submitted_at)}</span></div></div>
        <div class="rowc__act"><a class="btn btn--ghost btn--sm" href="#/review">Review</a></div></div>`;
    }).join("")||`<p class="muted">Nothing waiting — you're all caught up.</p>`}</div>

    <div class="section-h"><h2>Your courses</h2></div>
    <div class="grid">${courses.map(courseCard).join("")||emptyBlock("No courses yet","Ask an admin to add courses, or open one to add sessions & notes.")}</div>
  `;
  wireCourseOpen(mount);
  $("[data-note]").addEventListener("click",()=>editNote(null));
  $("[data-assign]").addEventListener("click",()=>editAssignment(null));
  $("[data-quiz]").addEventListener("click",()=>editQuiz(null));
}

/* ---- Admin dashboard ---- */
async function dashAdmin(mount){
  const [courses,assignments,quizzes,people,allSubs]=await Promise.all([
    db.courses(),db.assignments(),db.quizzes(),db.people(),db.allSubmissions().catch(()=>[])]);
  const trainers=people.filter(p=>p.role==="trainer").length;
  const staff=people.filter(p=>p.role==="staff").length;
  const toReview=allSubs.filter(s=>s.status==="submitted").length;
  mount.innerHTML=`
    <div class="hero">
      <div class="kicker">Administrator</div>
      <h2>Programme control centre</h2>
      <p>Everything across ASCEND 2026 — content, people and submissions — at a glance.</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="n navy">${courses.length}</div><div class="l">Courses</div></div>
      <div class="stat"><div class="n violet">${assignments.length}</div><div class="l">Assignments</div></div>
      <div class="stat"><div class="n">${quizzes.length}</div><div class="l">Quizzes</div></div>
      <div class="stat"><div class="n flame">${toReview}</div><div class="l">Awaiting review</div></div>
    </div>
    <div class="stats">
      <div class="stat"><div class="n">${people.length}</div><div class="l">Members</div></div>
      <div class="stat"><div class="n violet">${trainers}</div><div class="l">Trainers</div></div>
      <div class="stat"><div class="n navy">${staff}</div><div class="l">Executives</div></div>
      <div class="stat"><div class="n flame">${allSubs.length}</div><div class="l">Total submissions</div></div>
    </div>

    <div class="section-h"><h2>Quick actions</h2></div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap">
      <button class="btn btn--primary" data-qc>${I.plus} New course</button>
      <button class="btn btn--ghost" data-qa>${I.plus} New assignment</button>
      <button class="btn btn--ghost" data-qq>${I.plus} New quiz</button>
      <button class="btn btn--ghost" data-qcap>${I.plus} New capstone</button>
      <a class="btn btn--ghost" href="#/review">${I.inbox} Review work</a>
      <a class="btn btn--ghost" href="#/admin">${I.users} Manage people</a>
    </div>

    <div class="section-h"><h2>Courses</h2></div>
    <div class="grid">${courses.map(courseCard).join("")||emptyBlock("No courses yet","Add your first course.")}</div>
  `;
  wireCourseOpen(mount);
  $("[data-qc]").addEventListener("click",()=>editCourse(null));
  $("[data-qa]").addEventListener("click",()=>editAssignment(null));
  $("[data-qq]").addEventListener("click",()=>editQuiz(null));
  $("[data-qcap]").addEventListener("click",()=>editCapstone(null));
}

function assignmentRow(a,courses){
  const c=courses.find(x=>x.id===a.course_id);
  return `<div class="rowc" data-open-assign="${a.id}" style="cursor:pointer">
    <div class="rowc__ic">${I.clip}</div>
    <div class="rowc__main"><h4>${esc(a.title)}</h4>
      <div class="sub">${c?`<span>${esc(c.title)}</span>`:""}<span>Due ${fmtDate(a.due_at)}</span></div></div>
    <div class="rowc__act"><span class="chev" style="color:var(--muted-2)">${I.chev}</span></div></div>`;
}

/* =============================================================== COURSES */
/* Render our plain-text notes/syllabus (─── dividers, indented code, • bullets)
   into clean formatted HTML. */
/* ---------------- educational SVG diagrams (referenced from notes via @svg name) ---- */
const SVGS = {
  normal:`<svg viewBox="0 0 640 300" class="edu" role="img" aria-label="Normal distribution">
    <line x1="40" y1="250" x2="610" y2="250" stroke="#c9d3e6" stroke-width="2"/>
    <path d="M40 250 C 190 250, 250 70, 325 70 C 400 70, 460 250, 610 250 Z" fill="rgba(90,47,158,.12)" stroke="#5a2f9e" stroke-width="3"/>
    <line x1="325" y1="70" x2="325" y2="250" stroke="#f2661f" stroke-width="2.5" stroke-dasharray="7 5"/>
    <text x="325" y="275" text-anchor="middle" font-size="15" fill="#0e1a35" font-weight="700">Mean = Median = Mode</text>
    <text x="50" y="42" font-size="14" fill="#5a6a89" font-weight="600">Symmetric (Normal) distribution — the classic bell curve</text></svg>`,
  skew:`<svg viewBox="0 0 640 320" class="edu" role="img" aria-label="Right-skewed distribution">
    <text x="50" y="34" font-size="14" fill="#5a6a89" font-weight="600">Right-skew (positive): a few large values pull the tail right</text>
    <line x1="40" y1="270" x2="610" y2="270" stroke="#c9d3e6" stroke-width="2"/>
    <path d="M40 270 C 130 270, 150 90, 210 90 C 300 90, 360 270, 610 270 Z" fill="rgba(15,125,140,.12)" stroke="#0f7d8c" stroke-width="3"/>
    <line x1="210" y1="90" x2="210" y2="270" stroke="#127a45" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="210" y="288" text-anchor="middle" font-size="13" fill="#127a45" font-weight="700">Mode</text>
    <line x1="250" y1="150" x2="250" y2="270" stroke="#5a2f9e" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="250" y="306" text-anchor="middle" font-size="13" fill="#5a2f9e" font-weight="700">Median</text>
    <line x1="300" y1="200" x2="300" y2="270" stroke="#f2661f" stroke-width="2.5" stroke-dasharray="6 5"/>
    <text x="325" y="240" font-size="13" fill="#f2661f" font-weight="700">Mean (dragged by outliers)</text>
    <text x="360" y="120" font-size="13" fill="#5a6a89">➜ long right tail</text></svg>`,
  confusion:`<svg viewBox="0 0 640 360" class="edu" role="img" aria-label="Confusion matrix">
    <text x="330" y="26" text-anchor="middle" font-size="15" fill="#0e1a35" font-weight="700">Confusion Matrix — disease screening (1000 patients)</text>
    <text x="330" y="58" text-anchor="middle" font-size="13" fill="#5a6a89" font-weight="600">PREDICTED</text>
    <text x="300" y="230" text-anchor="middle" font-size="13" fill="#5a6a89" font-weight="600" transform="rotate(-90 40 210)">ACTUAL</text>
    <text x="210" y="80" text-anchor="middle" font-size="12" fill="#5a6a89">Positive (sick)</text>
    <text x="430" y="80" text-anchor="middle" font-size="12" fill="#5a6a89">Negative (healthy)</text>
    <text x="70" y="150" text-anchor="middle" font-size="12" fill="#5a6a89" transform="rotate(-90 70 150)">Positive</text>
    <text x="70" y="270" text-anchor="middle" font-size="12" fill="#5a6a89" transform="rotate(-90 70 270)">Negative</text>
    <rect x="120" y="95" width="180" height="110" fill="#e7f5ee" stroke="#8fd3ad" stroke-width="2"/>
    <text x="210" y="140" text-anchor="middle" font-size="15" fill="#127a45" font-weight="700">TP = 90</text>
    <text x="210" y="164" text-anchor="middle" font-size="12" fill="#127a45">True Positive</text>
    <rect x="300" y="95" width="180" height="110" fill="#fdecea" stroke="#f2c4bf" stroke-width="2"/>
    <text x="390" y="140" text-anchor="middle" font-size="15" fill="#c0480f" font-weight="700">FN = 10</text>
    <text x="390" y="164" text-anchor="middle" font-size="12" fill="#c0480f">False Negative (missed!)</text>
    <rect x="120" y="205" width="180" height="110" fill="#fdecea" stroke="#f2c4bf" stroke-width="2"/>
    <text x="210" y="250" text-anchor="middle" font-size="15" fill="#c0480f" font-weight="700">FP = 80</text>
    <text x="210" y="274" text-anchor="middle" font-size="12" fill="#c0480f">False Positive (false alarm)</text>
    <rect x="300" y="205" width="180" height="110" fill="#e2f0fb" stroke="#a9cdeb" stroke-width="2"/>
    <text x="390" y="250" text-anchor="middle" font-size="15" fill="#155a94" font-weight="700">TN = 820</text>
    <text x="390" y="274" text-anchor="middle" font-size="12" fill="#155a94">True Negative</text>
    <text x="510" y="150" font-size="12.5" fill="#0e1a35">Recall/Sensitivity</text>
    <text x="510" y="168" font-size="12.5" fill="#5a6a89">= 90/(90+10) = 0.90</text>
    <text x="510" y="230" font-size="12.5" fill="#0e1a35">Specificity</text>
    <text x="510" y="248" font-size="12.5" fill="#5a6a89">= 820/(820+80)=0.91</text>
    <text x="210" y="336" text-anchor="middle" font-size="12.5" fill="#0e1a35">Precision = 90/(90+80) = 0.53</text></svg>`,
  type12:`<svg viewBox="0 0 640 340" class="edu" role="img" aria-label="Type I and Type II errors">
    <text x="330" y="26" text-anchor="middle" font-size="15" fill="#0e1a35" font-weight="700">Type I vs Type II error — the fire-alarm story</text>
    <text x="330" y="58" text-anchor="middle" font-size="13" fill="#5a6a89" font-weight="600">REALITY</text>
    <text x="210" y="82" text-anchor="middle" font-size="12" fill="#5a6a89">No fire (H₀ true)</text>
    <text x="430" y="82" text-anchor="middle" font-size="12" fill="#5a6a89">Fire! (H₀ false)</text>
    <text x="66" y="150" text-anchor="middle" font-size="12" fill="#5a6a89" transform="rotate(-90 66 150)">Alarm rings</text>
    <text x="66" y="265" text-anchor="middle" font-size="12" fill="#5a6a89" transform="rotate(-90 66 265)">Alarm silent</text>
    <rect x="120" y="95" width="200" height="105" fill="#fdecea" stroke="#f2c4bf" stroke-width="2"/>
    <text x="220" y="135" text-anchor="middle" font-size="14" fill="#c0480f" font-weight="700">TYPE I error (α)</text>
    <text x="220" y="158" text-anchor="middle" font-size="12" fill="#c0480f">False alarm — reject a true H₀</text>
    <rect x="320" y="95" width="200" height="105" fill="#e7f5ee" stroke="#8fd3ad" stroke-width="2"/>
    <text x="420" y="140" text-anchor="middle" font-size="13" fill="#127a45" font-weight="700">Correct ✓ (power)</text>
    <rect x="120" y="200" width="200" height="105" fill="#e7f5ee" stroke="#8fd3ad" stroke-width="2"/>
    <text x="220" y="245" text-anchor="middle" font-size="13" fill="#127a45" font-weight="700">Correct ✓</text>
    <rect x="320" y="200" width="200" height="105" fill="#fdeee7" stroke="#f6d3c4" stroke-width="2"/>
    <text x="420" y="240" text-anchor="middle" font-size="14" fill="#c0480f" font-weight="700">TYPE II error (β)</text>
    <text x="420" y="263" text-anchor="middle" font-size="12" fill="#c0480f">Missed fire — fail to reject false H₀</text></svg>`,
  roc:`<svg viewBox="0 0 640 340" class="edu" role="img" aria-label="ROC curve">
    <text x="320" y="24" text-anchor="middle" font-size="15" fill="#0e1a35" font-weight="700">ROC curve &amp; AUC</text>
    <line x1="90" y1="290" x2="560" y2="290" stroke="#0e1a35" stroke-width="2"/>
    <line x1="90" y1="290" x2="90" y2="50" stroke="#0e1a35" stroke-width="2"/>
    <line x1="90" y1="290" x2="560" y2="50" stroke="#8b98b3" stroke-width="2" stroke-dasharray="7 6"/>
    <text x="330" y="200" font-size="12" fill="#8b98b3" transform="rotate(-24 330 200)">random guess (AUC 0.5)</text>
    <path d="M90 290 C 130 130, 230 70, 560 50" fill="rgba(90,47,158,.12)" stroke="#5a2f9e" stroke-width="3"/>
    <text x="300" y="120" font-size="13" fill="#5a2f9e" font-weight="700">good model (AUC → 1.0)</text>
    <text x="325" y="320" text-anchor="middle" font-size="12.5" fill="#5a6a89">False Positive Rate (1 − specificity)</text>
    <text x="60" y="170" text-anchor="middle" font-size="12.5" fill="#5a6a89" transform="rotate(-90 60 170)">True Positive Rate (recall)</text></svg>`,
};

/* ---------------- in-browser Python (Pyodide) for runnable pandas/numpy cells ------- */
function loadScriptOnce(src){ return new Promise((res,rej)=>{ if([...document.scripts].some(s=>s.src===src)) return res(); const s=document.createElement("script"); s.src=src; s.onload=()=>res(); s.onerror=()=>rej(new Error("load failed")); document.head.appendChild(s); }); }
const Py = {
  _p:null, _loading:null,
  async get(onStatus){
    if(this._p) return this._p;
    if(this._loading) return this._loading;
    this._loading=(async()=>{
      onStatus&&onStatus("Loading Python (first run downloads ~10 MB, ~15–25 s)…");
      await loadScriptOnce("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
      const p=await window.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"});
      onStatus&&onStatus("Loading numpy & pandas…");
      await p.loadPackage(["numpy","pandas"]);
      this._p=p; return p;
    })();
    return this._loading;
  }
};
async function runPython(code, outEl, statusEl){
  let p;
  try{ p = await Py.get(m=>{ if(statusEl) statusEl.textContent=m; }); }
  catch(e){ outEl.textContent="Couldn't load Python runtime (need internet). "+ (e.message||""); if(statusEl) statusEl.textContent="Error"; return; }
  try{
    if(/\b(from|import)\s+(scipy|sklearn|statsmodels|matplotlib)\b/.test(code)){
      if(statusEl) statusEl.textContent="Loading libraries used by this code…";
      await p.loadPackagesFromImports(code);
    }
  }catch(_){}
  if(statusEl) statusEl.textContent="Running…";
  try{
    p.globals.set("_src", code);
    const out = await p.runPythonAsync(`
import sys, io
_b = io.StringIO(); _o = sys.stdout; sys.stdout = _b
try:
    exec(_src, globals())
except Exception:
    import traceback; traceback.print_exc()
finally:
    sys.stdout = _o
_b.getvalue()`);
    outEl.textContent = (out && String(out).trim()) ? out : "(ran successfully — no printed output; add print(...) to see values)";
    if(statusEl) statusEl.textContent="Done ✓";
  }catch(e){ outEl.textContent=String(e.message||e); if(statusEl) statusEl.textContent="Error"; }
}
function autoGrow(ta){ ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight+4,460)+"px"; }
function wireRunBlocks(root){
  root.querySelectorAll(".pyblock").forEach(el=>{
    if(el.dataset.wired) return; el.dataset.wired="1";
    let code=""; try{ code=decodeURIComponent(escape(atob(el.dataset.code||""))); }catch(_){ code=""; }
    const title=el.dataset.title||"Try it — runs in your browser";
    el.innerHTML=`
      <div class="py-h"><span>${I.git} ${esc(title)}</span><span class="py-status muted"></span></div>
      <textarea class="py-code" spellcheck="false"></textarea>
      <div class="py-actions"><button class="btn btn--primary btn--sm py-run">${I.play} Run</button>
        <button class="btn btn--ghost btn--sm py-reset">Reset</button></div>
      <pre class="py-out" hidden></pre>`;
    const ta=el.querySelector(".py-code"); ta.value=code; autoGrow(ta);
    const out=el.querySelector(".py-out"); const status=el.querySelector(".py-status");
    el.querySelector(".py-run").addEventListener("click",async()=>{ out.hidden=false; out.textContent="…"; await runPython(ta.value,out,status); });
    el.querySelector(".py-reset").addEventListener("click",()=>{ ta.value=code; autoGrow(ta); out.hidden=true; status.textContent=""; });
    ta.addEventListener("input",()=>autoGrow(ta));
  });
}

function linkify(s){ return esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>'); }
function renderRich(txt){
  const lines=String(txt||"").split("\n");
  let html=""; let code=[];
  const flush=()=>{ if(code.length){ html+=`<pre class="rt-code">${esc(code.join("\n"))}</pre>`; code=[]; } };
  const isDiv=(s)=>/^[─━\-_=]{4,}$/.test(s.trim());
  for(let i=0;i<lines.length;i++){
    const ln=lines[i]; const t=ln.trim();
    if(/^@video\s+/i.test(t)){
      flush();
      let rest=t.replace(/^@video\s+/i,""); let title="";
      const parts=rest.split("|"); if(parts.length>1){ title=parts.slice(1).join("|").trim(); rest=parts[0].trim(); }
      const idm=rest.match(/[A-Za-z0-9_-]{11}/); const id=idm?idm[0]:"";
      if(id) html+=`<div class="rt-vid"><div class="rt-vid__f"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(title||'Video')}" allow="accelerometer;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${title?`<div class="rt-vid__t">▶ ${esc(title)}</div>`:""}</div>`;
      continue;
    }
    if(/^@svg\s+/i.test(t)){
      flush();
      const key=t.replace(/^@svg\s+/i,"").trim().toLowerCase();
      html+=`<div class="rt-svg">${SVGS[key]||`<p class="rt-p muted">[diagram: ${esc(key)}]</p>`}</div>`;
      continue;
    }
    if(/^@run\b/i.test(t)){
      flush();
      const title=t.replace(/^@run\b/i,"").trim();
      const buf=[];
      let j=i+1;
      for(; j<lines.length; j++){
        const nx=lines[j];
        if(/^(\s{4,}|\t)/.test(nx)){ buf.push(nx.replace(/^(\s{4}|\t)/,"")); }
        else if(nx.trim()===""){ buf.push(""); }
        else break;
      }
      while(buf.length && buf[buf.length-1]==="") buf.pop();
      i=j-1;
      const src=buf.join("\n");
      let b64=""; try{ b64=btoa(unescape(encodeURIComponent(src))); }catch(_){ b64=""; }
      html+=`<div class="pyblock" data-code="${b64}" data-title="${esc(title||'Try it — runs in your browser')}"></div>`;
      continue;
    }
    if(isDiv(ln)){ flush();
      const h=lines[i+1];
      if(h!==undefined && h.trim() && !isDiv(h)){ html+=`<div class="rt-h">${esc(h.trim())}</div>`; i++; if(isDiv(lines[i+1]||"")) i++; }
      continue;
    }
    if(/^(\s{4,}|\t)\S/.test(ln)){ code.push(ln.replace(/^\s{4}/,"")); continue; }
    flush();
    if(!t){ continue; }
    if(/^[•\-]\s/.test(t)){ html+=`<div class="rt-li">${linkify(t.replace(/^[•\-]\s/,""))}</div>`; continue; }
    // module lines like "M1 · Statistics ... (Weeks 1–2) — ..."
    const m=t.match(/^((?:M\d+|MT|RV|Orientation Block|M[0-9])\b[^—-]*)(?:[—-]\s*(.*))?$/);
    if(m && /·|Weeks|Week/.test(t)){ html+=`<div class="rt-mod"><b>${esc(m[1].trim())}</b>${m[2]?` — ${esc(m[2])}`:""}</div>`; continue; }
    html+=`<p class="rt-p">${linkify(t)}</p>`;
  }
  flush();
  return html;
}

async function viewCourses(mount){
  const courses=await db.courses();
  mount.innerHTML=`
    <div class="page-h"><div><h1>Courses</h1><p>Everything in the ASCEND 2026 curriculum.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} New course</button>`:""}</div>
    <div class="grid">${courses.map(courseCard).join("")||emptyBlock("No courses yet","Trainers and admins can add the first course.")}</div>`;
  wireCourseOpen(mount);
  $("[data-add]")?.addEventListener("click",()=>editCourse(null));
}

async function viewCourse(mount,r){
  const c=await db.course(r.id);
  if(!c){ mount.innerHTML=emptyBlock("Course not found","It may have been removed."); return; }
  const [sessions,materials,notes,assignments,quizzes]=await Promise.all([db.sessions(c.id),db.materials(c.id),db.notes(c.id),db.assignments(),db.quizzes()]);
  const courseAssign=assignments.filter(a=>a.course_id===c.id);
  const courseQuiz=quizzes.filter(q=>q.course_id===c.id);
  const M=Auth.canManage;

  const recCount=sessions.filter(s=>s.recording_url).length;
  const notesCount=notes.filter(n=>n.kind!=='prereq').length;
  const ql=(href,icon,title,sub)=>`<a class="qtile" href="${href}"><span class="qic">${icon}</span><span class="qtx"><b>${title}</b><small>${sub}</small></span><span class="qch">${I.chev}</span></a>`;

  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All courses</button>
    <div class="hero" data-accent="${esc(c.accent)}">
      <div class="kicker">${esc(c.instructor||"C-DAC")}</div>
      <h2>${esc(c.title)}</h2><p>${esc(c.summary||"")}</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>

    ${c.syllabus?`<div class="section-h"><h2>Syllabus</h2></div>
    <div class="card card--pad rt">${renderRich(c.syllabus)}</div>`:""}

    <div class="section-h"><h2>Course contents</h2></div>
    <div class="qgrid">
      ${ql('#/schedule',I.cal,'Schedule',`${sessions.length} sessions`)}
      ${ql('#/recordings',I.play,'Recordings',`${recCount} available`)}
      ${ql('#/prereq',I.book,'Prerequisites','NumPy · Pandas')}
      ${ql('#/notes',I.note,'Faculty notes',`${notesCount} note${notesCount!==1?'s':''}`)}
      ${ql('#/assignments',I.clip,'Assignments',`${courseAssign.length}`)}
      ${ql('#/quizzes',I.quiz,'Practice quizzes',`${courseQuiz.length}`)}
      ${ql('#/capstone',I.rocket,'Capstone project','Final project')}
      ${ql('#/forum',I.chat,'Discussion forum','Ask a doubt')}
    </div>

    <div class="section-h"><h2>Materials</h2><span class="count">${materials.length}</span>
      ${M?`<button class="btn btn--ghost btn--sm" style="margin-left:auto" data-add-material>${I.plus} Add material</button>`:""}</div>
    ${materials.length?`<div class="chips">${materials.map(m=>materialChip(m,M)).join("")}</div>`:`<p class="muted">No materials attached yet.</p>`}

    ${M?`<div class="between" style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--line)">
      <span class="muted" style="font-size:.85rem">${Auth.isAdmin?"Admin":"Trainer"} actions</span>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" data-add-session>${I.plus} Add session</button>
        <button class="btn btn--ghost btn--sm" data-add-note>${I.plus} Add note</button>
        <button class="btn btn--ghost btn--sm" data-edit-course>${I.edit} Edit course</button>
        ${Auth.isAdmin?`<button class="btn btn--danger btn--sm" data-del-course>${I.trash} Delete</button>`:""}</div></div>`:""}
  `;
  $("[data-back]").addEventListener("click",()=>location.hash="#/courses");
  if(M){
    $("[data-add-session]").addEventListener("click",()=>editSession(c.id,null));
    $("[data-add-note]").addEventListener("click",()=>editNote(null,c.id));
    $("[data-add-material]")?.addEventListener("click",()=>editMaterial(c.id,null));
    $("[data-edit-course]").addEventListener("click",()=>editCourse(c));
    $("[data-del-course]")?.addEventListener("click",()=>confirmModal("Delete this course and all its sessions, materials, notes and assignments?",async()=>{ await db.remove("courses",c.id); toast("Course deleted"); location.hash="#/courses"; }));
    mount.querySelectorAll("[data-edit-material]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();editMaterial(c.id,materials.find(m=>m.id===b.dataset.editMaterial));}));
    mount.querySelectorAll("[data-del-material]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();confirmModal("Remove this material?",async()=>{await db.remove("materials",b.dataset.delMaterial);toast("Material removed");render();});}));
  }
}
function sessionRow(s,mgr){
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
      ${mgr?`<button class="btn btn--ghost btn--sm" data-edit-session="${s.id}">${I.edit}</button>
      <button class="btn btn--danger btn--sm" data-del-session="${s.id}">${I.trash}</button>`:""}</div></div>`;
}
function materialChip(m,mgr){
  return `<span style="display:inline-flex;align-items:center;gap:.3rem">
    <a class="mchip" href="${esc(m.url)}" target="_blank" rel="noopener">${matIcon(m.kind)} ${esc(m.title)}</a>
    ${mgr?`<button class="btn btn--ghost btn--sm" data-edit-material="${m.id}" title="Edit">${I.edit}</button>
      <button class="btn btn--danger btn--sm" data-del-material="${m.id}" title="Remove">${I.trash}</button>`:""}</span>`;
}
function noteCard(n,mgr){
  return `<div class="notecard">
    <div class="between" style="align-items:flex-start">
      <div style="min-width:0">
        <h4 style="font-family:var(--font-d);margin:0 0 .2rem">${I.note} ${esc(n.title)}</h4>
        <div class="muted" style="font-size:.8rem">${esc(n.author||"Faculty")} · ${fmtDate(n.created_at)}</div>
      </div>
      ${mgr?`<div style="display:flex;gap:.3rem;flex:none">
        <button class="btn btn--ghost btn--sm" data-edit-note="${n.id}">${I.edit}</button>
        <button class="btn btn--danger btn--sm" data-del-note="${n.id}">${I.trash}</button></div>`:""}
    </div>
    <p style="white-space:pre-wrap;color:var(--muted);margin:.6rem 0 0">${esc(n.body||"")}</p>
    ${n.attachment_url?`<div style="margin-top:.7rem"><a class="mchip" href="${esc(n.attachment_url)}" target="_blank" rel="noopener">${I.file} Open attachment ${I.ext}</a></div>`:""}
  </div>`;
}

/* =============================================================== FACULTY NOTES */
const noteSnippet=(b)=>{ const t=String(b||"").replace(/[─━]{2,}/g," ").replace(/\s+/g," ").trim(); return t.slice(0,150)+(t.length>150?"…":""); };
function noteListCard(n,cmap){
  const c=cmap[n.course_id];
  return `<div class="notecard notecard--click" data-open-note="${n.id}">
    <div class="between" style="align-items:flex-start">
      <div style="min-width:0">
        <div class="course-tag muted" style="font-size:.8rem">${c?esc(c.title):"General"}</div>
        <h4 style="font-family:var(--font-d);margin:.15rem 0 .2rem">${I.note} ${esc(n.title)}</h4>
        <div class="muted" style="font-size:.8rem">${esc(n.author||"Faculty")} · ${fmtDate(n.created_at)}</div>
      </div>
      <div style="display:flex;gap:.3rem;flex:none;align-items:center">
        ${Auth.canManage?`<button class="btn btn--ghost btn--sm" data-edit="${n.id}">${I.edit}</button>
          <button class="btn btn--danger btn--sm" data-del="${n.id}">${I.trash}</button>`:""}
        <span style="color:var(--muted-2)">${I.chev}</span>
      </div>
    </div>
    <p class="muted" style="margin:.55rem 0 0">${esc(noteSnippet(n.body))}</p>
  </div>`;
}
function wireNoteList(mount,notes){
  mount.querySelectorAll("[data-open-note]").forEach(el=>el.addEventListener("click",e=>{
    if(e.target.closest("[data-edit],[data-del]")) return;
    location.hash=`#/note/${el.dataset.openNote}`;
  }));
  mount.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();editNote(notes.find(n=>n.id===b.dataset.edit));}));
  mount.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();confirmModal("Delete this note?",async()=>{await db.remove("notes",b.dataset.del);toast("Note deleted");render();});}));
}

async function viewNotes(mount){
  const [notes,courses]=await Promise.all([db.allNotes(),db.courses()]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const faculty=notes.filter(n=>n.kind!=='prereq');
  mount.innerHTML=`
    <div class="page-h"><div><h1>Faculty notes</h1><p>Reference notes and reading posted by trainers. Click any note to open it.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} Post note</button>`:""}</div>
    <div class="stack">${faculty.map(n=>noteListCard(n,cmap)).join("")||emptyBlock("No notes yet","Trainers can post reference notes here.",I.note)}</div>`;
  $("[data-add]")?.addEventListener("click",()=>editNote(null));
  wireNoteList(mount,notes);
}

async function viewPrereq(mount){
  const [notes,courses]=await Promise.all([db.allNotes(),db.courses()]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const pre=notes.filter(n=>n.kind==='prereq');
  const tile=(n,accent,label)=>`
    <button class="course prereq-tile" data-open-note="${n.id}" data-accent="${accent}">
      <div class="course__band" style="color:#fff">${I.book}</div>
      <div class="course__body">
        <div class="course-tag muted" style="font-size:.78rem">${esc(label)}</div>
        <h3>${esc(n.title.replace(/^Prerequisite\s*[—-]\s*/i,''))}</h3>
        <p>${esc(noteSnippet(n.body))}</p>
        <div class="course__meta"><span>${I.chev} Open — very basic to advanced</span></div>
      </div></button>`;
  const np=pre.find(n=>/numpy/i.test(n.title));
  const pd=pre.find(n=>/pandas/i.test(n.title));
  const others=pre.filter(n=>n!==np&&n!==pd);
  mount.innerHTML=`
    <div class="page-h"><div><h1>Prerequisites</h1><p>Get comfortable with these before Module 2. Each opens a full guide — basics to advanced with runnable examples.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} Add prerequisite</button>`:""}</div>
    <div class="grid">
      ${np?tile(np,'navy','Python library'):""}
      ${pd?tile(pd,'violet','Python library'):""}
      ${others.map(n=>tile(n,'teal','Prerequisite')).join("")}
    </div>
    ${pre.length?"":emptyBlock("No prerequisites yet","Trainers can add prerequisite guides here.",I.book)}`;
  mount.querySelectorAll("[data-open-note]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/note/${el.dataset.openNote}`));
  $("[data-add]")?.addEventListener("click",()=>editNote(null,null,'prereq'));
}

async function viewNote(mount,r){
  const n=await db.note(r.id);
  if(!n){ mount.innerHTML=emptyBlock("Note not found","It may have been removed.",I.note); return; }
  const courses=await db.courses();
  const c=courses.find(x=>x.id===n.course_id);
  const backHash = n.kind==='prereq' ? '#/prereq' : '#/notes';
  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} ${n.kind==='prereq'?'All prerequisites':'All notes'}</button>
    <div class="card card--pad">
      <div class="between" style="align-items:flex-start">
        <div style="min-width:0">
          <div class="course-tag muted" style="font-size:.83rem">${c?esc(c.title):"General"}${n.kind==='prereq'?" · Prerequisite":""}</div>
          <h1 style="font-family:var(--font-d);font-size:1.5rem;letter-spacing:-.02em;margin:.25rem 0 .1rem">${esc(n.title)}</h1>
          <div class="muted" style="font-size:.83rem">${esc(n.author||"Faculty")} · ${fmtDate(n.created_at)}</div>
        </div>
        ${Auth.canManage?`<div style="display:flex;gap:.3rem;flex:none">
          <button class="btn btn--ghost btn--sm" data-edit>${I.edit} Edit</button></div>`:""}
      </div>
      <div class="rt" style="margin-top:1rem">${renderRich(n.body)}</div>
      ${n.attachment_url?`<div style="margin-top:1rem"><a class="mchip" href="${esc(n.attachment_url)}" target="_blank" rel="noopener">${I.file} Open attachment ${I.ext}</a></div>`:""}
    </div>`;
  $("[data-back]").addEventListener("click",()=>location.hash=backHash);
  $("[data-edit]")?.addEventListener("click",()=>editNote(n,n.course_id));
  wireRunBlocks(mount);
}

/* =============================================================== PYTHON PLAYGROUND */
const PLAY_SNIPPETS = [
  {name:"Descriptive stats", code:
`import numpy as np, pandas as pd

# Monthly salaries (in thousands) of a small team
salary = pd.Series([32, 35, 38, 40, 41, 42, 45, 250])  # last one is the CEO (outlier)

print("Mean   :", round(salary.mean(), 2))
print("Median :", salary.median())
print("Mode   :", salary.mode().tolist())
print("Std dev:", round(salary.std(), 2))
print("Variance:", round(salary.var(), 2))
print("Skewness:", round(salary.skew(), 2))
print("Kurtosis:", round(salary.kurtosis(), 2))
print()
print("Notice: the CEO's 250 drags the MEAN up to", round(salary.mean(),1),
      "but the MEDIAN stays at", salary.median(), "- median resists outliers.")`},
  {name:"Two-sample t-test", code:
`import numpy as np
from scipy import stats

# Test scores of two teaching methods
method_A = np.array([72, 75, 78, 71, 69, 80, 74, 77])
method_B = np.array([80, 83, 79, 85, 82, 88, 81, 84])

t, p = stats.ttest_ind(method_A, method_B)
print("t-statistic:", round(t, 3))
print("p-value    :", round(p, 5))
print("Method A mean:", method_A.mean(), " Method B mean:", method_B.mean())
if p < 0.05:
    print("=> p < 0.05: reject H0. The difference is statistically significant.")
else:
    print("=> p >= 0.05: not enough evidence of a real difference.")`},
  {name:"Confusion matrix metrics", code:
`# Disease screening on 1000 patients
TP, FN = 90, 10     # sick patients: caught vs missed
FP, TN = 80, 820    # healthy patients: false alarm vs correct

accuracy    = (TP + TN) / (TP + TN + FP + FN)
precision   = TP / (TP + FP)
recall      = TP / (TP + FN)          # = sensitivity
specificity = TN / (TN + FP)
f1          = 2 * precision * recall / (precision + recall)

print(f"Accuracy    : {accuracy:.2f}")
print(f"Precision   : {precision:.2f}   (of those flagged sick, how many really are)")
print(f"Recall/Sens : {recall:.2f}   (of the truly sick, how many we caught)")
print(f"Specificity : {specificity:.2f}   (of the healthy, how many we cleared)")
print(f"F1 score    : {f1:.2f}")`},
  {name:"Chi-square test", code:
`import numpy as np
from scipy import stats

# Is buying related to gender? (contingency table)
#            Bought  Didn't
#   Male       30      70
#   Female     45      55
table = np.array([[30, 70],
                  [45, 55]])

chi2, p, dof, expected = stats.chi2_contingency(table)
print("Chi-square:", round(chi2, 3))
print("p-value   :", round(p, 4))
print("Expected counts under independence:")
print(np.round(expected, 1))
print("Significant association?", "YES" if p < 0.05 else "NO")`},
  {name:"Blank", code:"# Write any Python here (numpy, pandas, scipy available)\n"},
];
async function viewPlayground(mount){
  mount.innerHTML=`
    <div class="page-h"><div><h1>Python playground</h1>
      <p>Real Python running in your browser — numpy, pandas and scipy included. Pick an example or write your own, then Run. Nothing is sent to a server; the first run downloads the runtime (~10&nbsp;MB), so give it a few seconds.</p></div></div>
    <div class="card card--pad">
      <div class="between" style="flex-wrap:wrap;gap:.5rem;margin-bottom:.8rem">
        <div style="display:flex;gap:.4rem;flex-wrap:wrap" id="snips">
          ${PLAY_SNIPPETS.map((s,i)=>`<button class="btn btn--ghost btn--sm" data-snip="${i}">${esc(s.name)}</button>`).join("")}
        </div>
        <span class="py-status muted" id="pstatus"></span>
      </div>
      <textarea class="py-code" id="pcode" spellcheck="false"></textarea>
      <div class="py-actions">
        <button class="btn btn--primary btn--sm" id="prun">${I.play} Run</button>
        <button class="btn btn--ghost btn--sm" id="pclear">Clear output</button>
      </div>
      <pre class="py-out" id="pout" hidden></pre>
    </div>`;
  const ta=$("#pcode"), out=$("#pout"), status=$("#pstatus");
  const load=(i)=>{ ta.value=PLAY_SNIPPETS[i].code; autoGrow(ta); out.hidden=true; status.textContent=""; };
  load(0);
  mount.querySelectorAll("[data-snip]").forEach(b=>b.addEventListener("click",()=>load(+b.dataset.snip)));
  ta.addEventListener("input",()=>autoGrow(ta));
  $("#prun").addEventListener("click",async()=>{ out.hidden=false; out.textContent="…"; await runPython(ta.value,out,status); });
  $("#pclear").addEventListener("click",()=>{ out.hidden=true; out.textContent=""; status.textContent=""; });
}

/* =============================================================== ASSIGNMENTS */
async function viewAssignments(mount){
  const [assignments,courses]=await Promise.all([db.assignments(),db.courses()]);
  const mine=Auth.canManage?[]:await db.mySubmissions(Auth.user.id).catch(()=>[]);
  const byId=Object.fromEntries(mine.map(s=>[s.assignment_id,s]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>Assignments</h1><p>Submit your work as a Git link, Google Drive link and/or recording.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} New assignment</button>`:""}</div>
    <div class="stack">${assignments.map(a=>{
      const c=courses.find(x=>x.id===a.course_id); const sub=byId[a.id];
      const overdue=!sub && isPast(a.due_at);
      return `<div class="assign" data-open="${a.id}" style="cursor:pointer">
        <div class="assign__top">
          <div><h3>${esc(a.title)}</h3><div class="course-tag">${c?esc(c.title):"General"}</div></div>
          <div>${Auth.canManage?(a.is_open?`<span class="badge open">Open</span>`:`<span class="badge closed">Closed</span>`):statusBadge(sub)}</div>
        </div>
        <p class="brief">${esc((a.brief||"").slice(0,160))}${(a.brief||"").length>160?"…":""}</p>
        <div class="assign__foot">
          <div class="meta">
            <span>Due <b>${fmtDate(a.due_at)}</b></span>
            <span>${a.points} points</span>
            ${overdue&&!Auth.canManage?`<span class="badge due">Overdue</span>`:(a.is_open?`<span class="badge open">Open</span>`:`<span class="badge closed">Closed</span>`)}
          </div>
          <span class="btn btn--ghost btn--sm">${Auth.canManage?"Open":(sub?"View / update":"Submit work")} ${I.chev}</span>
        </div></div>`;
    }).join("")||emptyBlock("No assignments yet","They'll appear here once published.",I.clip)}</div>`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.open}`));
  $("[data-add]")?.addEventListener("click",()=>editAssignment(null));
}

async function viewAssignment(mount,r){
  const a=await db.assignment(r.id);
  if(!a){ mount.innerHTML=emptyBlock("Assignment not found",""); return; }
  const courses=await db.courses();
  const c=courses.find(x=>x.id===a.course_id);
  const sub=Auth.canManage?null:await db.mySubmission(a.id,Auth.user.id).catch(()=>null);
  const overdue=isPast(a.due_at);

  const managerBlock = Auth.canManage ? `
    <div class="section-h"><h2>Submissions</h2></div>
    <div id="asubs"><div class="spinner"></div></div>
    <div class="between" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--line)">
      <span class="muted" style="font-size:.85rem">Manage</span>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn--ghost btn--sm" data-edit-a>${I.edit} Edit assignment</button>
        <button class="btn btn--danger btn--sm" data-del-a>${I.trash} Delete</button></div></div>` : `
    <div class="section-h"><h2>Your submission</h2></div>
    <div class="card card--pad">
      ${sub?`<div class="between" style="margin-bottom:1rem">
        <div>${statusBadge(sub)}<div class="muted" style="font-size:.85rem;margin-top:.35rem">Submitted ${fmtDT(sub.submitted_at)}</div></div>
        ${linkChips(sub)}</div>
        ${sub.feedback?`<div class="card--pad" style="background:var(--paper-2);border-radius:12px;margin-bottom:1rem">
          <b style="font-size:.85rem">Feedback from reviewer</b><p class="muted" style="margin:.3rem 0 0;white-space:pre-wrap">${esc(sub.feedback)}</p></div>`:""}`:""}
      <form data-sform>
        <div class="field"><label>Git repository link <span class="hint">GitHub / GitLab URL</span></label>
          <input class="input" name="git" type="url" placeholder="https://github.com/you/ascend-you" value="${esc(sub?.git_url||"")}"/></div>
        <div class="field"><label>Google Drive link <span class="hint">optional — docs, slides, files</span></label>
          <input class="input" name="drive" type="url" placeholder="https://drive.google.com/…" value="${esc(sub?.drive_url||"")}"/></div>
        <div class="field"><label>Recording link <span class="hint">optional — Zoom / YouTube / Drive video</span></label>
          <input class="input" name="rec" type="url" placeholder="https://…" value="${esc(sub?.recording_url||"")}"/></div>
        <div class="field"><label>Notes for reviewer <span class="hint">optional</span></label>
          <textarea name="notes" placeholder="Anything the reviewer should know…">${esc(sub?.notes||"")}</textarea></div>
        <button class="btn btn--primary" data-submit>${sub?"Update submission":"Submit work"}</button>
      </form>
    </div>`;

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
    ${managerBlock}`;

  $("[data-back]").addEventListener("click",()=>location.hash="#/assignments");
  if(Auth.canManage){
    $("[data-edit-a]").addEventListener("click",()=>editAssignment(a));
    $("[data-del-a]").addEventListener("click",()=>confirmModal("Delete this assignment and its submissions?",async()=>{await db.remove("assignments",a.id);toast("Assignment deleted");location.hash="#/assignments";}));
    const [subs,people]=await Promise.all([db.submissionsFor(a.id),db.people().catch(()=>[])]);
    const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
    $("#asubs").innerHTML = subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Member</th><th>Links</th><th>Submitted</th><th>Status</th><th>Grade</th><th></th></tr></thead>
      <tbody>${subs.map(s=>{const p=pmap[s.user_id]||{};return `<tr>
        <td class="who">${esc(p.full_name||s.user_id)}</td>
        <td>${linkChips(s)}</td>
        <td>${fmtDate(s.submitted_at)}</td><td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td>
        <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-rev="${s.id}">Review</button></td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("No submissions yet","No one has submitted this assignment.",I.inbox);
    $("#asubs").querySelectorAll("[data-rev]").forEach(b=>b.addEventListener("click",()=>reviewSubmission(subs.find(s=>s.id===b.dataset.rev),pmap,()=>render())));
  } else {
    $("[data-submit]").addEventListener("click", async (e)=>{
      e.preventDefault();
      const f=$("[data-sform]");
      const git=f.elements.git.value.trim(), drive=f.elements.drive.value.trim(), rec=f.elements.rec.value.trim();
      if(!git && !drive && !rec){ toast("Add at least one link (Git, Drive or recording)","err"); f.elements.git.focus(); return; }
      for(const v of [git,drive,rec]){ if(v && !isURL(v)){ toast("One of the links isn't a valid URL","err"); return; } }
      const btn=$("[data-submit]"); btn.disabled=true; btn.textContent="Submitting…";
      try{ await db.submit({assignment_id:a.id,user_id:Auth.user.id,git_url:git,drive_url:drive,recording_url:rec,notes:f.elements.notes.value.trim()}); toast("Submission saved"); render(); }
      catch(err){ toast(err.message||"Couldn't submit","err"); btn.disabled=false; btn.textContent=sub?"Update submission":"Submit work"; }
    });
  }
}

async function viewMySubmissions(mount){
  const [subs,assignments]=await Promise.all([db.mySubmissions(Auth.user.id),db.assignments()]);
  const byId=Object.fromEntries(assignments.map(a=>[a.id,a]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>My submissions</h1><p>Every assignment you've turned in and its status.</p></div></div>
    ${subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Assignment</th><th>Links</th><th>Submitted</th><th>Status</th><th>Grade</th></tr></thead>
      <tbody>${subs.map(s=>{const a=byId[s.assignment_id]||{};return `<tr data-open="${s.assignment_id}" style="cursor:pointer">
        <td class="who">${esc(a.title||"—")}</td>
        <td>${linkChips(s)}</td>
        <td>${fmtDate(s.submitted_at)}</td>
        <td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("Nothing submitted yet","Head to Assignments to turn in your first piece of work.",I.inbox)}`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.open}`));
}

/* =============================================================== QUIZZES */
async function viewQuizzes(mount){
  const [quizzes,courses,attempts]=await Promise.all([db.quizzes(),db.courses(),db.myAttempts(Auth.user.id).catch(()=>[])]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const best={};
  for(const at of attempts){ if(!best[at.quiz_id]||at.pct>best[at.quiz_id].pct) best[at.quiz_id]=at; }
  mount.innerHTML=`
    <div class="page-h"><div><h1>Practice quizzes</h1><p>Check your understanding — auto-graded, take them as many times as you like.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} New quiz</button>`:""}</div>
    <div class="grid">${quizzes.map(q=>{
      const c=cmap[q.course_id]; const b=best[q.id];
      return `<button class="course" data-open-quiz="${q.id}" data-accent="violet">
        <div class="course__band" style="color:#fff">${I.quiz}</div>
        <div class="course__body">
          <h3>${esc(q.title)}</h3>
          <p>${esc(q.description||"")}</p>
          <div class="course__meta">
            <span>${I.book}${c?esc(c.title):"General"}</span>
            ${b?`<span>${b.passed?I.check:I.clock} Best ${b.pct}%</span>`:`<span>${I.play} ${Auth.canManage?"Manage":"Not attempted"}</span>`}
          </div>
        </div></button>`;
    }).join("")||emptyBlock("No quizzes yet","Trainers can add practice quizzes here.",I.quiz)}</div>`;
  mount.querySelectorAll("[data-open-quiz]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/quiz/${el.dataset.openQuiz}`));
  $("[data-add]")?.addEventListener("click",()=>editQuiz(null));
}
function quizRow(q){
  return `<div class="rowc" data-open-quiz="${q.id}" style="cursor:pointer">
    <div class="rowc__ic">${I.quiz}</div>
    <div class="rowc__main"><h4>${esc(q.title)}</h4><div class="sub"><span>${esc(q.description||"")}</span></div></div>
    <div class="rowc__act"><span style="color:var(--muted-2)">${I.chev}</span></div></div>`;
}

async function viewQuiz(mount,r){
  const q=await db.quiz(r.id);
  if(!q){ mount.innerHTML=emptyBlock("Quiz not found",""); return; }
  const questions=await db.quizQuestions(q.id);

  if(Auth.canManage){
    mount.innerHTML=`
      <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All quizzes</button>
      <div class="page-h"><div><h1>${esc(q.title)}</h1><p>${esc(q.description||"")} · Pass mark ${q.pass_pct}%</p></div>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn--ghost btn--sm" data-edit-quiz>${I.edit} Edit quiz</button>
          <button class="btn btn--danger btn--sm" data-del-quiz>${I.trash}</button></div></div>
      <div class="section-h"><h2>Questions</h2><span class="count">${questions.length}</span>
        <button class="btn btn--primary btn--sm" style="margin-left:auto" data-add-q>${I.plus} Add question</button></div>
      <div class="stack">${questions.map((qq,i)=>`
        <div class="card card--pad">
          <div class="between" style="align-items:flex-start">
            <div style="min-width:0"><b>Q${i+1}.</b> ${esc(qq.prompt)}</div>
            <div style="display:flex;gap:.3rem;flex:none">
              <button class="btn btn--ghost btn--sm" data-edit-q="${qq.id}">${I.edit}</button>
              <button class="btn btn--danger btn--sm" data-del-q="${qq.id}">${I.trash}</button></div>
          </div>
          <ol style="margin:.7rem 0 0;padding-left:1.2rem" class="muted">${(qq.options||[]).map((o,oi)=>`<li style="${oi===qq.correct_index?"color:var(--teal);font-weight:600":""}">${esc(o)}${oi===qq.correct_index?" ✓":""}</li>`).join("")}</ol>
          ${qq.explanation?`<p class="muted" style="font-size:.85rem;margin:.6rem 0 0"><b>Why:</b> ${esc(qq.explanation)}</p>`:""}
        </div>`).join("")||`<p class="muted">No questions yet — add the first one.</p>`}</div>`;
    $("[data-back]").addEventListener("click",()=>location.hash="#/quizzes");
    $("[data-edit-quiz]").addEventListener("click",()=>editQuiz(q));
    $("[data-del-quiz]").addEventListener("click",()=>confirmModal("Delete this quiz and its questions?",async()=>{await db.remove("quizzes",q.id);toast("Quiz deleted");location.hash="#/quizzes";}));
    $("[data-add-q]").addEventListener("click",()=>editQuestion(q.id,null,questions.length));
    mount.querySelectorAll("[data-edit-q]").forEach(b=>b.addEventListener("click",()=>editQuestion(q.id,questions.find(x=>x.id===b.dataset.editQ),questions.length)));
    mount.querySelectorAll("[data-del-q]").forEach(b=>b.addEventListener("click",()=>confirmModal("Delete this question?",async()=>{await db.remove("quiz_questions",b.dataset.delQ);toast("Question deleted");render();})));
    return;
  }

  runQuiz(mount,q,questions);
}

function runQuiz(mount,q,questions){
  if(!questions.length){ mount.innerHTML=`<button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All quizzes</button>${emptyBlock("No questions yet","This quiz has no questions to answer.",I.quiz)}`; $("[data-back]").addEventListener("click",()=>location.hash="#/quizzes"); return; }
  const answers=new Array(questions.length).fill(null);
  const paint=()=>{
    mount.innerHTML=`
      <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All quizzes</button>
      <div class="card card--pad" style="margin-bottom:1rem">
        <h1 style="font-family:var(--font-d);font-size:1.5rem;margin:0 0 .2rem">${esc(q.title)}</h1>
        <p class="muted" style="margin:0">${esc(q.description||"")} · ${questions.length} questions · pass mark ${q.pass_pct}%</p>
      </div>
      <form data-quizform>
        ${questions.map((qq,i)=>`
          <div class="card card--pad" style="margin-bottom:.9rem" data-q="${i}">
            <div style="font-weight:600;margin-bottom:.7rem"><span class="flame">Q${i+1}.</span> ${esc(qq.prompt)}</div>
            <div class="qopts">${(qq.options||[]).map((o,oi)=>`
              <label class="qopt"><input type="radio" name="q${i}" value="${oi}"/><span>${esc(o)}</span></label>`).join("")}</div>
          </div>`).join("")}
        <button class="btn btn--primary" data-grade style="margin-top:.4rem">Submit quiz</button>
      </form>`;
    $("[data-back]").addEventListener("click",()=>location.hash="#/quizzes");
    mount.querySelectorAll(".qopt input").forEach(inp=>inp.addEventListener("change",e=>{
      const qi=Number(e.target.name.slice(1)); answers[qi]=Number(e.target.value);
      e.target.closest("[data-q]").querySelectorAll(".qopt").forEach(l=>l.classList.remove("sel"));
      e.target.closest(".qopt").classList.add("sel");
    }));
    $("[data-grade]").addEventListener("click", async (e)=>{
      e.preventDefault();
      if(answers.some(a=>a===null)){ toast("Answer every question first","err"); return; }
      let score=0; questions.forEach((qq,i)=>{ if(answers[i]===qq.correct_index) score+=(qq.points||1); });
      const total=questions.reduce((s,qq)=>s+(qq.points||1),0);
      const pct=Math.round(score/total*100); const passed=pct>=(q.pass_pct||60);
      try{ await db.saveAttempt({quiz_id:q.id,user_id:Auth.user.id,score,total,pct,passed,answers,submitted_at:new Date().toISOString()}); }catch(err){ /* still show result */ }
      showResult(mount,q,questions,answers,{score,total,pct,passed},paint);
    });
  };
  paint();
}
function showResult(mount,q,questions,answers,res,retry){
  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All quizzes</button>
    <div class="hero" style="text-align:center">
      <div class="peak" style="right:auto;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.14);width:120px">${res.passed?I.trophy:I.quiz}</div>
      <div class="kicker">${esc(q.title)}</div>
      <h2 style="font-size:2.6rem">${res.pct}%</h2>
      <p>${res.passed?"Passed — nicely done! 🎉":"Not quite — review the notes and try again."} You scored ${res.score} of ${res.total}.</p>
    </div>
    <div class="section-h"><h2>Review answers</h2></div>
    <div class="stack">${questions.map((qq,i)=>{
      const ok=answers[i]===qq.correct_index;
      return `<div class="card card--pad">
        <div style="font-weight:600;margin-bottom:.5rem">${ok?`<span class="teal">${I.check}</span>`:`<span class="flame">${I.alert}</span>`} Q${i+1}. ${esc(qq.prompt)}</div>
        <div class="qopts">${(qq.options||[]).map((o,oi)=>{
          let cls=""; if(oi===qq.correct_index) cls="right"; else if(oi===answers[i]) cls="wrong";
          return `<div class="qopt review ${cls}"><span>${esc(o)}</span>${oi===qq.correct_index?`<b class="teal">correct</b>`:(oi===answers[i]?`<b class="flame">your answer</b>`:"")}</div>`;
        }).join("")}</div>
        ${qq.explanation?`<p class="muted" style="font-size:.85rem;margin:.6rem 0 0"><b>Why:</b> ${esc(qq.explanation)}</p>`:""}
      </div>`;
    }).join("")}</div>
    <div style="display:flex;gap:.6rem;margin-top:1.2rem">
      <button class="btn btn--primary" data-retry>Try again</button>
      <a class="btn btn--ghost" href="#/quizzes">Back to quizzes</a>
    </div>`;
  $("[data-back]").addEventListener("click",()=>location.hash="#/quizzes");
  $("[data-retry]").addEventListener("click",retry);
}

/* =============================================================== CAPSTONE */
async function viewCapstone(mount){
  const capstones=await db.capstones();
  if(!capstones.length){
    mount.innerHTML=`<div class="page-h"><div><h1>Capstone project</h1><p>The programme's final project.</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} Create capstone</button>`:""}</div>
      ${emptyBlock("No capstone yet","Trainers can define the capstone project here.",I.rocket)}`;
    $("[data-add]")?.addEventListener("click",()=>editCapstone(null));
    return;
  }
  const cap=capstones[0];

  if(Auth.canManage){
    const [subs,people]=await Promise.all([db.capSubmissionsFor(cap.id),db.people().catch(()=>[])]);
    const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
    mount.innerHTML=`
      <div class="page-h"><div><h1>Capstone project</h1><p>Define the brief and review project submissions.</p></div>
        <button class="btn btn--ghost" data-edit>${I.edit} Edit brief</button></div>
      <div class="hero" data-accent="flame">
        <div class="kicker">Capstone · Due ${fmtDate(cap.due_at)} · ${cap.points} pts</div>
        <h2>${esc(cap.title)}</h2><p>${esc(cap.brief||"")}</p>
        <div class="peak" style="color:rgba(255,255,255,.16)">${I.rocket}</div>
      </div>
      ${cap.guidelines?`<div class="card card--pad" style="margin-top:1rem"><b>Guidelines</b><p style="white-space:pre-wrap;color:var(--muted);margin:.5rem 0 0">${esc(cap.guidelines)}</p></div>`:""}
      <div class="section-h"><h2>Project submissions</h2><span class="count">${subs.length}</span></div>
      ${subs.length?`<div class="tablewrap"><table>
        <thead><tr><th>Member</th><th>Project</th><th>Links</th><th>Status</th><th>Grade</th><th></th></tr></thead>
        <tbody>${subs.map(s=>{const p=pmap[s.user_id]||{};return `<tr>
          <td class="who">${esc(p.full_name||s.user_id)}</td>
          <td>${esc(s.project_title||"—")}</td>
          <td>${linkChips(s)}</td>
          <td>${statusBadge({status:s.status})}</td>
          <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td>
          <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-rev="${s.id}">Review</button></td></tr>`;}).join("")}</tbody>
      </table></div>`:emptyBlock("No project submissions yet","They'll appear here once people submit.",I.rocket)}`;
    $("[data-edit]").addEventListener("click",()=>editCapstone(cap));
    mount.querySelectorAll("[data-rev]").forEach(b=>b.addEventListener("click",()=>reviewCapstoneSub(subs.find(s=>s.id===b.dataset.rev),pmap,cap.points,()=>render())));
    return;
  }

  const sub=await db.myCapstone(cap.id,Auth.user.id).catch(()=>null);
  mount.innerHTML=`
    <div class="hero" data-accent="flame">
      <div class="kicker">Capstone · Due ${fmtDate(cap.due_at)} · ${cap.points} pts</div>
      <h2>${esc(cap.title)}</h2><p>${esc(cap.brief||"")}</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.rocket}</div>
    </div>
    ${cap.guidelines?`<div class="card card--pad" style="margin-top:1rem"><b>Guidelines &amp; deliverables</b><p style="white-space:pre-wrap;color:var(--muted);margin:.5rem 0 0">${esc(cap.guidelines)}</p></div>`:""}

    <div class="section-h"><h2>Your project submission</h2></div>
    <div class="card card--pad">
      ${sub?`<div class="between" style="margin-bottom:1rem">
        <div>${statusBadge(sub)}<div class="muted" style="font-size:.85rem;margin-top:.35rem">Submitted ${fmtDT(sub.submitted_at)}</div></div>
        ${linkChips(sub)}</div>
        ${sub.feedback?`<div class="card--pad" style="background:var(--paper-2);border-radius:12px;margin-bottom:1rem">
          <b style="font-size:.85rem">Feedback from reviewer</b><p class="muted" style="margin:.3rem 0 0;white-space:pre-wrap">${esc(sub.feedback)}</p></div>`:""}`:""}
      <form data-cform>
        <div class="field"><label>Project title <span class="hint">required</span></label>
          <input class="input" name="ptitle" value="${esc(sub?.project_title||"")}" placeholder="e.g. Auto-roster generator"/></div>
        <div class="field"><label>Summary <span class="hint">what it does &amp; the problem it solves</span></label>
          <textarea name="summary" placeholder="A short description of your project…">${esc(sub?.summary||"")}</textarea></div>
        <div class="field"><label>Git repository link</label>
          <input class="input" name="git" type="url" placeholder="https://github.com/you/your-capstone" value="${esc(sub?.git_url||"")}"/></div>
        <div class="field"><label>Google Drive link <span class="hint">write-up / slides</span></label>
          <input class="input" name="drive" type="url" placeholder="https://drive.google.com/…" value="${esc(sub?.drive_url||"")}"/></div>
        <div class="field"><label>Demo recording link <span class="hint">5–8 min walkthrough</span></label>
          <input class="input" name="rec" type="url" placeholder="https://…" value="${esc(sub?.recording_url||"")}"/></div>
        <button class="btn btn--primary" data-submit>${sub?"Update project":"Submit project"}</button>
      </form>
    </div>`;
  $("[data-submit]").addEventListener("click", async (e)=>{
    e.preventDefault();
    const f=$("[data-cform]");
    const ptitle=f.elements.ptitle.value.trim(), git=f.elements.git.value.trim(), drive=f.elements.drive.value.trim(), rec=f.elements.rec.value.trim();
    if(!ptitle){ toast("Give your project a title","err"); f.elements.ptitle.focus(); return; }
    if(!git && !drive && !rec){ toast("Add at least one link (Git, Drive or recording)","err"); return; }
    for(const v of [git,drive,rec]){ if(v && !isURL(v)){ toast("One of the links isn't a valid URL","err"); return; } }
    const btn=$("[data-submit]"); btn.disabled=true; btn.textContent="Submitting…";
    try{ await db.submitCapstone({capstone_id:cap.id,user_id:Auth.user.id,project_title:ptitle,summary:f.elements.summary.value.trim(),git_url:git,drive_url:drive,recording_url:rec}); toast("Capstone submitted"); render(); }
    catch(err){ toast(err.message||"Couldn't submit","err"); btn.disabled=false; btn.textContent=sub?"Update project":"Submit project"; }
  });
}
function reviewCapstoneSub(s,pmap,maxPoints,after){
  const p=pmap[s.user_id]||{};
  openModal({title:`Review capstone — ${p.full_name||"Member"}`,wide:true,bodyHTML:`
    <div style="margin-bottom:.6rem"><b>${esc(s.project_title||"Project")}</b>
      ${s.summary?`<p class="muted" style="margin:.3rem 0 0">${esc(s.summary)}</p>`:""}</div>
    ${linkChips(s)}
    <form data-rf style="margin-top:1rem">
      <div class="row2">
        <div class="field"><label>Status</label><select class="input" name="status">
          ${["submitted","reviewed","returned"].map(o=>`<option value="${o}" ${s.status===o?"selected":""}>${o[0].toUpperCase()+o.slice(1)}</option>`).join("")}</select></div>
        <div class="field"><label>Grade <span class="hint">out of ${maxPoints||200}</span></label><input class="input" type="number" name="grade" value="${s.grade??""}" min="0" max="${maxPoints||300}"/></div>
      </div>
      <div class="field"><label>Feedback</label><textarea name="feedback" placeholder="What was strong, what to improve…">${esc(s.feedback||"")}</textarea></div>
    </form>`,
    footerHTML:`<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--primary" data-save>Save review</button>`});
  $("[data-cancel]").addEventListener("click",closeModal);
  $("[data-save]").addEventListener("click",async()=>{
    const f=$("[data-rf]");
    try{ await db.reviewCapstone(s.id,{status:f.elements.status.value,grade:f.elements.grade.value===""?null:Number(f.elements.grade.value),feedback:f.elements.feedback.value.trim()}); toast("Review saved"); closeModal(); after(); }
    catch(e){ toast(e.message,"err"); }
  });
}

/* =============================================================== REVIEW (trainer/admin) */
async function viewReview(mount){
  if(!Auth.canManage){ mount.innerHTML=emptyBlock("Not available","This page is for trainers and admins."); return; }
  const [assignments,people]=await Promise.all([db.assignments(),db.people()]);
  const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>Review work</h1><p>Grade and give feedback on assignment submissions.</p></div></div>
    <div class="field" style="max-width:460px"><label>Choose an assignment</label>
      <select class="input" data-pick>${assignments.map(a=>`<option value="${a.id}">${esc(a.title)}</option>`).join("")||`<option>No assignments</option>`}</select></div>
    <div id="revbody"></div>`;
  const pick=$("[data-pick]");
  const load=async ()=>{
    if(!pick||!pick.value){ $("#revbody").innerHTML=emptyBlock("No assignments","Create an assignment first.",I.clip); return; }
    const aid=pick.value; const subs=await db.submissionsFor(aid);
    $("#revbody").innerHTML = subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Member</th><th>Links</th><th>Submitted</th><th>Status</th><th>Grade</th><th></th></tr></thead>
      <tbody>${subs.map(s=>{const p=pmap[s.user_id]||{};return `<tr>
        <td class="who">${esc(p.full_name||s.user_id)}<div class="muted" style="font-weight:400;font-size:.8rem">${esc(p.email||"")}</div></td>
        <td>${linkChips(s)}</td>
        <td>${fmtDate(s.submitted_at)}</td><td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b>`:"—"}</td>
        <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-rev="${s.id}">Review</button></td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("No submissions yet","No one has submitted this assignment.",I.inbox);
    $("#revbody").querySelectorAll("[data-rev]").forEach(b=>b.addEventListener("click",()=>reviewSubmission(subs.find(s=>s.id===b.dataset.rev),pmap,load)));
  };
  pick?.addEventListener("change",load); await load();
}
function reviewSubmission(s,pmap,after){
  const p=pmap[s.user_id]||{};
  openModal({title:`Review — ${p.full_name||"Member"}`,wide:true,bodyHTML:`
    ${linkChips(s)}
    ${s.notes?`<p class="muted" style="margin-top:.8rem"><b>Their notes:</b> ${esc(s.notes)}</p>`:""}
    <form data-rf style="margin-top:1rem">
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

/* =============================================================== SCHEDULE */
const sessType=(s)=> /Classroom/i.test(s.platform)?{c:'ev-class',l:'Classroom',b:'due'}
  : /Self-study/i.test(s.platform)?{c:'ev-lab',l:'Lab',b:'submitted'}
  : {c:'ev-lec',l:'Lecture',b:'reviewed'};

async function viewSchedule(mount){
  const [courses,sessions]=await Promise.all([db.courses(),db.allSessions()]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const S=sessions.filter(s=>s.scheduled_at).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at));
  const byDay={};
  for(const s of S){ const d=new Date(s.scheduled_at); const key=`${d.getFullYear()}-${d.getMonth()}`; byDay[key]=byDay[key]||{}; const dk=d.getDate(); (byDay[key][dk]=byDay[key][dk]||[]).push(s); }
  const months=[...new Set(S.map(s=>{const d=new Date(s.scheduled_at);return d.getFullYear()*12+d.getMonth();}))].sort((a,b)=>a-b);
  const now=new Date(); const nowIdx=now.getFullYear()*12+now.getMonth();
  let mi=months.findIndex(m=>m>=nowIdx); if(mi<0) mi=Math.max(0,months.length-1);
  let sel=null;

  const daySessions=(list,d,year,mon)=>{
    const dd=new Date(year,mon,d).toLocaleDateString("en-IN",{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    return `<div class="section-h"><h2>${dd}</h2><span class="count">${list.length} session${list.length!==1?'s':''}</span></div>
      <div class="rows">${list.map(s=>{const t=sessType(s);
        let action="";
        if(s.recording_url) action=`<a class="btn btn--primary btn--sm" href="${esc(s.recording_url)}" target="_blank" rel="noopener">${I.play} Recording</a>`;
        else if(s.join_url && !isPast(s.scheduled_at)) action=`<a class="btn btn--primary btn--sm" href="${esc(s.join_url)}" target="_blank" rel="noopener">Join ${I.ext}</a>`;
        return `<div class="rowc" data-open-session="${s.id}" style="cursor:pointer">
          <div class="rowc__ic">${t.c==='ev-lab'?I.book:(s.recording_url?I.play:I.cal)}</div>
          <div class="rowc__main"><h4>${esc(s.title)}</h4>
            <div class="sub"><span class="badge ${t.b}">${t.l}</span><span>${fmtDT(s.scheduled_at)}</span><span>${esc(s.platform||'')}</span></div></div>
          <div class="rowc__act">${action}<span style="color:var(--muted-2)">${I.chev}</span></div></div>`;
      }).join("")}</div>`;
  };

  const paint=()=>{
    if(!months.length){ mount.innerHTML=`<div class="page-h"><div><h1>Schedule</h1></div></div>${emptyBlock("No sessions scheduled","They'll appear here once added.",I.cal)}`; return; }
    const mnum=months[mi]; const year=Math.floor(mnum/12); const mon=mnum%12;
    const monthName=new Date(year,mon,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    const first=new Date(year,mon,1); const lead=(first.getDay()+6)%7; const days=new Date(year,mon+1,0).getDate();
    const dayMap=byDay[`${year}-${mon}`]||{};
    let cells="";
    for(let i=0;i<lead;i++) cells+=`<div class="cal-cell cal-empty"></div>`;
    for(let d=1;d<=days;d++){
      const list=dayMap[d]||[];
      const isSel=sel===d, isToday=now.getFullYear()===year&&now.getMonth()===mon&&now.getDate()===d;
      const chips=list.slice(0,3).map(s=>{const t=sessType(s);return `<span class="cal-ev ${t.c}${s.recording_url?' has-rec':''}" title="${esc(s.title)}">${esc(s.title)}</span>`;}).join("");
      cells+=`<div class="cal-cell${list.length?' cal-has':''}${isSel?' cal-sel':''}${isToday?' cal-today':''}" ${list.length?`data-day="${d}"`:''}>
        <div class="cal-date">${d}</div>${chips}${list.length>3?`<span class="cal-more">+${list.length-3} more</span>`:""}</div>`;
    }
    mount.innerHTML=`
      <div class="page-h"><div><h1>Schedule</h1><p>Calendar of every lecture, lab and classroom session — click a day to see details.</p></div></div>
      <div class="cal-legend">
        <span><i class="dot ev-lec"></i> Online lecture</span>
        <span><i class="dot ev-class"></i> Classroom</span>
        <span><i class="dot ev-lab"></i> Self-learning lab</span>
        <span><i class="dot rec"></i> Recording available</span>
      </div>
      <div class="cal">
        <div class="cal-head">
          <button class="btn btn--ghost btn--sm" data-prev ${mi<=0?'disabled':''}>${I.back}</button>
          <div class="cal-title">${monthName}</div>
          <button class="btn btn--ghost btn--sm" data-next ${mi>=months.length-1?'disabled':''}>${I.chev}</button>
        </div>
        <div class="cal-grid cal-dow">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div class="cal-dowc">${d}</div>`).join("")}</div>
        <div class="cal-grid">${cells}</div>
      </div>
      <div id="cal-detail">${sel&&dayMap[sel]?daySessions(dayMap[sel],sel,year,mon):`<p class="muted" style="margin-top:1.1rem">Select a day to see its sessions.</p>`}</div>`;
    $("[data-prev]")?.addEventListener("click",()=>{ if(mi>0){mi--;sel=null;paint();} });
    $("[data-next]")?.addEventListener("click",()=>{ if(mi<months.length-1){mi++;sel=null;paint();} });
    mount.querySelectorAll("[data-day]").forEach(el=>el.addEventListener("click",()=>{ sel=Number(el.dataset.day); paint(); }));
    mount.querySelectorAll("[data-open-session]").forEach(el=>el.addEventListener("click",e=>{ if(e.target.closest('a')) return; location.hash=`#/session/${el.dataset.openSession}`; }));
  };
  paint();
}

async function viewSession(mount,r){
  const s=await db.session(r.id);
  if(!s){ mount.innerHTML=emptyBlock("Session not found","It may have been removed.",I.cal); return; }
  const courses=await db.courses(); const c=courses.find(x=>x.id===s.course_id);
  const t=sessType(s); const past=isPast(s.scheduled_at);
  const accent = t.c==='ev-lab'?'teal':t.c==='ev-class'?'flame':'violet';
  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} Back to schedule</button>
    <div class="hero" data-accent="${accent}">
      <div class="kicker">${esc(c?c.title:'Session')} · ${t.l}</div>
      <h2>${esc(s.title)}</h2>
      <p>${fmtDT(s.scheduled_at)} · ${esc(s.platform||'')} · ${s.duration_mins||60} min</p>
      <div class="peak" style="color:rgba(255,255,255,.16)">${I.peak}</div>
    </div>
    ${s.description?`<div class="card card--pad" style="margin-top:1rem"><p style="white-space:pre-wrap;color:var(--muted);margin:0">${esc(s.description)}</p></div>`:""}
    <div class="section-h"><h2>Session content</h2></div>
    <div class="card card--pad">
      <div class="chips">
        ${s.recording_url?`<a class="mchip" href="${esc(s.recording_url)}" target="_blank" rel="noopener">${I.play} Watch recording ${I.ext}</a>`:""}
        ${s.join_url&&!past?`<a class="mchip" href="${esc(s.join_url)}" target="_blank" rel="noopener">${I.link} Join live ${I.ext}</a>`:""}
        ${c?`<a class="mchip" href="#/course/${c.id}">${I.book} Open course &amp; materials</a>`:""}
      </div>
      ${!s.recording_url&&past?`<p class="muted" style="margin:.8rem 0 0">Recording will appear here once the trainer uploads it.</p>`:""}
      ${t.c==='ev-lab'?`<p class="muted" style="margin:.8rem 0 0">Self-paced lab — revise the module and complete the assigned exercises (see Assignments).</p>`:""}
    </div>
    ${Auth.canManage?`<div style="margin-top:1rem"><button class="btn btn--ghost btn--sm" data-edit>${I.edit} Edit session</button></div>`:""}`;
  $("[data-back]").addEventListener("click",()=>location.hash='#/schedule');
  $("[data-edit]")?.addEventListener("click",()=>editSession(s.course_id,s));
}

/* =============================================================== RECORDINGS (daily feed) */
async function viewRecordings(mount){
  const courses=await db.courses();
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const recs=(await db.allSessions()).filter(s=>s.recording_url);
  recs.sort((a,b)=>new Date(b.scheduled_at||0)-new Date(a.scheduled_at||0));
  // group by day
  const groups={};
  for(const s of recs){ const key=s.scheduled_at?fmtDate(s.scheduled_at):"Undated"; (groups[key]=groups[key]||[]).push(s); }
  const keys=Object.keys(groups);
  mount.innerHTML=`
    <div class="page-h"><div><h1>Recordings</h1><p>Daily session recordings — catch up on anything you missed.</p></div></div>
    ${recs.length?keys.map(k=>`
      <div class="section-h"><h2>${esc(k)}</h2><span class="count">${groups[k].length}</span></div>
      <div class="rows">${groups[k].map(s=>{const c=cmap[s.course_id];return `
        <div class="rowc" data-open-session="${s.id}" style="cursor:pointer">
          <div class="rowc__ic">${I.play}</div>
          <div class="rowc__main"><h4>${esc(s.title)}</h4>
            <div class="sub"><span>${c?esc(c.title):"General"}</span><span>${fmtDT(s.scheduled_at)}</span><span>${esc(s.platform||"Zoom")}</span></div></div>
          <div class="rowc__act"><a class="btn btn--primary btn--sm" href="${esc(s.recording_url)}" target="_blank" rel="noopener">${I.play} Watch ${I.ext}</a><span style="color:var(--muted-2)">${I.chev}</span></div></div>`;}).join("")}</div>`).join("")
      :emptyBlock("No recordings yet","Recording links appear here as soon as trainers post them after each class.",I.play)}`;
  mount.querySelectorAll("[data-open-session]").forEach(el=>el.addEventListener("click",e=>{ if(e.target.closest('a')) return; location.hash=`#/session/${el.dataset.openSession}`; }));
}

/* =============================================================== FORUM */
async function viewForum(mount){
  const [threads,courses,people]=await Promise.all([db.threads(),db.courses(),db.people().catch(()=>[])]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>Discussion forum</h1><p>Ask a doubt, help a colleague — trainers chime in here too.</p></div>
      <button class="btn btn--primary" data-new>${I.plus} New question</button></div>
    <div class="stack">${threads.length?threads.map(t=>{
      const c=cmap[t.course_id]; const a=pmap[t.author_id];
      return `<div class="thread" data-open="${t.id}" style="cursor:pointer">
        <div class="between" style="align-items:flex-start">
          <div style="min-width:0">
            <h3 style="font-family:var(--font-d);font-size:1.05rem;margin:0 0 .25rem">
              ${t.is_pinned?`<span class="badge admin" style="margin-right:.3rem">${I.pin} Pinned</span>`:""}${esc(t.title)}</h3>
            <div class="muted" style="font-size:.83rem">${esc(a?.full_name||"Member")} · ${c?esc(c.title)+" · ":""}${fmtDate(t.created_at)}</div>
          </div>
          <div style="flex:none;text-align:right">
            ${t.is_resolved?`<span class="badge returned">${I.check} Resolved</span>`:`<span class="badge due">Open</span>`}
            <div class="muted" style="font-size:.82rem;margin-top:.35rem">${t.reply_count} ${t.reply_count===1?"reply":"replies"}</div>
          </div>
        </div>
        ${t.body?`<p class="muted" style="margin:.5rem 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(t.body)}</p>`:""}
      </div>`;
    }).join(""):emptyBlock("No questions yet","Be the first to start a discussion.",I.chat)}</div>`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/thread/${el.dataset.open}`));
  $("[data-new]").addEventListener("click",()=>newThread());
}
async function newThread(){
  const courses=await db.courses();
  formModal({title:"Ask a question", submitLabel:"Post question", wide:true,
    fields:[
      {name:"title",label:"Question",required:true,placeholder:"e.g. How do I resolve a merge conflict?"},
      {name:"course_id",label:"Related course",type:"select",options:[{value:"",label:"— General —"},...courses.map(c=>({value:c.id,label:c.title}))]},
      {name:"body",label:"Details",type:"textarea",rows:5,placeholder:"Describe what you tried and where you're stuck."},
    ], values:{course_id:""},
    onSubmit:async(d)=>{ const t=await db.createThread(d); toast("Question posted"); location.hash=`#/thread/${t.id}`; }});
}

async function viewThread(mount,r){
  const t=await db.thread(r.id);
  if(!t){ mount.innerHTML=emptyBlock("Question not found","It may have been removed.",I.chat); return; }
  const [replies,courses,people]=await Promise.all([db.threadReplies(t.id),db.courses(),db.people().catch(()=>[])]);
  const cmap=Object.fromEntries(courses.map(c=>[c.id,c]));
  const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
  const c=cmap[t.course_id]; const author=pmap[t.author_id];
  const mine=t.author_id===Auth.user.id;
  const bubble=(who,when,body,tag)=>`
    <div class="rowc" style="align-items:flex-start">
      <div class="rowc__ic" style="background:var(--grad)">${esc(initials(who))}</div>
      <div class="rowc__main">
        <div class="between" style="margin-bottom:.2rem"><b style="font-size:.92rem">${esc(who)} ${tag||""}</b><span class="muted" style="font-size:.78rem">${fmtDT(when)}</span></div>
        <p style="white-space:pre-wrap;margin:0;color:var(--text)">${esc(body)}</p>
      </div></div>`;
  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All questions</button>
    <div class="card card--pad">
      <div class="between" style="align-items:flex-start">
        <div style="min-width:0"><h1 style="font-family:var(--font-d);font-size:1.4rem;letter-spacing:-.02em;margin:0 0 .3rem">${t.is_pinned?`<span class="badge admin" style="margin-right:.4rem">${I.pin} Pinned</span>`:""}${esc(t.title)}</h1>
          <div class="muted" style="font-size:.83rem">${esc(author?.full_name||"Member")} · ${c?esc(c.title)+" · ":""}${fmtDT(t.created_at)}</div></div>
        <div style="flex:none">${t.is_resolved?`<span class="badge returned">${I.check} Resolved</span>`:`<span class="badge due">Open</span>`}</div>
      </div>
      ${t.body?`<p style="white-space:pre-wrap;color:var(--muted);margin:1rem 0 0">${esc(t.body)}</p>`:""}
      ${(Auth.canManage||mine)?`<div class="between" style="margin-top:1rem;padding-top:.9rem;border-top:1px solid var(--line)">
        <span class="muted" style="font-size:.82rem">Manage</span>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">
          <button class="btn btn--ghost btn--sm" data-resolve>${t.is_resolved?"Reopen":"Mark resolved"}</button>
          ${Auth.canManage?`<button class="btn btn--ghost btn--sm" data-pin>${t.is_pinned?"Unpin":"Pin"}</button>`:""}
          <button class="btn btn--danger btn--sm" data-del>${I.trash} Delete</button>
        </div></div>`:""}
    </div>

    <div class="section-h"><h2>Replies</h2><span class="count">${replies.length}</span></div>
    <div class="rows">${replies.map(rp=>bubble(pmap[rp.author_id]?.full_name||"Member",rp.created_at,rp.body,
      rp.is_answer?`<span class="badge returned" style="margin-left:.3rem">${I.check} Answer</span>`:(pmap[rp.author_id]?.role==="trainer"||pmap[rp.author_id]?.role==="admin"?`<span class="badge submitted" style="margin-left:.3rem">${roleLabel(pmap[rp.author_id].role)}</span>`:"")
    )).join("")||`<p class="muted">No replies yet — be the first to help.</p>`}</div>

    <div class="card card--pad" style="margin-top:1rem">
      <form data-rform>
        <div class="field"><label>Your reply</label><textarea name="body" placeholder="Share what you know…"></textarea></div>
        <button class="btn btn--primary" data-send>${I.send} Post reply</button>
      </form>
    </div>`;
  $("[data-back]").addEventListener("click",()=>location.hash="#/forum");
  $("[data-send]").addEventListener("click",async e=>{
    e.preventDefault();
    const f=$("[data-rform]"); const body=f.elements.body.value.trim();
    if(!body){ toast("Write a reply first","err"); return; }
    const btn=$("[data-send]"); btn.disabled=true; btn.textContent="Posting…";
    try{ await db.createReply({thread_id:t.id,body}); toast("Reply posted"); render(); }
    catch(err){ toast(err.message||"Couldn't post","err"); btn.disabled=false; btn.textContent="Post reply"; }
  });
  $("[data-resolve]")?.addEventListener("click",async()=>{ try{ await db.update("threads",t.id,{is_resolved:!t.is_resolved}); toast(t.is_resolved?"Reopened":"Marked resolved"); render(); }catch(e){ toast(e.message,"err"); } });
  $("[data-pin]")?.addEventListener("click",async()=>{ try{ await db.update("threads",t.id,{is_pinned:!t.is_pinned}); toast(t.is_pinned?"Unpinned":"Pinned"); render(); }catch(e){ toast(e.message,"err"); } });
  $("[data-del]")?.addEventListener("click",()=>confirmModal("Delete this question and all its replies?",async()=>{ await db.remove("threads",t.id); toast("Deleted"); location.hash="#/forum"; }));
}

/* =============================================================== PROFILE */
async function viewProfile(mount){
  const p=Auth.profile||{};
  const badge=p.role==="admin"?`<span class="badge admin">Administrator</span>`
    :p.role==="trainer"?`<span class="badge submitted">Trainer</span>`
    :`<span class="badge closed">Executive</span>`;
  mount.innerHTML=`
    <div class="page-h"><div><h1>Profile</h1><p>Your account details.</p></div></div>
    <div class="card card--pad" style="max-width:520px">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.3rem">
        <div class="av" style="width:56px;height:56px;border-radius:14px;font-size:1.3rem">${esc(initials(p.full_name))}</div>
        <div><div style="font-family:var(--font-d);font-weight:600;font-size:1.2rem">${esc(p.full_name||"You")}</div>
          <div>${badge}</div></div>
      </div>
      <form data-pform>
        <div class="field"><label>Full name</label><input class="input" name="full_name" value="${esc(p.full_name||"")}"/></div>
        <div class="row2">
          <div class="field"><label>Designation <span class="hint">optional</span></label><input class="input" name="designation" value="${esc(p.designation||"")}"/></div>
          <div class="field"><label>Location / team <span class="hint">optional</span></label><input class="input" name="team" value="${esc(p.team||"")}"/></div>
        </div>
        ${p.emp_no?`<div class="field"><label>Employee number</label><input class="input" value="${esc(p.emp_no)}" disabled/></div>`:""}
        <div class="field"><label>Login email</label><input class="input" value="${esc(p.email||"")}" disabled/></div>
        <button class="btn btn--primary" data-save>Save changes</button>
      </form>
    </div>

    <div class="section-h"><h2>Password &amp; security</h2></div>
    <div class="card card--pad" style="max-width:520px">
      ${DEMO?`<p class="muted" style="margin:0">Password changes are available once the app is connected to Supabase. In demo mode nothing is saved.</p>`:`
      <form data-pwform>
        <div class="field"><label>New password <span class="hint">at least 6 characters</span></label>
          <input class="input" name="p1" type="password" placeholder="••••••••" autocomplete="new-password"/></div>
        <div class="field"><label>Confirm new password</label>
          <input class="input" name="p2" type="password" placeholder="••••••••" autocomplete="new-password"/></div>
        <button class="btn btn--dark" data-pw>Update password</button>
      </form>`}
    </div>`;
  $("[data-save]").addEventListener("click",async e=>{
    e.preventDefault();
    const f=$("[data-pform]");
    const patch={full_name:f.elements.full_name.value.trim(),team:f.elements.team.value.trim(),designation:f.elements.designation.value.trim()};
    try{ await db.update("profiles",p.id,patch); Auth.profile={...p,...patch}; toast("Profile updated"); render(); }
    catch(err){ toast(err.message,"err"); }
  });
  $("[data-pw]")?.addEventListener("click",async e=>{
    e.preventDefault();
    const f=$("[data-pwform]"); const p1=f.elements.p1.value, p2=f.elements.p2.value;
    if(p1.length<6){ toast("Password must be at least 6 characters","err"); return; }
    if(p1!==p2){ toast("The two passwords don't match","err"); return; }
    const btn=$("[data-pw]"); btn.disabled=true; btn.textContent="Updating…";
    try{ await Auth.changePassword(p1); if(p.must_change_password){ await db.update("profiles",p.id,{must_change_password:false}); Auth.profile.must_change_password=false; }
      toast("Password updated"); f.reset(); btn.disabled=false; btn.textContent="Update password"; }
    catch(err){ toast(err.message||"Couldn't update password","err"); btn.disabled=false; btn.textContent="Update password"; }
  });
}

/* ------------------------------------------------------------- ADMIN (people) */
async function viewAdmin(mount){
  if(!Auth.isAdmin){ mount.innerHTML=emptyBlock("Admins only","You don't have access to this page."); return; }
  const people=await db.people();
  const roleBadge=(r)=>r==="admin"?`<span class="badge admin">Admin</span>`:r==="trainer"?`<span class="badge submitted">Trainer</span>`:`<span class="badge closed">Executive</span>`;
  mount.innerHTML=`
    <div class="page-h"><div><h1>Manage people</h1><p>Set who is an executive (learner), a trainer, or an administrator.</p></div></div>
    <div class="tablewrap"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Team</th><th>Role</th><th>Change role</th></tr></thead>
      <tbody>${people.map(p=>`<tr>
        <td class="who">${esc(p.full_name||"—")}</td><td>${esc(p.email||"")}</td><td>${esc(p.team||"—")}</td>
        <td>${roleBadge(p.role)}</td>
        <td style="text-align:right">${p.id===Auth.user.id?`<span class="muted" style="font-size:.8rem">You</span>`:
          `<select class="input" style="max-width:170px;padding:.35rem .6rem" data-role="${p.id}">
            ${["staff","trainer","admin"].map(r=>`<option value="${r}" ${p.role===r?"selected":""}>${roleLabel(r)}</option>`).join("")}
          </select>`}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="muted" style="font-size:.85rem;margin-top:1rem">Executives are the staff members upskilling. Trainers manage content and review work. Admins can do everything, including this page.</p>`;
  mount.querySelectorAll("[data-role]").forEach(sel=>sel.addEventListener("change",async()=>{
    try{ await db.setRole(sel.dataset.role,sel.value); toast(`Role updated to ${roleLabel(sel.value)}`); render(); }catch(e){ toast(e.message,"err"); }
  }));
}

/* ---- manager editors (create/update via generic form modal) ---- */
function editCourse(c){
  formModal({title:c?"Edit course":"New course", submitLabel:c?"Save":"Create course",
    fields:[
      {name:"title",label:"Course title",required:true,placeholder:"Git & Version Control Fundamentals"},
      {name:"summary",label:"Summary",type:"textarea",placeholder:"One or two lines about this course."},
      {name:"syllabus",label:"Syllabus",type:"textarea",rows:6,hint:"topics / outline — line breaks preserved",placeholder:"Week 1 — …\nWeek 2 — …"},
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
      {name:"recording_url",label:"Recording link",hint:"add after the class",placeholder:"https://… (Zoom cloud, YouTube, Drive)"},
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
async function editNote(n,presetCourse,presetKind){
  const courses=await db.courses();
  formModal({title:n?"Edit note":"Post note", submitLabel:n?"Save":"Post note", wide:true,
    fields:[
      {name:"title",label:"Note title",required:true,placeholder:"Git internals — the object model"},
      {row:[
        {name:"kind",label:"Section",type:"select",options:[{value:"note",label:"Faculty note"},{value:"prereq",label:"Prerequisite"}]},
        {name:"course_id",label:"Course",type:"select",options:[{value:"",label:"— General —"},...courses.map(c=>({value:c.id,label:c.title}))]},
      ]},
      {name:"body",label:"Note",type:"textarea",rows:8,placeholder:"Write the note here. Line breaks and indented code are preserved."},
      {name:"attachment_url",label:"Attachment link",hint:"optional — PDF / Drive doc",placeholder:"https://…"},
      {name:"author",label:"Author",placeholder:Auth.profile?.full_name||"Faculty"},
    ], values:n||{course_id:presetCourse||"",kind:presetKind||"note",author:Auth.profile?.full_name||"Faculty"},
    onSubmit:async(d)=>{ if(!d.course_id) d.course_id=null; if(!d.kind) d.kind="note"; if(n) await db.update("notes",n.id,d); else await db.create("notes",d); toast(n?"Note saved":"Note posted"); render(); }});
}
async function editAssignment(a){
  const courses=await db.courses();
  formModal({title:a?"Edit assignment":"New assignment", submitLabel:a?"Save":"Create assignment", wide:true,
    fields:[
      {name:"title",label:"Title",required:true,placeholder:"Set up your Git repository"},
      {name:"brief",label:"Brief",type:"textarea",rows:5,placeholder:"What to do, and what to submit (Git / Drive / recording)."},
      {row:[{name:"course_id",label:"Course",type:"select",options:[{value:"",label:"— General —"},...courses.map(c=>({value:c.id,label:c.title}))]},
            {name:"due_at",label:"Due date",type:"datetime"}]},
      {row:[{name:"points",label:"Points",type:"number",placeholder:"100"},
            {name:"is_open",label:"Accepting submissions",type:"select",options:[{value:"true",label:"Open"},{value:"false",label:"Closed"}]}]},
    ], values:a?{...a,is_open:String(a.is_open)}:{points:100,is_open:"true"},
    onSubmit:async(d)=>{ d.is_open=d.is_open==="true"; if(!d.course_id) d.course_id=null;
      if(a) await db.update("assignments",a.id,d); else await db.create("assignments",d); toast(a?"Assignment saved":"Assignment created"); render(); }});
}
async function editQuiz(q){
  const courses=await db.courses();
  formModal({title:q?"Edit quiz":"New quiz", submitLabel:q?"Save":"Create quiz",
    fields:[
      {name:"title",label:"Quiz title",required:true,placeholder:"Git basics — quick check"},
      {name:"description",label:"Description",type:"textarea",placeholder:"A short line about what it covers."},
      {row:[{name:"course_id",label:"Course",type:"select",options:[{value:"",label:"— General —"},...courses.map(c=>({value:c.id,label:c.title}))]},
            {name:"pass_pct",label:"Pass mark (%)",type:"number",placeholder:"60"}]},
    ], values:q?{...q}:{pass_pct:60,course_id:""},
    onSubmit:async(d)=>{ if(!d.course_id) d.course_id=null; d.pass_pct=d.pass_pct||60;
      if(q){ await db.update("quizzes",q.id,d); toast("Quiz saved"); render(); }
      else{ const created=await db.create("quizzes",{...d,is_published:true,sort_order:Date.now()}); toast("Quiz created — now add questions"); location.hash=`#/quiz/${created.id}`; } }});
}
function editQuestion(quizId,qq,count){
  const opts=(qq?.options||["","","",""]);
  const body=`<form data-form>
    <div class="field"><label>Question</label><textarea name="prompt" placeholder="Which command creates a new branch?">${esc(qq?.prompt||"")}</textarea></div>
    <div class="field"><label>Answer options <span class="hint">tick the correct one</span></label>
      ${[0,1,2,3].map(i=>`<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
        <input type="radio" name="correct" value="${i}" ${((qq?.correct_index)??0)===i?"checked":""}/>
        <input class="input" name="opt${i}" placeholder="Option ${i+1}" value="${esc(opts[i]||"")}"/></div>`).join("")}</div>
    <div class="field"><label>Explanation <span class="hint">shown after answering</span></label>
      <textarea name="explanation" placeholder="Why the correct answer is correct.">${esc(qq?.explanation||"")}</textarea></div>
  </form>`;
  openModal({title:qq?"Edit question":"Add question", wide:true, bodyHTML:body,
    footerHTML:`<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--primary" data-save>${qq?"Save":"Add question"}</button>`});
  $("[data-cancel]").addEventListener("click",closeModal);
  $("[data-save]").addEventListener("click",async()=>{
    const f=$("[data-form]");
    const prompt=f.elements.prompt.value.trim();
    const options=[0,1,2,3].map(i=>f.elements["opt"+i].value.trim()).filter(Boolean);
    const correct=Number(f.elements.correct.value);
    if(!prompt){ toast("Enter the question","err"); return; }
    if(options.length<2){ toast("Add at least two options","err"); return; }
    if(correct>options.length-1){ toast("The correct option is empty","err"); return; }
    const row={quiz_id:quizId,prompt,options,correct_index:correct,explanation:f.elements.explanation.value.trim(),points:1};
    try{
      if(qq) await db.update("quiz_questions",qq.id,row);
      else await db.create("quiz_questions",{...row,sort_order:(count||0)+1});
      toast(qq?"Question saved":"Question added"); closeModal(); render();
    }catch(e){ toast(e.message,"err"); }
  });
}
async function editCapstone(cap){
  formModal({title:cap?"Edit capstone":"Create capstone", submitLabel:cap?"Save":"Create", wide:true,
    fields:[
      {name:"title",label:"Capstone title",required:true,placeholder:"ASCEND 2026 Capstone Project"},
      {name:"brief",label:"Brief",type:"textarea",rows:3,placeholder:"The one-paragraph pitch of the capstone."},
      {name:"guidelines",label:"Guidelines & deliverables",type:"textarea",rows:6,placeholder:"Deliverables, evaluation criteria… line breaks preserved."},
      {row:[{name:"due_at",label:"Due date",type:"datetime"},{name:"points",label:"Points",type:"number",placeholder:"200"}]},
    ], values:cap?{...cap}:{points:200},
    onSubmit:async(d)=>{ if(cap){ await db.update("capstones",cap.id,d); } else { await db.create("capstones",{...d,is_open:true,sort_order:Date.now()}); } toast(cap?"Capstone saved":"Capstone created"); render(); }});
}

/* =============================================================== BOOT */
window.addEventListener("hashchange", render);
(async()=>{ await Auth.init(); render(); })();

})();
