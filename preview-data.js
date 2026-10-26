const fs=require("fs");
const f="E:/Ascend-2026/Claude outputs/preview/assets/app.js";
let s=fs.readFileSync(f,"utf8");
const D="────────────────────────────────", E="════════════════════════════════";
const qs=(n,txt)=>Array.from({length:n},(_,i)=>`${i+1}. ${txt[i%txt.length]}`).join("\n");
const brief=[
"Two business problems, two messy datasets, one paper. Part A works a retail sales log for descriptive statistics, quartiles/IQR outlier detection, and skewness. Part B works a loan-default prediction log for the confusion matrix, precision/recall/F1, and one basic hypothesis test. Cleaning each dataset is part of the exercise, not a preliminary step to skip.",
"","DUE: Wednesday 23 September 2026, 11:00 PM IST. Submit through the Submit panel on this page.","",
D,"🎯 WHAT YOU SHOULD BE ABLE TO DO",D,
"• Compute Q1/Q2/Q3, IQR, and the 1.5×IQR fences by hand and in code, and decide what an outlier means for the business, not just the formula",
"• Build a confusion matrix from raw prediction logs and compute accuracy, precision, recall, specificity, and F1","",
D,"📦 THE DATASETS",D,
"Both raw CSVs are in Materials (Assignment 2 · datasets) and also in this shared Google Drive folder: https://drive.google.com/drive/folders/1RPy3PZexAOYru_BadsJnpOYu3sfkjWDt?usp=sharing","",
"• meridian_daily_sales_raw.csv — 1,627 rows, Business Problem 1 (below)","• suvidha_loan_predictions_raw.csv — 2,400 rows, Business Problem 2 (below)","",
"Do not hand-edit either file. If you break one, re-download it.","",
E,"🏬 BUSINESS PROBLEM 1 — Meridian Retail: Daily Store Sales",E,
"Meridian Retail runs 18 stores across three regions. Finance wants to know whether a handful of stores are quietly inflating the \"average daily basket value\".","",
"File: meridian_daily_sales_raw.csv — one row per store per day (~1,620 rows). Columns:",
"• store_id — e.g. ST-04; a few rows have stray whitespace","• Client Name  — client display name","• revenue — $-prefixed, comma-thousands, some in \"INR 45,200\" text, ~3% blank","",
"── Part A — Cleaning, Quartiles, Outliers & Skewness (25 questions, 2 pts each = 50) ──","",
"Cleaning (Q1–8)",qs(8,["Load the file into df. Print shape and dtypes.","Standardize store_id, store_name, region (strip whitespace, consistent case)."]),"",
"Quartiles & IQR outliers (Q9–16)",qs(8,["Compute Q1, Q2 (median), Q3, and IQR for revenue.","Compute the 1.5×IQR lower and upper fences for revenue."]).replace(/^(\d+)/gm,(m)=>String(+m+8)),"",
D,"📝 HOW TO WORK",D,
"1. Two notebooks: assignment2_partA_meridian.ipynb and assignment2_partB_suvidha.ipynb.","2. Show code and output for every question.","",
D,"📤 WHAT TO SUBMIT",D,"• Both notebooks with outputs saved (not cleared).","","MARKING (100 points)","• Part A — Cleaning (Q1–8): 16","• Part A — Quartiles & IQR outliers (Q9–16): 16","",
"Late submissions are marked but capped."
].join("\n");
const old='brief:"Create a public repo named ascend-<your-name>, add a README describing yourself, and submit the repository link."';
if(!s.includes(old)) throw new Error("demo brief not found");
s=s.replace(old,"brief:"+JSON.stringify(brief)).replace('title:"Set up your Git repository"','title:"Assignment 2 — Outliers, Distribution Shape & Classification Metrics"');
s=s.replace('feedback:"Great README.",','feedback:"Strong cleaning section — the duplicate ST-11 week was handled well.\\nQ14: the store is correctly not an outlier; explain why in one more line.\\nSee https://example.com/rubric for the marking notes.",reviewed_at:"2026-09-26T15:20:00+05:30",');
fs.writeFileSync(f,s); console.log("preview data patched");
