function reviewSubmission(s,pmap,after,points){
  const p=pmap[s.user_id]||{};
  const pts=Number(points)||100;
  openModal({title:`Review — ${p.full_name||"Member"}`,wide:true,bodyHTML:`
    <div class="muted" style="font-size:.85rem;margin-bottom:.6rem">Submitted ${fmtDT(s.submitted_at)}${s.reviewed_at?` · last reviewed ${fmtDT(s.reviewed_at)}`:""}</div>
    ${linkChips(s)}
    ${s.notes?`<div class="ab-fb" style="margin-top:.8rem"><div class="ab-fb__l">Participant's note</div><div class="ab-fb__t">${linkify(s.notes).replace(/\n/g,"<br>")}</div></div>`:""}
    <form data-rf style="margin-top:1rem">
      <div class="row2">
        <div class="field"><label>Status</label><select class="input" name="status">
          ${[["submitted","Awaiting review"],["reviewed","Reviewed (final)"],["returned","Returned for changes"]].map(([v,l])=>`<option value="${v}" ${s.status===v?"selected":""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label>Grade <span class="hint">out of ${pts}</span></label><input class="input" type="number" name="grade" value="${s.grade??""}" min="0" max="${pts}" step="1"/></div>
      </div>
      <div class="field"><label>Feedback <span class="hint">the participant sees this exactly as written</span></label><textarea name="feedback" rows="7" placeholder="What was strong, what to improve…">${esc(s.feedback||"")}</textarea></div>
    </form>`,
    footerHTML:`<button class="btn btn--ghost" data-cancel>Cancel</button><button class="btn btn--primary" data-save>Save review</button>`});
  $("[data-cancel]").addEventListener("click",closeModal);
  $("[data-save]").addEventListener("click",async()=>{
    const f=$("[data-rf]");
    const graw=f.elements.grade.value.trim();
    const grade=graw===""?null:Math.round(Number(graw));
    if(grade!=null && (isNaN(grade)||grade<0||grade>pts)){ toast(`Grade must be between 0 and ${pts}`,"err"); f.elements.grade.focus(); return; }
    const feedback=f.elements.feedback.value.trim();
    let status=f.elements.status.value;
    // Giving a grade or feedback on a pending submission marks it reviewed.
    if(status==="submitted" && (grade!=null || feedback)) status="reviewed";
    try{ await db.review(s.id,{status,grade,feedback}); toast(status==="returned"?"Returned to participant":"Review saved"); closeModal(); after(); }
    catch(e){ toast(e.message,"err"); }
  });
}

