$ErrorActionPreference = 'Stop'
$src = 'E:\Ascend-2026'
$dst = 'E:\Ascend-2026\Claude outputs\preview'
if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
New-Item -ItemType Directory -Path "$dst\assets" | Out-Null
Copy-Item "$src\index.html" $dst
Get-ChildItem "$src\assets" -File | Where-Object { $_.Name -notlike '*backup*' } | Copy-Item -Destination "$dst\assets"
# force the offline demo store in the preview copy only
$cfg = Get-Content "$dst\assets\config.js" -Raw
$cfg = $cfg + "`nwindow.ASCEND_DEMO = true;`n"
Set-Content -Path "$dst\assets\config.js" -Value $cfg -Encoding UTF8
# try to pull the real Assignment 2 brief (public read may be blocked by RLS)
$conf = Get-Content "$src\assets\config.js" -Raw
$key = [regex]::Match($conf, 'SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*:\s*"([^"]+)"').Groups[1].Value
$url = [regex]::Match($conf, 'SUPABASE_URL\s*:\s*"([^"]+)"').Groups[1].Value
try {
  $r = Invoke-RestMethod -Uri "$url/rest/v1/assignments?select=title,brief&order=created_at" -Headers @{ apikey = $key; Authorization = "Bearer $key" }
  "rows: $($r.Count)"
  if ($r.Count -gt 0) { $r | ConvertTo-Json -Depth 3 | Set-Content -Path "$dst\briefs.json" -Encoding UTF8 }
} catch { "fetch failed: $($_.Exception.Message)" }
"keyfound: $([bool]$key)"
