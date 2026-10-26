-- =====================================================================
--  ASCEND 2026  ·  C-DAC Mumbai  ·  USER SEEDING
--  Creates login accounts for every staff member on the AIML training list,
--  plus an admin, a trainer, and one dummy executive.
--
--  DEFAULT PASSWORD for everyone:  ascend123
--  LOGIN IDENTIFIER: the employee number (e.g. 344809). The app maps it to an
--  internal email  <empno>@ascend.cdac.in  — no real email is ever sent.
--  On first sign-in each person is forced to set their own password.
--
--  RUN THIS *AFTER* schema.sql, in:  Supabase Dashboard → SQL Editor → New query
--  Safe to re-run: existing accounts are skipped.
-- =====================================================================
create extension if not exists "pgcrypto";

-- staging table of people to create
drop table if exists _ascend_seed;
create temp table _ascend_seed(emp text, name text, designation text, location text, role text);
insert into _ascend_seed (emp,name,designation,location,role) values
  ('344809','Ms Arati Krunal Kamdi','Project Engineer','Kharghar','staff'),
  ('346982','Mr Abhijeet Bapurao Wagh','Senior Project Engineer','Kharghar','staff'),
  ('348265','Mr Abhishek Fulchand Gade','Project Engineer','Kharghar','staff'),
  ('346280','Mr Aditya Kansana','Project Associate','Kharghar','staff'),
  ('347699','Mr Ajinkya Maruti Dhumal','Project Engineer','Kharghar','staff'),
  ('345543','Mr Akshay Yogiraj Kirange','Project Engineer','Juhu','staff'),
  ('345546','Mr Aman Giri','Project Engineer','Juhu','staff'),
  ('349176','Mr Aniket Tanaji Jadhav','Module Leader','Kharghar','staff'),
  ('345619','Mr Aniket Yadunath Takmare','Project Engineer','Kharghar','staff'),
  ('344190','Mr Anil Kumar Chaurasiya','Project Engineer','Juhu','staff'),
  ('350303','Mr Ayush Saxena','Project Engineer','Juhu','staff'),
  ('346768','Mr Basant Chaudashi','Project Engineer','Juhu','staff'),
  ('346214','Ms Bhagyashree Anil Pawar','Project Engineer','Juhu','staff'),
  ('346981','Mr Debmalya Paul','Senior Project Engineer','Kharghar','staff'),
  ('345475','Mr Dhiraj Pralhad Ingale','Project Engineer','Juhu','staff'),
  ('346772','Mr Himanshu Nigam','Project Engineer','Juhu','staff'),
  ('348418','Mr Himanshu Popat Katkar','Senior Project Engineer','Kharghar','staff'),
  ('347519','Ms Janhavi Kunwar','Project Engineer','Juhu','staff'),
  ('347833','Ms Jidnyasa Sunil Bhoir','Project Engineer','Kharghar','staff'),
  ('344538','Mr Kamal Kant','Project Engineer','Juhu','staff'),
  ('345513','Mr Kamran Salim Shaikh','Project Engineer','Kharghar','staff'),
  ('348858','Mr Khushal Pareta','Project Engineer','Juhu','staff'),
  ('344545','Ms Neha Saini','Project Engineer','Kharghar','staff'),
  ('346766','Mr Nihal Chhetri','Project Engineer','Juhu','staff'),
  ('348081','Mr Nirmal Dilip Jain','Senior Project Engineer','Kharghar','staff'),
  ('348867','Mr Onkar Ajit Pawar','Project Engineer','Juhu','staff'),
  ('347654','Mr Pranay Jagdish Patil','Project Engineer','Kharghar','staff'),
  ('347505','Mr Prasad Rajkumar Kunte','Project Engineer','Juhu','staff'),
  ('344055','Dr Pravin Bhaskar Ramteke','Knowledge Associate','Kharghar','staff'),
  ('348374','Mr Rahul Batham','Project Engineer','Juhu','staff'),
  ('344993','Mr Rahul Bhaskar Chaudhari','Project Engineer','Kharghar','staff'),
  ('348417','Mr Rahul Gopal Patil','Senior Project Engineer','Kharghar','staff'),
  ('347177','Mr Rakesh Prabhakar Bhol','Project Engineer','Kharghar','staff'),
  ('348222','Mr Rohan Rajendra Kalaskar','Project Engineer','Kharghar','staff'),
  ('347175','Mr Roshan Bhopal Sharma','Project Engineer','Kharghar','staff'),
  ('348658','Mr Rushikesh Chhoturam Ghuge','Project Engineer','Juhu','staff'),
  ('348866','Mr Rushikesh Kalyan Doud','Project Engineer','Juhu','staff'),
  ('345583','Mr Sagar Chandrakant Jadhav','Module Leader','Kharghar','staff'),
  ('349696','Mr Sahil Santosh Karande','Project Engineer','Kharghar','staff'),
  ('347701','Ms Sakshi Kishor Gaddamwar','Project Engineer','Kharghar','staff'),
  ('349884','Mr Samarth Gyanprakash Pandey','Project Engineer','Juhu','staff'),
  ('348441','Mr Sandesh Subhash Jadhav','Senior Project Engineer','Kharghar','staff'),
  ('348448','Ms Sanjyot Shrinivas Sawant','Senior Project Engineer','Kharghar','staff'),
  ('344684','Ms Shalaka Parab','Project Engineer','Juhu','staff'),
  ('346285','Mr Shilbhushan Siddhartha Khanderao','Project Associate','Kharghar','staff'),
  ('345540','Mr Shivhar Ramkisan Admane','Project Engineer','Kharghar','staff'),
  ('349903','Mr Shivraj Singh','Project Engineer','Kharghar','staff'),
  ('345257','Ms Shrishti Singh','Project Engineer','Juhu','staff'),
  ('346215','Mr Shubham Sidharth Wadhave','Project Engineer','Juhu','staff'),
  ('347589','Mr Sneh Vilas Parab','Project Engineer','Juhu','staff'),
  ('348371','Mr Sudarshan Anil Sangale','Project Engineer','Juhu','staff'),
  ('345520','Mr Suraj Kumar Shankhwar','Project Engineer','Kharghar','staff'),
  ('350304','Mr Sushant Ravindra Borkar','Project Engineer','Juhu','staff'),
  ('347146','Mr Suyash Santosh Suvare','Project Engineer','Kharghar','staff'),
  ('349778','Mr Tanmay Mahendra Elinje','Project Engineer','Kharghar','staff'),
  ('345326','Mr Tejendra Vishwas Deshpande','Project Engineer','Juhu','staff'),
  ('344108','Ms Trupti Keshav Badhekar','Project Engineer','Kharghar','staff'),
  ('345321','Mr Vadnere Gurunath Vilas','Project Engineer','Kharghar','staff'),
  ('346905','Mr Vaibhav Sunil Shinde','Project Engineer','Juhu','staff'),
  ('345598','Mr Vinay Vijay Jadhav','Module Leader','Kharghar','staff'),
  ('346233','Mr Yogesh Suryakant Amle','Senior Project Engineer','Kharghar','staff'),
  ('admin','Programme Admin','Programme Office','Kharghar','admin'),
  ('trainer','ASCEND Trainer','Faculty','Kharghar','trainer'),
  ('100000','Demo Executive','Project Engineer','Kharghar','staff');

