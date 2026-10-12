/* ---- Assignment page helpers: brief renderer, participant status & review ---- */
function niceTitle(t){
  t=String(t||"").trim();
  const sentence=(w)=>w.toLowerCase().replace(/[a-z]/,ch=>ch.toUpperCase()).replace(/\b(part|module|level) ([a-z])\b/gi,(m,x,c)=>x+" "+c.toUpperCase());
  if(!/[a-z]/.test(t)) return sentence(t);
  // "🏬 BUSINESS PROBLEM 1 — Meridian" / "MARKING (100 points)": soften the shouty prefix only
  return t.replace(/^([^A-Za-z0-9]*)([A-Z][A-Z0-9]*(?: [A-Z0-9]+)*)(?=\s*(?:[—–(-]|$))/,(m,pre,cap)=>/[A-Z]{3,}/.test(cap)?pre+sentence(cap):m);
}
function relDue(d){
  const ms=new Date(d)-Date.now(), n=Math.round(Math.abs(ms)/864e5);
  if(ms>0) return n<1?"due today":`${n} day${n>1?"s":""} left`;
  return n<1?"due date passed today":`due date passed ${n} day${n>1?"s":""} ago`;
}
function stuLabel(s){ if(!s) return "Not submitted"; return {submitted:"Awaiting review",reviewed:"Reviewed",returned:"Returned for changes"}[s.status]||s.status; }
function stuBadge(s){
  if(!s) return `<span class="badge closed">Not submitted</span>`;
  const cls={submitted:"submitted",reviewed:"reviewed",returned:"due"}[s.status]||"submitted";
  return `<span class="badge ${cls}">${stuLabel(s)}</span>`;
}
const gradeBand=(pct)=>pct>=85?["Excellent","g-ex"]:pct>=70?["Good","g-good"]:pct>=50?["Satisfactory","g-ok"]:["Needs work","g-low"];

// Splits an assignment brief into titled sections. Understands divider-framed headings,
// "── Part A — … (n questions) ──" part bars, "Group (Q1–8)" labels, numbered questions,
// "• key — description" bullets and indented code.
function briefModel(txt){
  const lines=String(txt||"").replace(/\r/g,"").split("\n");
  const isDiv=(s)=>/^[─━═\-_=]{4,}$/.test((s||"").trim());
  const secs=[{title:"",html:"",n:0}]; let cur=secs[0]; let code=[]; let list=false;
  const flush=()=>{ if(code.length){ cur.html+=`<pre class="rt-code">${esc(code.join("\n"))}</pre>`; code=[]; } };
  const closeList=()=>{ if(list){ cur.html+="</ul>"; list=false; } };
  for(let i=0;i<lines.length;i++){
    const ln=lines[i], t=ln.trim();
    if(/^DUE:/i.test(t)) continue;                       // shown in the page header instead
    if(isDiv(t)){
      flush(); closeList();
      const h=lines[i+1];
      if(h!==undefined && h.trim() && !isDiv(h)){ cur={title:h.trim(),html:"",n:0}; secs.push(cur); i++; if(isDiv(lines[i+1])) i++; }
      continue;
    }
    const part=t.match(/^[─━═=\-]{2,}\s+(.+?)\s+[─━═=\-]{2,}$/);
    if(part){
      flush(); closeList();
      const pm=part[1].match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      cur.html+=`<div class="ab-part"><span>${esc(pm?pm[1]:part[1])}</span>${pm?`<em>${esc(pm[2])}</em>`:""}</div>`;
      continue;
    }
    if(/^(\s{4,}|\t)\S/.test(ln)){ closeList(); code.push(ln.replace(/^(\s{4}|\t)/,"")); continue; }
    flush();
    if(!t){ closeList(); continue; }
    const q=t.match(/^(\d{1,3})[.)]\s+(.+)$/);
    if(q){ closeList(); cur.n++; cur.html+=`<div class="ab-q"><span class="ab-qn">${q[1]}</span><div class="ab-qt">${linkify(q[2])}</div></div>`; continue; }
    const grp=t.match(/^([A-Z][^.:]{1,60}?)\s*\((Q\d+\s*[–-]\s*Q?\d+)\)\s*:?$/);
    if(grp){ closeList(); cur.html+=`<div class="ab-grp">${esc(grp[1])}<span>${esc(grp[2])}</span></div>`; continue; }
    if(/^[A-Z]{4,}\b/.test(t) && t.length<60 && !/[.?]$/.test(t)){ closeList(); cur.html+=`<div class="ab-grp">${esc(niceTitle(t))}</div>`; continue; }
    if(/^[•\-]\s/.test(t)){
      if(!list){ cur.html+=`<ul class="ab-ul">`; list=true; }
      const body=t.replace(/^[•\-]\s+/,"");
      const k=body.match(/^(.{1,42}?)(\s+)[—–]\s+(.+)$/);
      if(k&&k[2].length>1) k[1]+=k[2].slice(1);          // keep meaningful trailing spaces ("Client Name ")
      const mono=k&&(/[_.]/.test(k[1])||/^[a-z]/.test(k[1])||/\s$/.test(k[1]));
      cur.html+=`<li>${k?`<b class="${mono?"is-mono":""}">${esc(k[1])}</b> — ${linkify(k[3])}`:linkify(body)}</li>`;
      continue;
    }
    closeList();
    cur.html+=`<p>${linkify(t)}</p>`;
  }
  flush(); closeList();
  // A section is a question paper only if it holds a real run of numbered items (not a 3-step "how to work").
  for(const s of secs) s.q=s.n>=8?s.n:0;
  return secs.filter(s=>s.title||s.html.trim());
}

