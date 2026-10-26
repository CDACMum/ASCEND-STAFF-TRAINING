-- ASCEND 2026 · replace seed content with the real Applied AI/ML Engineering course
do $$
declare cid uuid;
begin
  delete from public.quiz_questions where quiz_id in (select id from public.quizzes);
  delete from public.quizzes;
  delete from public.assignments;
  delete from public.materials;
  delete from public.notes;
  delete from public.sessions;
  delete from public.courses;

  insert into public.courses (title, summary, syllabus, instructor, accent, sort_order, is_published)
  values (
    'Applied AI/ML Engineering',
    'C-DAC Mumbai Course 1 — a 16-week blended bridge & upskilling programme covering the complete ML lifecycle: Python & statistics foundations, classical algorithms, evaluation & explainability, feature engineering, production pipelines/MLOps, mini-projects and a validated industry capstone.',
    E'240 Hours · 8 Modules · 8 Credits · 16 Weeks\nBlended delivery: Weekday evenings 5:00–7:00 PM (Online) + Saturday 9:30 AM–1:30 PM (Classroom)\n\nOrientation Block (before Week 1) — environment setup, Git, first notebook, diagnostic.\n\nM1 · Statistics & Probability (Weeks 1–2) — descriptive stats, distributions, hypothesis testing (t-test, chi-square, ANOVA), Bayes, CLT, information theory, linear regression & regularisation.\nM2 · Python for ML (Weeks 3–4) — data types, OOP, NumPy, Pandas, Matplotlib/Seaborn, file I/O, SQLAlchemy, project structure.\nM3 · Classical ML Algorithms (Weeks 5–6) — regression, trees, Random Forest, XGBoost/LightGBM, SVM, k-NN, clustering (k-Means, DBSCAN), PCA/t-SNE/UMAP.\nM4 · Evaluation & Explainability (Weeks 7–8) — metrics, ROC/PR, cross-validation, A/B testing, SHAP, LIME, fairness (Fairlearn). Mid-Term Test.\nM5 · Feature Engineering (Weeks 9–10) — missingness, encoding, scaling, transforms, feature creation & selection, sklearn Pipelines.\nM6 · ML Pipelines & MLOps (Weeks 11–12) — MLflow, DVC, FastAPI, Docker, Evidently drift monitoring.\nM7 · Mini Projects (Weeks 13–14) — Credit Risk, Customer Churn, Attrition; panel presentation.\nM8 · Capstone (Weeks 15–16) — full end-to-end project, report, viva & certificate.\n\nSelf-learning labs run on scheduled weekdays (self-paced, ~2 hrs). Sundays are weekly-off; festival holidays are excluded from the live schedule.',
    'C-DAC Faculty', 'navy', 1, true
  ) returning id into cid;

  insert into public.sessions (course_id, title, description, scheduled_at, duration_mins, platform, sort_order)
  select cid, t.title, t.descr, t.at::timestamptz, t.dur, t.plat, t.ord
  from (values
    ('Descriptive statistics — mean, median, SD, skewness, kurtosis','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-01 17:00:00+05:30',120,'Zoom (Online)',1),
    ('Probability distributions — Normal, Binomial, Poisson, Bernoulli','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-02 17:00:00+05:30',120,'Zoom (Online)',2),
    ('Hypothesis testing — t-test, p-values and effect sizes','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-03 17:00:00+05:30',120,'Zoom (Online)',3),
    ('Descriptive statistics & distribution fitting in SciPy','Module M1 · Saturday classroom (9:30 AM–1:30 PM)','2026-09-05 09:30:00+05:30',240,'Classroom · C-DAC',4),
    ('Chi-square and ANOVA with business interpretation','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-07 17:00:00+05:30',120,'Zoom (Online)',5),
    ('Correlation, covariance and multicollinearity (Pearson, Spearman, VIF)','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-09 17:00:00+05:30',120,'Zoom (Online)',6),
    ('Bayes'' theorem — prior, likelihood, posterior with worked examples','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-10 17:00:00+05:30',120,'Zoom (Online)',7),
    ('Hypothesis testing on a real business dataset','Module M1 · Saturday classroom (9:30 AM–1:30 PM)','2026-09-12 09:30:00+05:30',240,'Classroom · C-DAC',8),
    ('Central Limit Theorem and implications for sampling / validation','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-15 17:00:00+05:30',120,'Zoom (Online)',9),
    ('Information theory — entropy, KL divergence, mutual information','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-16 17:00:00+05:30',120,'Zoom (Online)',10),
    ('Descriptive statistics recap & problem solving','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-17 17:00:00+05:30',120,'Zoom (Online)',11),
    ('NumPy vectorisation and array workouts','Module M2 · Saturday classroom (9:30 AM–1:30 PM)','2026-09-19 09:30:00+05:30',240,'Classroom · C-DAC',12),
    ('Probability distributions — applied practice','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-21 17:00:00+05:30',120,'Zoom (Online)',13),
    ('Hypothesis testing — applied practice','Module M1 · Weekday online session (5:00–7:00 PM)','2026-09-23 17:00:00+05:30',120,'Zoom (Online)',14),
    ('Python data types, control flow, functions, OOP for ML','Module M2 · Weekday online session (5:00–7:00 PM)','2026-09-24 17:00:00+05:30',120,'Zoom (Online)',15),
    ('Pandas wrangling, groupby and merges','Module M2 · Saturday classroom (9:30 AM–1:30 PM)','2026-09-26 09:30:00+05:30',240,'Classroom · C-DAC',16),
    ('NumPy — arrays, broadcasting, vectorised operations','Module M2 · Weekday online session (5:00–7:00 PM)','2026-09-28 17:00:00+05:30',120,'Zoom (Online)',17),
    ('NumPy — linear algebra basics for ML','Module M2 · Weekday online session (5:00–7:00 PM)','2026-09-29 17:00:00+05:30',120,'Zoom (Online)',18),
    ('Pandas — DataFrames, merging, reshaping, groupby','Module M2 · Weekday online session (5:00–7:00 PM)','2026-09-30 17:00:00+05:30',120,'Zoom (Online)',19),
    ('Pandas — time-series operations','Module M2 · Weekday online session (5:00–7:00 PM)','2026-10-02 17:00:00+05:30',120,'Zoom (Online)',20),
    ('EDA notebook with 10+ annotated observations','Module M2 · Saturday classroom (9:30 AM–1:30 PM)','2026-10-03 09:30:00+05:30',240,'Classroom · C-DAC',21),
    ('Matplotlib and Seaborn — charts, subplots, publication-ready figures','Module M2 · Weekday online session (5:00–7:00 PM)','2026-10-05 17:00:00+05:30',120,'Zoom (Online)',22),
    ('File I/O — CSV, JSON, Parquet; SQL via SQLAlchemy','Module M2 · Weekday online session (5:00–7:00 PM)','2026-10-07 17:00:00+05:30',120,'Zoom (Online)',23),
    ('Virtual environments, Jupyter best practices, ML project structure','Module M2 · Weekday online session (5:00–7:00 PM)','2026-10-08 17:00:00+05:30',120,'Zoom (Online)',24),
    ('Regression models with regularisation','Module M3 · Saturday classroom (9:30 AM–1:30 PM)','2026-10-10 09:30:00+05:30',240,'Classroom · C-DAC',25),
    ('Python OOP & data structures for ML — practice','Module M2 · Weekday online session (5:00–7:00 PM)','2026-10-12 17:00:00+05:30',120,'Zoom (Online)',26),
    ('ML paradigms — Supervised vs Unsupervised vs Reinforcement','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-14 17:00:00+05:30',120,'Zoom (Online)',27),
    ('Linear & Logistic Regression with regularisation (Ridge, Lasso, Elastic Net)','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-15 17:00:00+05:30',120,'Zoom (Online)',28),
    ('Random Forest, XGBoost and hyperparameter tuning','Module M3 · Saturday classroom (9:30 AM–1:30 PM)','2026-10-17 09:30:00+05:30',240,'Classroom · C-DAC',29),
    ('Decision Trees and Random Forests','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-19 17:00:00+05:30',120,'Zoom (Online)',30),
    ('XGBoost and LightGBM — boosting mechanics','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-21 17:00:00+05:30',120,'Zoom (Online)',31),
    ('Hyperparameter tuning — grid search and cross-validation','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-22 17:00:00+05:30',120,'Zoom (Online)',32),
    ('Customer segmentation with clustering','Module M3 · Saturday classroom (9:30 AM–1:30 PM)','2026-10-24 09:30:00+05:30',240,'Classroom · C-DAC',33),
    ('SVM, Naive Bayes, k-Nearest Neighbours','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-26 17:00:00+05:30',120,'Zoom (Online)',34),
    ('Clustering — k-Means, DBSCAN, Hierarchical; elbow & silhouette','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-28 17:00:00+05:30',120,'Zoom (Online)',35),
    ('Dimensionality reduction (PCA, t-SNE, UMAP) and anomaly detection','Module M3 · Weekday online session (5:00–7:00 PM)','2026-10-29 17:00:00+05:30',120,'Zoom (Online)',36),
    ('Metric computation and threshold optimisation','Module M4 · Saturday classroom (9:30 AM–1:30 PM)','2026-10-31 09:30:00+05:30',240,'Classroom · C-DAC',37),
    ('ML algorithms — consolidation & practice','Module M3 · Weekday online session (5:00–7:00 PM)','2026-11-02 17:00:00+05:30',120,'Zoom (Online)',38),
    ('Classification metrics — precision, recall, F1, AUC-ROC, PR curve','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-04 17:00:00+05:30',120,'Zoom (Online)',39),
    ('Cost-optimal threshold selection; A/B test simulation with significance','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-05 17:00:00+05:30',120,'Zoom (Online)',40),
    ('Regression metrics — MAE, RMSE, MAPE, R² with business meaning','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-10 17:00:00+05:30',120,'Zoom (Online)',41),
    ('Cross-validation strategies — k-fold, stratified, time-series split','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-11 17:00:00+05:30',120,'Zoom (Online)',42),
    ('A/B testing — sample size, MDE, statistical significance','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-12 17:00:00+05:30',120,'Zoom (Online)',43),
    ('SHAP explainability dashboard for a credit-risk model','Module M4 · Saturday classroom (9:30 AM–1:30 PM)','2026-11-14 09:30:00+05:30',240,'Classroom · C-DAC',44),
    ('Champion-challenger, shadow testing and canary deployment','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-16 17:00:00+05:30',120,'Zoom (Online)',45),
    ('SHAP — global feature importance and per-prediction explanations','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-18 17:00:00+05:30',120,'Zoom (Online)',46),
    ('LIME, permutation importance, PDP; fairness metrics and Fairlearn','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-19 17:00:00+05:30',120,'Zoom (Online)',47),
    ('Mid-Term Test (written, 2 hrs) — covers Modules M1 to M4','Module MT · Saturday classroom (9:30 AM–1:30 PM)','2026-11-21 09:30:00+05:30',240,'Classroom · C-DAC',48),
    ('Evaluation & explainability — consolidation','Module M4 · Weekday online session (5:00–7:00 PM)','2026-11-23 17:00:00+05:30',120,'Zoom (Online)',49),
    ('Missing-value strategies — MCAR, MAR, MNAR; KNN & MICE imputation','Module M5 · Weekday online session (5:00–7:00 PM)','2026-11-25 17:00:00+05:30',120,'Zoom (Online)',50),
    ('Encoding — label, ordinal, one-hot, target (leakage-safe), frequency','Module M5 · Weekday online session (5:00–7:00 PM)','2026-11-26 17:00:00+05:30',120,'Zoom (Online)',51),
    ('Imputation and encoding workshop','Module M5 · Saturday classroom (9:30 AM–1:30 PM)','2026-11-28 09:30:00+05:30',240,'Classroom · C-DAC',52),
    ('Scaling — StandardScaler, RobustScaler, MinMaxScaler','Module M5 · Weekday online session (5:00–7:00 PM)','2026-11-30 17:00:00+05:30',120,'Zoom (Online)',53),
    ('Transformations — Box-Cox and Yeo-Johnson','Module M5 · Weekday online session (5:00–7:00 PM)','2026-12-01 17:00:00+05:30',120,'Zoom (Online)',54),
    ('Outlier detection and treatment — IQR fences, z-score, Winsorisation','Module M5 · Weekday online session (5:00–7:00 PM)','2026-12-02 17:00:00+05:30',120,'Zoom (Online)',55),
    ('Feature creation — polynomial, interaction, date-time decomposition','Module M5 · Weekday online session (5:00–7:00 PM)','2026-12-03 17:00:00+05:30',120,'Zoom (Online)',56),
    ('Scaling, transforms and outlier treatment','Module M5 · Saturday classroom (9:30 AM–1:30 PM)','2026-12-05 09:30:00+05:30',240,'Classroom · C-DAC',57),
    ('Text features — TF-IDF and Word2Vec embeddings','Module M5 · Weekday online session (5:00–7:00 PM)','2026-12-07 17:00:00+05:30',120,'Zoom (Online)',58),
    ('Feature selection — filter methods, RFE, Lasso, XGBoost importance','Module M5 · Weekday online session (5:00–7:00 PM)','2026-12-09 17:00:00+05:30',120,'Zoom (Online)',59),
    ('ML pipeline architecture — data → features → model → serving','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-10 17:00:00+05:30',120,'Zoom (Online)',60),
    ('Feature creation and selection experiments','Module M5 · Saturday classroom (9:30 AM–1:30 PM)','2026-12-12 09:30:00+05:30',240,'Classroom · C-DAC',61),
    ('MLflow — experiment tracking, parameter logging, model registry','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-14 17:00:00+05:30',120,'Zoom (Online)',62),
    ('DVC — data versioning and reproducible pipeline stages','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-16 17:00:00+05:30',120,'Zoom (Online)',63),
    ('FastAPI — REST endpoint design with input validation','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-17 17:00:00+05:30',120,'Zoom (Online)',64),
    ('MLflow experiment tracking and model registry','Module M6 · Saturday classroom (9:30 AM–1:30 PM)','2026-12-19 09:30:00+05:30',240,'Classroom · C-DAC',65),
    ('Docker — Dockerfile, images, containers, docker-compose','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-21 17:00:00+05:30',120,'Zoom (Online)',66),
    ('Evidently AI — data drift and concept drift monitoring','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-23 17:00:00+05:30',120,'Zoom (Online)',67),
    ('ML pipeline architecture — deployment patterns (contd.)','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-24 17:00:00+05:30',120,'Zoom (Online)',68),
    ('DVC data and pipeline versioning','Module M6 · Saturday classroom (9:30 AM–1:30 PM)','2026-12-26 09:30:00+05:30',240,'Classroom · C-DAC',69),
    ('MLflow & experiment tracking — consolidation','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-28 17:00:00+05:30',120,'Zoom (Online)',70),
    ('DVC & reproducible pipelines — consolidation','Module M6 · Weekday online session (5:00–7:00 PM)','2026-12-30 17:00:00+05:30',120,'Zoom (Online)',71),
    ('Course review, doubt clearing & readiness check for Mini Projects (M7)','Module RV · Weekday online session (5:00–7:00 PM)','2026-12-31 17:00:00+05:30',120,'Zoom (Online)',72),
    ('FastAPI model serving endpoint','Module M6 · Saturday classroom (9:30 AM–1:30 PM)','2027-01-02 09:30:00+05:30',240,'Classroom · C-DAC',73)
  ) as t(title, descr, at, dur, plat, ord);

  insert into public.assignments (course_id, title, brief, due_at, points) values
    (cid,'M1 — Statistics & Probability Assignment','SciPy-based hypothesis testing on a business dataset: two-sample t-test, chi-square independence and one-way ANOVA. Run a CLT simulation and write a structured statistical report. Submit your repo / notebook link.','2026-09-11 23:59:00+05:30',100),
    (cid,'M2 — Python for ML Assignment','EDA notebook with 10+ annotated observations on a real e-commerce/HR dataset (10K+ rows). Each observation carries a one-sentence business narrative. Submit the annotated .ipynb link.','2026-09-25 23:59:00+05:30',100),
    (cid,'M3 — Classical ML Assignment','Train 5 algorithms (LR, RF, XGBoost, SVM, k-NN) on one dataset; build a comparison table (accuracy, F1, AUC). Mini-project: k-Means customer segmentation with elbow + silhouette. Submit the repo link.','2026-10-23 23:59:00+05:30',100),
    (cid,'M4 — Evaluation & Explainability Assignment','Full evaluation report for a binary classifier (ROC/PR, F1-optimal & cost-optimal thresholds, 5-fold CV) plus a SHAP dashboard and fairness audit. Submit repo + a 1-page explainability summary.','2026-11-20 23:59:00+05:30',100),
    (cid,'M5 — Feature Engineering Assignment','Improve baseline XGBoost F1 by >=5% through feature engineering only (10+ engineered features, RFECV, full sklearn Pipeline + ColumnTransformer). Submit the repo link.','2026-12-04 23:59:00+05:30',100),
    (cid,'M6 — ML Pipelines & MLOps Assignment','Instrument your best model with MLflow, build a 3-stage DVC pipeline, and ship a FastAPI + Docker service with Evidently drift monitoring. Submit repo + a short demo recording link.','2026-12-18 23:59:00+05:30',100);

  update public.capstones set
    title = 'Applied AI/ML Engineering — Capstone Project',
    brief = 'Weeks 15–16. Take one problem end-to-end: problem statement (mentor sign-off), EDA (15+ observations), model comparison (>=3 algorithms) with 5-fold CV and GridSearch/Optuna, SHAP + PDP, fairness audit, full sklearn Pipeline, FastAPI + Docker deployment (tested live), Evidently drift monitoring and a model card.',
    guidelines = E'Deliverables:\n1. Public Git repository — clean, documented code + README.\n2. Google Drive write-up / slide deck (10–12 slides) + IEEE-style 8–10 page technical report.\n3. A recording (live demo rehearsal / walkthrough).\n\nExample tracks: Credit Risk Scoring (Finance), Customer Churn + RFM (Retail), Attrition/Readmission (HR/Healthcare).\nAssessment: 30-minute panel viva — 10 min live demo + 20 min Q&A with internal faculty + external assessor. Certificate on completion.',
    due_at = '2027-01-31 23:59:00+05:30',
    points = 300
  where true;

  raise notice 'reseeded: 1 course, % sessions', (select count(*) from public.sessions);
end $$;

select (select count(*) from public.courses) as courses,
       (select count(*) from public.sessions) as sessions,
       (select count(*) from public.assignments) as assignments,
       (select count(*) from public.capstones) as capstones;