do $$
declare
  u   record;
  uid uuid;
  em  text;
  created int := 0;
  skipped int := 0;
begin
  for u in select * from _ascend_seed loop
    em := lower(u.emp) || '@ascend.cdac.in';

    -- already there? skip.
    if exists (select 1 from auth.users where email = em) then
      skipped := skipped + 1;
      continue;
    end if;

    uid := gen_random_uuid();

    -- 1) the auth user (email pre-confirmed, password = ascend123)
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
      crypt('ascend123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', u.name),
      '', '', '', ''
    );

    -- 2) the matching identity (required for email/password login)
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid, em,
      jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true),
      'email', now(), now(), now()
    );

    -- 3) the profile (handle_new_user may have created a bare one — fill it in)
    insert into public.profiles (id, full_name, email, role, team, designation, emp_no, must_change_password)
    values (uid, u.name, em, u.role, u.location, u.designation, u.emp, true)
    on conflict (id) do update set
      full_name = excluded.full_name,
      role      = excluded.role,
      team      = excluded.team,
      designation = excluded.designation,
      emp_no    = excluded.emp_no,
      must_change_password = true;

    created := created + 1;
  end loop;

  raise notice 'ASCEND seeding done — created % account(s), skipped % existing.', created, skipped;
end $$;

-- =====================================================================
--  Quick check — see everyone that now exists:
--    select emp_no, full_name, role, team, designation from public.profiles order by role, full_name;
--
--  Login examples (password ascend123, they set their own on first sign-in):
--    Staff : employee number, e.g.  344809
--    Admin : admin
--    Trainer: trainer
--    Dummy : 100000
-- =====================================================================
