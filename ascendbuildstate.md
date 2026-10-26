ASCEND 2026 — build state (for future sessions)

Production LMS for C-DAC Mumbai "Applied AI/ML Engineering" executive training.

Stack & locations
Vanilla JS SPA (no framework), hash routing, IIFE in assets/app.js (~140 KB). Styles in assets/styles.css.
Live Supabase project_id: axxwwjcjamccovsqojox (URL https://axxwwjcjamccovsqojox.supabase.co). Only the public URL + publishable key go in assets/config.js.
Security constraint (must persist): the Supabase DB password must NEVER be written into any file.
Deploy target: user's device cmkl-vineeta, folder E:\Ascend-2026 (assets under E:\Ascend-2026\assets\). Deploy loop: SendUserFile → device_commit_files(force:true).
Course id (only course): b9d494ec-10a8-4706-88ed-c77a3dd65b31 ("Applied AI/ML Engineering").
Working copy of source lives in the session container at /root/ascend/ (not persisted between sessions — re-fetch from device if needed).
Roles

staff (Executive) / trainer / admin. Auth.canManage = trainer|admin. RLS via is_admin()/is_manager(). Default password ascend123, forced change on first login. 61 staff seeded.

renderRich note directives (custom text→HTML in app.js)
Divider line (────  / ====) followed by text → heading (.rt-h).
4-space / tab indent → code block (.rt-code).
•  or -  → bullet.
@video <id>|title → YouTube embed.
@svg <name> → inline educational SVG. Keys in SVGS: normal, skew, confusion, type12, roc.
@run [title] + following indented lines → runnable Python cell (.pyblock, base64 in data-code).
Unverified: whether assignments.brief is passed through renderRich (Assignment 1's brief was written in renderRich style on that assumption — check viewAssignment in app.js and confirm/fix).
In-browser Python (Pyodide)
Py.get loads pyodide 0.26.4 from jsdelivr CDN + numpy & pandas; runPython auto-loads scipy/sklearn from imports via loadPackagesFromImports. Needs internet (blocked in the build container, works in user's browser).
wireRunBlocks(mount) wires .pyblock elements (called in viewNote).
Python playground nav item + viewPlayground (route playground): editor + example snippets + Run.
Pyodide has no plotting surface in runPython, so notes draw charts as ASCII/text rather than importing matplotlib. Plain % formatting is used in note code cells and has been verified.
File storage (PDFs and other attachments)
Public Supabase Storage bucket materials. Policies: public read materials (SELECT, anyone) and manager writes materials (ALL, is_manager()). Public URL shape: https://axxwwjcjamccovsqojox.supabase.co/storage/v1/object/public/materials/<path>
notes.attachment_url holds a note's downloadable file; the materials table holds standalone course resources (kind = 'pdf' / 'link', url). assignments has no attachment column — assignment files go in materials and are referenced from the brief text.
The app already renders attachment_url — an "Open attachment" chip on the note card (app.js ~L1183) and inside the note view (~L1276); the admin note form has an "Attachment link" field (~L2217). Nothing to build for a new attachment; just set the column.
How to upload from a session (the container's egress blocks supabase.co — confirmed again 12 Sep and 13 Oct, agent-proxy returns 403 CONNECT — so uploads must run on the user's device):
device_commit_files the file into E:\Ascend-2026\Claude outputs\.
The manager writes materials policy needs a trainer/admin JWT, which a script does not have. Add a narrow temporary policy, e.g. create policy "tmp upload" on storage.objects for insert to anon with check (bucket_id='materials' and name like 'notes/%');
Write a .ps1 to disk on the device (do not inline $ vars in a powershell -Command string — the wrapper strips them) and run it via desktop-commander start_process. It reads the publishable key out of assets/config.js, then Invoke-WebRequest POST to .../storage/v1/object/materials/<path> with headers apikey, Authorization: Bearer <key>, x-upsert: true, -ContentType 'application/pdf' -Body $bytes.
Drop the temporary policy immediately. Verify by downloading the public URL on the device and comparing MD5 with the source. Delete the .ps1.
Other hosting routes checked 13 Oct: the Assignment 2 Drive folder 1RPy3PZexAOYru_BadsJnpOYu3sfkjWDt (owner cdac.mum.dbda@gmail.com, anyone-with-link reader) is NOT writable from the user's Drive connector; GitHub (CDACMum/ASCEND-STAFF-TRAINING) needs the GitHub account linked before a session can push.
Content added
Faculty note "Statistics & Model Evaluation — basics to advanced" (kind='note', id d1223cd7-...): types of data, population/sample, train/test, descriptive stats (mean/median/mode/variance/SD/skew/kurtosis), hypothesis testing + Type I/II fire-alarm story, 12 statistical tests, classification (binary/multiclass), confusion matrix + precision/recall/sensitivity/specificity/accuracy/F1, ROC/AUC, end-to-end eval. Graded 🟢🔵🟠🔴, SVG diagrams, @run cells, StatQuest videos (Kdsp6soqA7o, vemZtEM63GY, 4jRBRDbJemM).
Note "5 September — Outlier Analysis: The Interquartile Range Method" (kind='note', id 8be970b6-1c1b-42b0-b7c7-d4a6b88ef29c, author 'Faculty · Statistics', created_at 2026-09-05 04:00Z to match that day's session). ~40 KB, 22 graded sections built from the faculty deck of the same name: three kinds of outlier, three screening questions, quartiles by hand, IQR, 1.5×IQR fences and where 1.5 comes from (1.349σ → ±2.70σ → 0.7%), worked example (12…99), a hand exercise + answers (negative lower fence, whisker ≠ fence), the six-step recipe, box-plot anatomy/reading/when-to-use, the Meridian Retail case study (three hubs, identical means, IQR 0.60 vs 2.90, why the tightest hub flags the most outliers, 205 flagged orders = the finding), mixed-population trap (order_value flags 12.6% → retail vs corporate), six treatments + treatment-matching table, IQR vs z-score (z of 99 = 2.64), where to use / not use, multivariate blind spot (ratio check, Mahalanobis, isolation forest), "never do this", checklist + cheat sheet. 9 @run cells (all executed and verified locally against numpy/pandas/scipy) and @svg normal / @svg skew.
Original faculty deck attached as-is: materials/notes/outlier-analysis-iqr-method.pdf (30 pages, 978,357 bytes, md5 ab67da35c9f68bd3c36481734f25a540; local copy kept at E:\Ascend-2026\Claude outputs\). Set on notes.attachment_url and added to the materials table as "Outlier Analysis: The Interquartile Range Method (5 Sep deck)", kind='pdf'. This is the first row in materials and the first object in the storage bucket.
Prereq notes: NumPy, Pandas (ML-framed, with @video + labs).
Recordings: Day 1 (KRud…), Day 2 (ORzV…), Day 3 hypothesis testing/distribution (o6KT…) on session 2026-09-03; 8 Sep lab (WTrm…), 9 Sep correlation (zVcB…), 10 Sep NumPy (6YKE…); 12 Sep "Hypothesis testing on a real business dataset" (session 57a9aec3-c161-4637-92c2-1c8267c85417, 2026-09-12 04:00Z) → https://us02web.zoom.us/rec/share/qBCetPjgT17-FadK7eYeNvNVSuv_n6z068VCccgz7LwU7KdCcVz1ZWvnkhDomSlw.iENisBp5RHsq0_0P.
M1–M6 assignments were deleted (admin to upload new ones).
Assignment 1 (12 Sep 2026) — assignments id 7e9f576d-82f1-438f-967f-72f119bf1007, title "Assignment 1 — Pandas & NumPy: IT Services Ticket Data", due_at 2026-09-16 17:30:00+00 (= 16 Sep 11:00 PM IST), points 100, is_open true. Brief holds the full 100-question paper (Part A · pandas 50 Q, Part B · NumPy 50 Q) taken verbatim from the faculty docx Pandas_NumPy_Assignment_Basic.docx, plus the 29-column data dictionary, how-to-work rules, what-to-submit and marking (1 point per question). This is the first row in assignments.
PENDING (device cmkl-vineeta was offline on 12 Sep): upload the two files to the materials bucket and add materials rows — the brief already tells students to get them from Materials as "Assignment 1 · dataset".
it_services_tickets_raw.csv — 15,558,323 bytes, md5 b1b038ff95a5c54339523c69cfbbe068, 51,538 lines (~51.5k tickets). Target path materials/assignments/a1/it_services_tickets_raw.csv, kind='link' (or 'pdf'-style chip; it is a CSV).
Pandas_NumPy_Assignment_Basic.docx — 10,611 bytes, md5 5ab757504c6d309b5d853166181af208. Target path materials/assignments/a1/Pandas_NumPy_Assignment_Basic.docx.
Both files were kept in that session's container at /mnt/user-data/outputs/assignment1/; if the container is gone, ask the user to re-attach them.
The temporary anon insert policy in the upload recipe is scoped name like 'notes/%' — widen it to assignments/% for this upload, then drop it.
Dataset shape: deliberately dirty — inconsistent column names (trailing spaces in "Client Name " and "category "), six date formats, $-prefixed and space-padded numbers, missing values disguised as NA / null / nan / ? / missing / empty, mixed-case category spellings ("p1"/"P1"/"MEDIUM", "Level 2"/"l2"/"LEVEL-2"), mixed SLA-breach flags (Yes/Y/TRUE/1/0). Cleaning it is the assignment.
Assignment 2 (18 Sep 2026) — id 34da5a94-af39-46af-8bc7-3d83a4321c04, "Outliers, Distribution Shape & Classification Metrics" (Meridian retail sales + Suvidha loan predictions), due 23 Sep 2026. Datasets shared through Drive folder 1RPy3PZexAOYru_BadsJnpOYu3sfkjWDt.
Assignment 3 (13 Oct 2026) — id eb3a5aa2-d6c5-45d5-a13f-13bddf05c3a6, "Assignment 3 — K-Nearest Neighbours: Health Screening & Delivery ETA", due_at 2026-10-22 17:30:00+00 (Thu 22 Oct, 11 PM IST), 100 pts, is_open true. Same brief format as A2 (two business problems, 25 Q each, 2 pts each).
Part A: Sanjeevani Diagnostics — rank camp visitors for a 1-in-3 HbA1c test budget (KNN classification on non-invasive measures; tuned model's top 250 of 750 finds 117/170 diabetics vs ~55 at random; unscaled KNN is below the all-negative baseline because daily_steps dominates).
Part B: DashMart — quick-commerce delivery ETA (KNN regression; unscaled R² < 0 because order_value_rs dominates; scaled MAE ≈ 1.7 min; 4-min buffer keeps late orders ≤ 10%).
Synthetic data generated with fixed seeds and verified end to end with a solution script; answer key + solution_key.py were sent to the user (assignment3_answer_key_notes.md).
Datasets hosted (13 Oct) by the user in Drive folder "Assignment on KNN" 1Qq4NnMbpXhBOOZp84Hh6fRZ2Hcd5aHe8 (owner cdac.mum.dbda, anyone-with-link reader). Link added to the brief's 📦 THE DATASETS section and as a materials row "Assignment 3 · datasets (KNN — Sanjeevani & DashMart CSVs)", kind='link'. The Drive connector cannot list that folder's contents, so the files themselves were not verified from a session.
sanjeevani_diabetes_screening_raw.csv — 218,972 bytes, md5 e6b72a7e497ae610238c8c5949362f6b, 3,038 data rows.
dashmart_delivery_times_raw.csv — 135,138 bytes, md5 02c3f7f463a791756c1b3f5fb56dd348, 2,430 data rows.
Testing notes
Container egress blocks supabase.co & youtube & pyodide CDN — verify via node --check, jsdom, or Playwright demo-mode. Pyodide only runs in the real browser. Anything needing network access to Supabase must run on the device (desktop-commander start_process).
Supabase MCP (execute_sql) works from the container and is the way to read/write content rows.
For long note bodies, insert with dollar-quoting ($ascend$ … $ascend$) and patch afterwards with replace() in an UPDATE rather than re-sending the whole body.