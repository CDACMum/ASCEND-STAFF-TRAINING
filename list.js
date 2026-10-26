async function viewAssignments(mount){
  const [assignments,courses]=await Promise.all([db.assignments(),db.courses()]);
  const mine=Auth.canManage?[]:await db.mySubmissions(Auth.user.id).catch(()=>[]);
  const all=Auth.canManage?await db.allSubmissions().catch(()=>[]):[];
  const byId=Object.fromEntries(mine.map(s=>[s.assignment_id,s]));
  const list=[...assignments].sort((x,y)=>new Date(y.due_at)-new Date(x.due_at));   // newest first

  // First paragraph of the brief, as plain text, for the card summary.
  const intro=(b)=>{ const out=[]; for(const ln of String(b||"").replace(/\r/g,"").split("\n")){ const t=ln.trim();
      if(/^[─━═\-_=]{4,}$/.test(t)) break; if(!t){ if(out.length) break; continue; } if(/^DUE:/i.test(t)) continue; out.push(t); }
    const s=out.join(" "); return s.length>230?s.slice(0,227).replace(/\s+\S*$/,"")+"…":s; };
  const qCount=(b)=>briefModel(b).reduce((n,s)=>n+s.q,0);
  const tag=(a,i)=>{ const m=String(a.title||"").match(/assignment\s*(\d+)/i); return m?`A${m[1]}`:`#${list.length-i}`; };

  let summary="";
  if(!Auth.canManage && list.length){
    const done=mine.filter(s=>byId[s.assignment_id]===s && list.some(a=>a.id===s.assignment_id));
    const graded=done.filter(s=>s.grade!=null);
    const pct=graded.length?Math.round(graded.reduce((n,s)=>{const a=list.find(x=>x.id===s.assignment_id);return n+s.grade/(Number(a?.points)||100)*100;},0)/graded.length):null;
    const todo=list.filter(a=>!byId[a.id] && a.is_open).length;
    summary=`<div class="al-sum">
      <div><b>${done.length}<span>/ ${list.length}</span></b><small>Submitted</small></div>
      <div><b>${todo}</b><small>Still to do</small></div>
      <div><b>${done.filter(s=>s.status==="submitted").length}</b><small>Awaiting review</small></div>
      <div><b>${pct!=null?pct+"%":"—"}</b><small>Average score</small></div></div>`;
  } else if(Auth.canManage && list.length){
    const pend=all.filter(s=>s.status==="submitted").length;
    summary=`<div class="al-sum">
      <div><b>${list.length}</b><small>Assignments</small></div>
      <div><b>${list.filter(a=>a.is_open).length}</b><small>Open</small></div>
      <div><b>${all.length}</b><small>Submissions</small></div>
      <div><b>${pend}</b><small>Awaiting review</small></div></div>`;
  }

  const card=(a,i)=>{
    const c=courses.find(x=>x.id===a.course_id); const sub=byId[a.id];
    const late=isPast(a.due_at); const q=qCount(a.brief);
    const subsA=all.filter(s=>s.assignment_id===a.id), pendA=subsA.filter(s=>s.status==="submitted").length;
    let right, cta;
    if(Auth.canManage){
      right=`<div class="al-count"><b>${subsA.length}</b><small>submitted</small>${pendA?`<span class="badge submitted">${pendA} to review</span>`:subsA.length?`<span class="badge reviewed">All reviewed</span>`:""}</div>`;
      cta=pendA?"Review submissions":"Open";
    } else if(sub && sub.grade!=null){
      const pct=Math.max(0,Math.min(100,Math.round(sub.grade/(Number(a.points)||100)*100))); const [band,cls]=gradeBand(pct);
      right=`<div class="al-ring ${cls}" style="--p:${pct}"><div><b>${sub.grade}</b><small>/ ${a.points}</small></div></div><div class="al-band ${cls}">${band}</div>`;
      cta=sub.status==="returned"?"See feedback & resubmit":"See review";
    } else {
      right=`<div class="al-state">${stuBadge(sub)}</div>`;
      cta=sub?"View submission":(a.is_open?"Start & submit":"View brief");
    }
    const dueCls=Auth.canManage?"":(sub?"":late?"is-late":(new Date(a.due_at)-Date.now()<3*864e5?"is-soon":""));
    return `<article class="al-card ${!Auth.canManage&&!sub&&a.is_open?"is-todo":""} ${sub?.status==="returned"?"is-returned":""}" data-open="${a.id}" tabindex="0" role="link">
      <div class="al-tag">${tag(a,i)}</div>
      <div class="al-main">
        <div class="al-course">${c?esc(c.title):"General"}${a.is_open?"":` · <span class="al-closed">Closed</span>`}</div>
        <h3>${esc(a.title.replace(/^assignment\s*\d+\s*[—–:-]\s*/i,""))}</h3>
        <p>${esc(intro(a.brief))}</p>
        <div class="al-meta">
          <span class="${dueCls}">${I.clock} Due ${fmtDT(a.due_at)}${!Auth.canManage&&!sub?` · ${relDue(a.due_at)}`:""}</span>
          <span>${a.points} points</span>
          ${q?`<span>${q} questions</span>`:""}
          ${sub?`<span>Submitted ${fmtDate(sub.submitted_at)}</span>`:""}
        </div>
      </div>
      <div class="al-side">${right}<span class="btn ${!Auth.canManage&&!sub&&a.is_open?"btn--primary":"btn--ghost"} btn--sm">${cta} ${I.chev}</span></div>
    </article>`;
  };

  mount.innerHTML=`
    <div class="page-h"><div><h1>Assignments</h1><p>${Auth.canManage?"Briefs, submissions and reviews for every assignment.":"Read the brief, submit your links, and see your grade and trainer feedback here."}</p></div>
      ${Auth.canManage?`<button class="btn btn--primary" data-add>${I.plus} New assignment</button>`:""}</div>
    ${summary}
    <div class="al-list">${list.map(card).join("")||emptyBlock("No assignments yet","They'll appear here once published.",I.clip)}</div>`;
  mount.querySelectorAll("[data-open]").forEach(el=>{
    const go=()=>location.hash=`#/assignment/${el.dataset.open}`;
    el.addEventListener("click",go);
    el.addEventListener("keydown",e=>{ if(e.key==="Enter") go(); });
  });
  $("[data-add]")?.addEventListener("click",()=>editAssignment(null));
}