function subSteps(sub){
  const st=sub?.status;
  const steps=[
    {l:"Submitted", s:sub?"done":"cur", d:sub?fmtDT(sub.submitted_at):"Not yet"},
    {l:"Trainer review", s:!sub?"todo":st==="submitted"?"cur":"done", d:!sub?"":st==="submitted"?"In the review queue":"Done"},
    {l:st==="returned"?"Returned for changes":"Graded", s:st==="reviewed"?"done":st==="returned"?"warn":"todo",
     d:(st==="reviewed"||st==="returned")&&sub.reviewed_at?fmtDT(sub.reviewed_at):""}
  ];
  return `<ol class="ab-steps">${steps.map(x=>`<li class="is-${x.s}"><span class="ab-dot">${x.s==="done"?I.check:x.s==="warn"?"!":""}</span><div><b>${x.l}</b>${x.d?`<small>${esc(x.d)}</small>`:""}</div></li>`).join("")}</ol>`;
}

function reviewCard(sub,points){
  if(!sub) return "";
  const fb=(sub.feedback||"").trim();
  if(sub.grade==null && !fb) return "";
  const stale=sub.status==="submitted";               // resubmitted after an earlier review
  const pts=Number(points)||100;
  const pct=sub.grade!=null?Math.max(0,Math.min(100,Math.round(sub.grade/pts*100))):null;
  const [band,cls]=pct!=null?gradeBand(pct):["",""];
  return `<div class="card ab-review ${sub.status==="returned"?"is-returned":""}">
    <div class="ab-review__h"><span>${stale?"Previous review":"Trainer review"}</span>${sub.reviewed_at?`<small>${fmtDT(sub.reviewed_at)}</small>`:""}</div>
    ${sub.status==="returned"?`<div class="ab-alert">Returned for changes. Read the feedback, update your work and resubmit.</div>`:""}
    ${stale?`<div class="ab-note">You updated your submission after this review, so it is back in the review queue.</div>`:""}
    ${pct!=null?`<div class="ab-score ${cls}"><div class="ab-score__n"><b>${sub.grade}</b><span>/ ${pts}</span></div>
      <div class="ab-score__band">${band} · ${pct}%</div><div class="ab-bar"><i style="width:${pct}%"></i></div></div>`:""}
    ${fb?`<div class="ab-fb"><div class="ab-fb__l">Feedback</div><div class="ab-fb__t">${linkify(fb).replace(/\n/g,"<br>")}</div></div>`:""}
  </div>`;
}

