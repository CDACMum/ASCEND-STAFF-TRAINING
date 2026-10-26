# ASCEND 2026 — C-DAC Mumbai · Executive Training LMS

A production learning platform for staff upskilling. Static front-end (deploys free on
**GitHub Pages** / any static host), all data + auth on **Supabase**.

**Status: LIVE.** The database is already provisioned on your Supabase project
(`axxwwjcjamccovsqojox`) — schema, security, starter content and **all 61 staff
accounts** are created. `assets/config.js` already points at it. Just host the
folder and share the link.

```
Ascend-2026/
├─ index.html              # app shell
├─ assets/
│  ├─ config.js            # already wired to your Supabase project (URL + publishable key)
│  ├─ styles.css           # design system
│  └─ app.js               # the whole app (auth, 3 dashboards, all modules)
└─ supabase/
   ├─ schema.sql           # the full schema that was applied (for reference / re-use)
   └─ seed_users.sql       # the staff-account seeding that was applied
```

---

## Who logs in, and how

| Role | Login | Password |
|------|-------|----------|
| **Executive** (staff, upskilling) | their **employee number**, e.g. `344809` | `ascend123` |
| **Trainer** (faculty) | `trainer` | `ascend123` |
| **Administrator** (programme office) | `admin` | `ascend123` |
| Dummy executive (for testing) | `100000` | `ascend123` |

Everyone is **forced to set their own password** the first time they sign in. The
employee number maps internally to `<empno>@ascend.cdac.in` — **no real email is ever
sent**; it's just the account identifier.

## What each role can do

- **Executive:** personal dashboard, course catalogue with **syllabus**, **schedule**
  of all sessions, **daily recordings** feed, **faculty notes**, downloadable materials,
  submit **assignments** (GitHub + Google Drive + recording links), auto-graded
  **practice quizzes (MCQ)**, the **capstone project** submission, and the **discussion
  forum** to ask doubts. Change password any time in Profile.
- **Trainer:** all content management — add sessions & recording links, post notes,
  publish assignments & quizzes, set the capstone, **review & grade** every submission,
  and moderate the forum.
- **Administrator:** everything trainers do **plus Manage people** (promote anyone
  between Executive / Trainer / Admin) and programme-wide stats.

## Modules

Courses · Syllabus · **Schedule** · **Daily recordings** · Faculty notes · Materials ·
Assignments (Git/Drive/recording) · **Practice quizzes (MCQ)** · **Capstone project** ·
**Discussion forum** · Reviews & grading · People management · Profiles & passwords.

---

## Host it (make the link shareable)

### Option A — GitHub Pages (free)
```bash
cd Ascend-2026
git init && git add . && git commit -m "ASCEND 2026 LMS"
git branch -M main
git remote add origin https://github.com/<you>/ascend-2026.git
git push -u origin main
```
Then **Settings → Pages → Deploy from branch → `main` / root → Save**.
Site goes live at `https://<you>.github.io/ascend-2026/`.

### Option B — any static host / intranet
Just serve the folder (it's plain static files). For a quick local run:
`python -m http.server 8080` inside the folder, then open `http://localhost:8080`.

### One required Supabase step for the live site
In Supabase → **Authentication → URL Configuration**, add your hosted URL to
**Site URL** and **Redirect URLs**. (Email confirmation is already bypassed for the
seeded accounts, so employee-number sign-in works immediately.)

---

## Admin cheatsheet (SQL editor)

Make someone a trainer / admin (or do it in the app under *Manage people*):
```sql
update public.profiles set role = 'trainer' where emp_no = '345598';
update public.profiles set role = 'admin'   where emp_no = '344809';
```
Reset a person back to the default password (they'll be forced to change it again):
```sql
update auth.users set encrypted_password = crypt('ascend123', gen_salt('bf'))
  where email = '344809@ascend.cdac.in';
update public.profiles set must_change_password = true where emp_no = '344809';
```
Add a new joiner later: re-run `supabase/seed_users.sql` after adding their row
(existing accounts are skipped).

## Security notes

- Only the **project URL + publishable key** are in the app — both are meant to be
  public. Your **database password is not stored anywhere** in this project.
- Access is enforced by **Row Level Security**: members read shared content and the
  staff directory; they read/write only **their own** submissions, quiz attempts and
  forum posts; only **trainers/admins** manage content and grade; only **admins**
  change roles.