async function viewAssignment(mount,r){
  const a=await db.assignment(r.id);
  if(!a){ mount.innerHTML=emptyBlock("Assignment not found",""); return; }
  const courses=await db.courses();
  const c=courses.find(x=>x.id===a.course_id);
  const sub=Auth.canManage?null:await db.mySubmission(a.id,Auth.user.id).catch(()=>null);
  const overdue=isPast(a.due_at);
  const closed=!a.is_open;
  const secs=briefModel(a.brief);
  const qTotal=secs.reduce((n,s)=>n+s.q,0);
  const titled=secs.map((s,i)=>({s,i})).filter(x=>x.s.title);

  const hero=`<div class="ab-hero">
    <div class="ab-hero__k">${c?esc(c.title):"General"} · Assignment</div>
    <h1>${esc(a.title)}</h1>
    <div class="ab-facts">
      <div><small>Due</small><b>${fmtDT(a.due_at)}</b><span class="${overdue?"is-late":""}">${relDue(a.due_at)}</span></div>
      <div><small>Points</small><b>${a.points}</b><span>${qTotal?`${qTotal} questions`:"in total"}</span></div>
      <div><small>${Auth.canManage?"Submissions":"Your status"}</small><b>${Auth.canManage?(closed?"Closed":"Open"):esc(stuLabel(sub))}</b>
        <span>${Auth.canManage?(closed?"not accepting work":"accepting work"):(sub?`submitted ${fmtDate(sub.submitted_at)}`:(closed?"submissions closed":"nothing submitted yet"))}</span></div>
    </div></div>`;

  const brief=`<div class="ab-brief">
    ${titled.length>1?`<nav class="ab-toc" aria-label="Sections">${titled.map(x=>`<button type="button" data-jump="${x.i}">${esc(niceTitle(x.s.title))}</button>`).join("")}</nav>`:""}
    ${secs.map((s,i)=>`<section class="card ab-sec" id="ab-sec-${i}">
      ${s.title?`<h2 class="ab-h"><span>${esc(niceTitle(s.title))}</span>${s.q?`<span class="ab-count">${s.q} questions</span>`:""}</h2>`:""}
      <div class="ab-body">${s.html}</div></section>`).join("")}
  </div>`;

  const showForm=!sub && !closed;
  const side=Auth.canManage?"":`<aside class="ab-side">
    ${reviewCard(sub,a.points)}
    <div class="card ab-panel">
      <div class="ab-panel__h">Your submission</div>
      ${subSteps(sub)}
      ${sub?`<div class="ab-mine"><div class="ab-mine__l">Submitted links</div>${linkChips(sub)}
        ${sub.notes?`<p class="ab-mine__n">Your note: ${esc(sub.notes)}</p>`:""}
        ${closed?"":`<button type="button" class="btn btn--ghost btn--sm" data-editsub>${I.edit} ${sub.status==="returned"?"Resubmit":"Update submission"}</button>`}</div>`:""}
      ${closed&&!sub?`<div class="ab-note">This assignment is closed for submissions.</div>`:""}
      <form data-sform class="ab-form" ${showForm?"":"hidden"}>
        <div class="field"><label>Git repository link <span class="hint">GitHub / GitLab URL</span></label>
          <input class="input" name="git" type="url" placeholder="https://github.com/you/ascend-you" value="${esc(sub?.git_url||"")}"/></div>
        <div class="field"><label>Google Drive link <span class="hint">notebook, docs, files</span></label>
          <input class="input" name="drive" type="url" placeholder="https://drive.google.com/…" value="${esc(sub?.drive_url||"")}"/></div>
        <div class="field"><label>Recording link <span class="hint">optional</span></label>
          <input class="input" name="rec" type="url" placeholder="https://…" value="${esc(sub?.recording_url||"")}"/></div>
        <div class="field"><label>Note for the reviewer <span class="hint">optional</span></label>
          <textarea name="notes" placeholder="Anything the reviewer should know…">${esc(sub?.notes||"")}</textarea></div>
        <button class="btn btn--primary" data-submit>${sub?"Save and resubmit":"Submit work"}</button>
        ${sub&&sub.status!=="submitted"?`<p class="ab-hint">Resubmitting sends your work back to the review queue.</p>`:""}
        ${overdue&&!sub?`<p class="ab-hint">The due date has passed. Late work is still accepted while the assignment is open.</p>`:""}
      </form>
    </div>
  </aside>`;

  const managerBlock=Auth.canManage?`
    <div class="section-h" style="margin-top:1.4rem"><h2>Submissions</h2></div>
    <div id="asubs"><div class="spinner"></div></div>
    <div class="between" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--line)">
      <span class="muted" style="font-size:.85rem">Manage</span>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn--ghost btn--sm" data-edit-a>${I.edit} Edit assignment</button>
        <button class="btn btn--danger btn--sm" data-del-a>${I.trash} Delete</button></div></div>`:"";

  mount.innerHTML=`
    <button class="btn btn--ghost btn--sm" data-back style="margin-bottom:1rem">${I.back} All assignments</button>
    ${hero}
    <div class="ab-layout ${Auth.canManage?"is-wide":""}">${brief}${side}</div>
    ${managerBlock}`;

  $("[data-back]").addEventListener("click",()=>location.hash="#/assignments");
  mount.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>{
    document.getElementById(`ab-sec-${b.dataset.jump}`)?.scrollIntoView({behavior:"smooth",block:"start"});
  }));

  if(Auth.canManage){
    $("[data-edit-a]").addEventListener("click",()=>editAssignment(a));
    $("[data-del-a]").addEventListener("click",()=>confirmModal("Delete this assignment and its submissions?",async()=>{await db.remove("assignments",a.id);toast("Assignment deleted");location.hash="#/assignments";}));
    const [subs,people]=await Promise.all([db.submissionsFor(a.id),db.people().catch(()=>[])]);
    const pmap=Object.fromEntries(people.map(p=>[p.id,p]));
    const pending=subs.filter(s=>s.status==="submitted").length;
    const graded=subs.filter(s=>s.grade!=null);
    const avg=graded.length?Math.round(graded.reduce((n,s)=>n+Number(s.grade),0)/graded.length):null;
    const order={submitted:0,returned:1,reviewed:2};
    subs.sort((x,y)=>(order[x.status]??0)-(order[y.status]??0)||new Date(x.submitted_at)-new Date(y.submitted_at));
    $("#asubs").innerHTML=subs.length?`
      <div class="ab-stats">
        <div><b>${subs.length}</b><span>Submitted</span></div>
        <div><b>${pending}</b><span>Awaiting review</span></div>
        <div><b>${subs.length-pending}</b><span>Reviewed or returned</span></div>
        <div><b>${avg??"—"}</b><span>Average grade${avg!=null?` / ${a.points}`:""}</span></div>
      </div>
      <div class="tablewrap"><table>
      <thead><tr><th>Member</th><th>Links</th><th>Submitted</th><th>Status</th><th>Grade</th><th>Feedback</th><th></th></tr></thead>
      <tbody>${subs.map(s=>{const p=pmap[s.user_id]||{};return `<tr>
        <td class="who">${esc(p.full_name||s.user_id)}</td>
        <td>${linkChips(s)}</td>
        <td>${fmtDate(s.submitted_at)}</td><td>${statusBadge({status:s.status})}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b><span class="muted"> / ${a.points}</span>`:"—"}</td>
        <td><div class="fb-snip">${s.feedback?esc(s.feedback):"<span class='muted'>—</span>"}</div></td>
        <td style="text-align:right"><button class="btn btn--ghost btn--sm" data-rev="${s.id}">${s.status==="submitted"?"Review":"Edit review"}</button></td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("No submissions yet","No one has submitted this assignment.",I.inbox);
    $("#asubs").querySelectorAll("[data-rev]").forEach(b=>b.addEventListener("click",()=>reviewSubmission(subs.find(s=>s.id===b.dataset.rev),pmap,()=>render(),a.points)));
  } else {
    $("[data-editsub]")?.addEventListener("click",(e)=>{
      const f=$("[data-sform]"); f.hidden=false; e.currentTarget.hidden=true; f.elements.git.focus();
    });
    $("[data-submit]").addEventListener("click", async (e)=>{
      e.preventDefault();
      const f=$("[data-sform]");
      const git=f.elements.git.value.trim(), drive=f.elements.drive.value.trim(), rec=f.elements.rec.value.trim();
      if(!git && !drive && !rec){ toast("Add at least one link (Git, Drive or recording)","err"); f.elements.git.focus(); return; }
      for(const v of [git,drive,rec]){ if(v && !isURL(v)){ toast("One of the links isn't a valid URL","err"); return; } }
      const btn=$("[data-submit]"); btn.disabled=true; btn.textContent="Submitting…";
      try{ await db.submit({assignment_id:a.id,user_id:Auth.user.id,git_url:git,drive_url:drive,recording_url:rec,notes:f.elements.notes.value.trim()}); toast("Submission saved"); render(); }
      catch(err){ toast(err.message||"Couldn't submit","err"); btn.disabled=false; btn.textContent=sub?"Save and resubmit":"Submit work"; }
    });
  }
}

async function viewMySubmissions(mount){
  const [subs,assignments]=await Promise.all([db.mySubmissions(Auth.user.id),db.assignments()]);
  const byId=Object.fromEntries(assignments.map(a=>[a.id,a]));
  mount.innerHTML=`
    <div class="page-h"><div><h1>My submissions</h1><p>Every assignment you've turned in, its status, grade and trainer feedback.</p></div></div>
    ${subs.length?`<div class="tablewrap"><table>
      <thead><tr><th>Assignment</th><th>Submitted</th><th>Status</th><th>Grade</th><th>Feedback</th><th></th></tr></thead>
      <tbody>${subs.map(s=>{const a=byId[s.assignment_id]||{};return `<tr data-open="${s.assignment_id}" style="cursor:pointer">
        <td class="who">${esc(a.title||"—")}</td>
        <td>${fmtDate(s.submitted_at)}</td>
        <td>${stuBadge(s)}</td>
        <td>${s.grade!=null?`<b>${s.grade}</b><span class="muted"> / ${a.points||100}</span>`:"—"}</td>
        <td><div class="fb-snip">${s.feedback?esc(s.feedback):"<span class='muted'>Not reviewed yet</span>"}</div></td>
        <td style="text-align:right"><span class="btn btn--ghost btn--sm">Open ${I.chev}</span></td></tr>`;}).join("")}</tbody>
    </table></div>`:emptyBlock("Nothing submitted yet","Head to Assignments to turn in your first piece of work.",I.inbox)}`;
  mount.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=`#/assignment/${el.dataset.open}`));
}

