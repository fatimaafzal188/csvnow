
// ── AUTH CHECK ──
async function checkProAccess() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    alert('This is a Pro feature. Please log in or upgrade to Pro.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}


// ── BILLING TOGGLE ──
let isAnnual = false;

function toggleBilling() {
  isAnnual = !isAnnual;

  const track = document.getElementById('billing-toggle');
  const lblMo = document.getElementById('lbl-mo');
  const lblYr = document.getElementById('lbl-yr');
  const proPrice = document.getElementById('pro-price');
  const bizPrice = document.getElementById('biz-price');
  const proNote = document.getElementById('pro-note');
  const bizNote = document.getElementById('biz-note');

  if (isAnnual) {
    track.classList.add('annual');
    lblMo.classList.remove('active');
    lblYr.classList.add('active');
    proPrice.textContent = '$8.40';
    bizPrice.textContent = '$34.30';
    proNote.innerHTML = '<s style="color:#94a3b8">$144/yr</s> &nbsp;$100.80/yr — save $43.20';
    bizNote.innerHTML = '<s style="color:#94a3b8">$588/yr</s> &nbsp;$411.60/yr — save $176.40';
  } else {
    track.classList.remove('annual');
    lblMo.classList.add('active');
    lblYr.classList.remove('active');
    proPrice.textContent = '$12';
    bizPrice.textContent = '$49';
    proNote.textContent = 'Billed monthly';
    bizNote.textContent = 'Billed monthly';
  }
}

// ── SMOOTH NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 80) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? '#0D9488' : '';
  });
});

// ── FADE IN ON SCROLL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.tool-card, .feature-card, .plan-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
// ── CSV UPLOAD & PREVIEW ──
const BACKEND_URL = "https://fatimafzal188-csvnow-backend.hf.space";
let parsedData = null;

const uploadBox = document.getElementById('upload-box');
const csvInput = document.getElementById('csv-input');

// Click to upload
csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Drag and drop
uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    handleFile(file);
  } else {
    alert('Please drop a .csv file only.');
  }
});

// Click anywhere on box to upload
uploadBox.addEventListener('click', (e) => {
  if (e.target !== document.querySelector('.upload-btn')) {
    csvInput.click();
  }
});

// ── HANDLE FILE ──
function handleFile(file) {
  // Check file size — 5MB limit for free
  if (file.size > 5 * 1024 * 1024) {
    alert('File is over 5MB. Please upgrade to Pro for larger files.');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      parsedData = results;
      showFileInfo(file, results);
      showPreview(results);
    },
    error: function() {
      alert('Could not read this file. Please make sure it is a valid CSV.');
    }
  });
}

// ── SHOW FILE INFO BAR ──
function showFileInfo(file, results) {
  document.getElementById('info-filename').textContent = file.name;
  document.getElementById('info-size').textContent = formatSize(file.size);
  document.getElementById('info-rows').textContent = results.data.length.toLocaleString();
  document.getElementById('info-cols').textContent = results.meta.fields.length;

  document.getElementById('file-info-bar').style.display = 'flex';
  document.getElementById('upload-box').style.display = 'none';
}

// ── SHOW PREVIEW TABLE ──
function showPreview(results) {
  const table = document.getElementById('preview-table');
  const fields = results.meta.fields;
  const rows = results.data.slice(0, 10);

  let html = '<thead><tr>';
  fields.forEach(f => { html += `<th>${f}</th>`; });
  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    fields.forEach(f => { html += `<td>${row[f] ?? ''}</td>`; });
    html += '</tr>';
  });

  html += '</tbody>';
  table.innerHTML = html;
  document.getElementById('preview-wrap').style.display = 'block';
}

// ── RESET ──
function resetUpload() {
  parsedData = null;
  csvInput.value = '';
  document.getElementById('upload-box').style.display = 'block';
  document.getElementById('file-info-bar').style.display = 'none';
  document.getElementById('preview-wrap').style.display = 'none';
  document.getElementById('preview-table').innerHTML = '';
}

// ── FORMAT FILE SIZE ──
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
// ── CSV TO EXCEL ──
function convertToExcel() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const ws = XLSX.utils.json_to_sheet(parsedData.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  pendingDownload = { url, filename: 'csvnow_export.xlsx', isUrl: true };
  document.getElementById('download-msg').textContent = 'csvnow_export.xlsx is ready';
  document.getElementById('download-bar').style.display = 'flex';
}

// ── CSV TO JSON ──
function convertToJSON() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const json = JSON.stringify(parsedData.data, null, 2);
  downloadFile(json, 'csvnow_export.json', 'application/json');
}

// ── DOWNLOAD SYSTEM ──
let pendingDownload = null;

function downloadFile(content, filename, type) {
  pendingDownload = { content, filename, type };
  document.getElementById('download-msg').textContent = `${filename} is ready`;
  document.getElementById('download-bar').style.display = 'flex';
}

function triggerDownload() {
  if (!pendingDownload) return;
  const a = document.createElement('a');
  if (pendingDownload.isUrl) {
    a.href = pendingDownload.url;
    a.download = pendingDownload.filename;
  } else {
    const { content, filename, type } = pendingDownload;
    const blob = new Blob([content], { type });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
  }
  a.click();
  hideDownloadBar();
}

function hideDownloadBar() {
  document.getElementById('download-bar').style.display = 'none';
  pendingDownload = null;
}
// ── CSV TO SQL ──
function convertToSQL() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  const tableName = 'csvnow_table';
  let sql = `CREATE TABLE ${tableName} (\n`;
  sql += fields.map(f => `  \`${f}\` VARCHAR(255)`).join(',\n');
  sql += `\n);\n\n`;
  rows.forEach(row => {
    const values = fields.map(f => `'${(row[f] ?? '').toString().replace(/'/g, "''")}'`).join(', ');
    sql += `INSERT INTO ${tableName} (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${values});\n`;
  });
  downloadFile(sql, 'csvnow_export.sql', 'text/plain');
}

// ── CSV TO XML ──
function convertToXML() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  rows.forEach(row => {
    xml += '  <row>\n';
    fields.forEach(f => {
      xml += `    <${f}>${row[f] ?? ''}</${f}>\n`;
    });
    xml += '  </row>\n';
  });
  xml += '</root>';
  downloadFile(xml, 'csvnow_export.xml', 'application/xml');
}

// ── CSV TO HTML ──
function convertToHTML() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: sans-serif; padding: 24px; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #0D9488; color: white; padding: 10px 14px; text-align: left; }
  td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #F0FDFA; }
</style>
</head><body>\n<table>\n<thead><tr>`;
  fields.forEach(f => { html += `<th>${f}</th>`; });
  html += '</tr></thead>\n<tbody>\n';
  rows.forEach(row => {
    html += '<tr>';
    fields.forEach(f => { html += `<td>${row[f] ?? ''}</td>`; });
    html += '</tr>\n';
  });
  html += '</tbody>\n</table>\n</body></html>';
  downloadFile(html, 'csvnow_export.html', 'text/html');
}

// ── CSV TO MARKDOWN ──
function convertToMarkdown() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let md = '| ' + fields.join(' | ') + ' |\n';
  md += '| ' + fields.map(() => '---').join(' | ') + ' |\n';
  rows.forEach(row => {
    md += '| ' + fields.map(f => row[f] ?? '').join(' | ') + ' |\n';
  });
  downloadFile(md, 'csvnow_export.md', 'text/plain');
}

// ── CSV TO YAML ──
function convertToYAML() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let yaml = '';
  rows.forEach((row, i) => {
    yaml += `- # row ${i + 1}\n`;
    fields.forEach(f => {
      yaml += `  ${f}: "${row[f] ?? ''}"\n`;
    });
  });
  downloadFile(yaml, 'csvnow_export.yaml', 'text/plain');
}

// ── CSV TO PDF ──
function convertToPDF() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let html = convertToHTML();
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><style>
    body { font-family: sans-serif; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th { background: #0D9488; color: white; padding: 8px; text-align: left; }
    td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
  </style></head><body><table><thead><tr>`);
  fields.forEach(f => win.document.write(`<th>${f}</th>`));
  win.document.write('</tr></thead><tbody>');
  rows.forEach(row => {
    win.document.write('<tr>');
    fields.forEach(f => win.document.write(`<td>${row[f] ?? ''}</td>`));
    win.document.write('</tr>');
  });
  win.document.write('</tbody></table></body></html>');
  win.document.close();
  win.print();
}

// ── EXCEL TO CSV ──
function convertExcelToCSV() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(ws);
      downloadFile(csv, 'csvnow_export.csv', 'text/csv');
    };
    reader.readAsBinaryString(file);
  };
  input.click();
}

// ── JSON TO CSV ──
function convertJSONToCSV() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const csv = Papa.unparse(json);
        downloadFile(csv, 'csvnow_export.csv', 'text/csv');
      } catch {
        alert('Invalid JSON file. Please check your file and try again.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── MERGE CSVs ──
function mergeCSVs() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.multiple = true;
  input.onchange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    let allRows = [];
    let fields = null;
    let processed = 0;
    files.forEach(file => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!fields) fields = results.meta.fields;
          allRows = allRows.concat(results.data);
          processed++;
          if (processed === files.length) {
            const csv = Papa.unparse({ fields, data: allRows });
            downloadFile(csv, 'csvnow_merged.csv', 'text/csv');
          }
        }
      });
    });
  };
  input.click();
}
// ── REMOVE DUPLICATES ──
function removeDuplicates() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  const seen = new Set();
  const unique = parsedData.data.filter(row => {
    const key = fields.map(f => row[f]).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const removed = parsedData.data.length - unique.length;
  parsedData.data = unique;
  showPreview(parsedData);
  alert(`Done! Removed ${removed} duplicate row(s). ${unique.length} rows remaining.`);
  downloadFile(Papa.unparse({ fields, data: unique }), 'csvnow_deduped.csv', 'text/csv');
}

// ── TRIM WHITESPACE ──
function trimWhitespace() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  parsedData.data = parsedData.data.map(row => {
    const newRow = {};
    fields.forEach(f => { newRow[f] = (row[f] ?? '').toString().trim(); });
    return newRow;
  });
  showPreview(parsedData);
  alert('Done! All leading and trailing whitespace removed.');
  downloadFile(Papa.unparse({ fields, data: parsedData.data }), 'csvnow_trimmed.csv', 'text/csv');
}

// ── FILL EMPTY CELLS ──
function fillEmptyCells() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fillValue = prompt('What value should empty cells be filled with?', 'N/A');
  if (fillValue === null) return;
  const fields = parsedData.meta.fields;
  let filled = 0;
  parsedData.data = parsedData.data.map(row => {
    const newRow = {};
    fields.forEach(f => {
      if (row[f] === '' || row[f] === null || row[f] === undefined) {
        newRow[f] = fillValue;
        filled++;
      } else {
        newRow[f] = row[f];
      }
    });
    return newRow;
  });
  showPreview(parsedData);
  alert(`Done! Filled ${filled} empty cell(s) with "${fillValue}".`);
  downloadFile(Papa.unparse({ fields, data: parsedData.data }), 'csvnow_filled.csv', 'text/csv');
}

// ── FIX ENCODING ──
function fixEncoding() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const fields = parsedData.meta.fields;
  parsedData.data = parsedData.data.map(row => {
    const newRow = {};
    fields.forEach(f => {
      newRow[f] = (row[f] ?? '').toString()
        .replace(/â€™/g, "'")
        .replace(/â€œ/g, '"')
        .replace(/â€/g, '"')
        .replace(/Ã©/g, 'é')
        .replace(/Ã¨/g, 'è')
        .replace(/Ã /g, 'à')
        .replace(/Ã¢/g, 'â')
        .replace(/Ã®/g, 'î')
        .replace(/Ã´/g, 'ô')
        .replace(/Ã»/g, 'û')
        .replace(/Ã§/g, 'ç');
    });
    return newRow;
  });
  showPreview(parsedData);
  alert('Done! Common encoding errors have been fixed.');
  downloadFile(Papa.unparse({ fields, data: parsedData.data }), 'csvnow_fixed.csv', 'text/csv');
}

// ── STANDARDISE CASE ──
function standardiseCase() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }
  const choice = prompt('Choose case:\n1 = UPPERCASE\n2 = lowercase\n3 = Title Case\n\nType 1, 2 or 3:');
  if (!choice) return;
  const fields = parsedData.meta.fields;
  parsedData.data = parsedData.data.map(row => {
    const newRow = {};
    fields.forEach(f => {
      const val = (row[f] ?? '').toString();
      if (choice === '1') newRow[f] = val.toUpperCase();
      else if (choice === '2') newRow[f] = val.toLowerCase();
      else if (choice === '3') newRow[f] = val.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      else newRow[f] = val;
    });
    return newRow;
  });
  showPreview(parsedData);
  alert('Done! Text case has been standardised.');
  downloadFile(Papa.unparse({ fields, data: parsedData.data }), 'csvnow_cased.csv', 'text/csv');
}
// ── QUALITY SCORE ──
function qualityScore() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  const total = rows.length;
  let score = 100;
  let issues = [];

  // Check empty cells
  let emptyCells = 0;
  rows.forEach(row => {
    fields.forEach(f => {
      if (row[f] === '' || row[f] === null || row[f] === undefined) emptyCells++;
    });
  });
  if (emptyCells > 0) {
    const penalty = Math.min(30, Math.round((emptyCells / (total * fields.length)) * 100));
    score -= penalty;
    issues.push(`⚠ ${emptyCells} empty cell(s) found — penalty: ${penalty} points`);
  }

  // Check duplicates
  const seen = new Set();
  let dupes = 0;
  rows.forEach(row => {
    const key = fields.map(f => row[f]).join('|');
    if (seen.has(key)) dupes++;
    else seen.add(key);
  });
  if (dupes > 0) {
    const penalty = Math.min(20, dupes * 2);
    score -= penalty;
    issues.push(`⚠ ${dupes} duplicate row(s) found — penalty: ${penalty} points`);
  }

  // Check missing headers
  const badHeaders = fields.filter(f => f.trim() === '' || f.startsWith('Unnamed'));
  if (badHeaders.length > 0) {
    score -= 15;
    issues.push(`⚠ ${badHeaders.length} missing or unnamed column header(s) — penalty: 15 points`);
  }

  // Check consistency of row length
  let inconsistent = 0;
  rows.forEach(row => {
    if (Object.keys(row).length !== fields.length) inconsistent++;
  });
  if (inconsistent > 0) {
    score -= 10;
    issues.push(`⚠ ${inconsistent} row(s) have inconsistent column count — penalty: 10 points`);
  }

  score = Math.max(0, score);

  // Build result
  let grade = score >= 90 ? '🟢 Excellent' : score >= 70 ? '🟡 Good' : score >= 50 ? '🟠 Fair' : '🔴 Poor';
  let msg = `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `  CSVNow Quality Score\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `  Score: ${score}/100 — ${grade}\n\n`;
  msg += `  File: ${total} rows × ${fields.length} columns\n\n`;

  if (issues.length === 0) {
    msg += `  ✅ No issues found! Your CSV is clean.\n`;
  } else {
    msg += `  Issues found:\n`;
    issues.forEach(i => { msg += `  ${i}\n`; });
  }
  msg += `\n━━━━━━━━━━━━━━━━━━━━━━`;

  alert(msg);
}
// ── CSV PULSE ──
async function csvPulse() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const fields = parsedData.meta.fields;
  const rows = parsedData.data;

  try {
    const response = await fetch(`${BACKEND_URL}/csv-pulse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headers: fields,
        sample_rows: rows.slice(0, 5),
        row_count: rows.length,
        col_count: fields.length
      })
    });

    const data = await response.json();
    alert(`⚡ CSV Pulse — AI Diagnosis\n\n${data.diagnosis}`);

  } catch (error) {
    alert('Could not connect to AI backend. Please try again.');
  }
}


// ── COMPATIBILITY CHECKER ──
function compatibilityChecker() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  let results = [];

  // Shopify
  const shopifyRequired = ['Title', 'Vendor', 'Type', 'Tags', 'Published'];
  const hasShopify = shopifyRequired.filter(f => fields.includes(f));
  const shopifyScore = Math.round((hasShopify.length / shopifyRequired.length) * 100);
  results.push(`Shopify Products: ${shopifyScore >= 80 ? '✅' : shopifyScore >= 50 ? '⚠' : '❌'} ${shopifyScore}% compatible`);

  // Mailchimp
  const mailchimpRequired = ['Email Address', 'First Name', 'Last Name'];
  const hasMailchimp = mailchimpRequired.filter(f => fields.includes(f));
  const mailchimpScore = Math.round((hasMailchimp.length / mailchimpRequired.length) * 100);
  results.push(`Mailchimp: ${mailchimpScore >= 80 ? '✅' : mailchimpScore >= 50 ? '⚠' : '❌'} ${mailchimpScore}% compatible`);

  // Google Sheets
  const hasEmptyHeaders = fields.filter(f => f.trim() === '').length;
  const sheetsOk = hasEmptyHeaders === 0;
  results.push(`Google Sheets: ${sheetsOk ? '✅ Ready to import' : '❌ Fix empty column headers first'}`);

  // MySQL
  const badChars = /[^a-zA-Z0-9_]/;
  const badCols = fields.filter(f => badChars.test(f));
  results.push(`MySQL: ${badCols.length === 0 ? '✅ Column names are valid' : `⚠ ${badCols.length} column name(s) need fixing: ${badCols.slice(0,3).join(', ')}`}`);

  // Salesforce
  const sfRequired = ['Id', 'Name', 'Email'];
  const hasSF = sfRequired.filter(f => fields.includes(f));
  const sfScore = Math.round((hasSF.length / sfRequired.length) * 100);
  results.push(`Salesforce: ${sfScore >= 80 ? '✅' : sfScore >= 50 ? '⚠' : '❌'} ${sfScore}% compatible`);

  // HubSpot
  const hubRequired = ['Email', 'First Name', 'Last Name', 'Phone'];
  const hasHub = hubRequired.filter(f => fields.includes(f));
  const hubScore = Math.round((hasHub.length / hubRequired.length) * 100);
  results.push(`HubSpot: ${hubScore >= 80 ? '✅' : hubScore >= 50 ? '⚠' : '❌'} ${hubScore}% compatible`);

  // WooCommerce
  const wooRequired = ['SKU', 'Name', 'Price', 'Stock'];
  const hasWoo = wooRequired.filter(f => fields.includes(f));
  const wooScore = Math.round((hasWoo.length / wooRequired.length) * 100);
  results.push(`WooCommerce: ${wooScore >= 80 ? '✅' : wooScore >= 50 ? '⚠' : '❌'} ${wooScore}% compatible`);

  let msg = `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `   ✔ Compatibility Checker\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `File: ${rows.length} rows × ${fields.length} columns\n\n`;
  msg += `Platform Results:\n`;
  results.forEach(r => { msg += `  ${r}\n`; });
  msg += `\n💡 Tip: Column names must match exactly.\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━`;

  alert(msg);
}
// ── SPLIT CSV ──
function splitCSV() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const fields = parsedData.meta.fields;
  const rows = parsedData.data;
  const chunkSize = parseInt(prompt(`Your file has ${rows.length} rows.\nHow many rows per split file?`, '1000'));

  if (!chunkSize || isNaN(chunkSize) || chunkSize <= 0) return;

  let part = 1;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const csv = Papa.unparse({ fields, data: chunk });
    downloadFile(csv, `csvnow_part${part}.csv`, 'text/csv');
    part++;
  }

  alert(`Done! Split into ${part - 1} file(s) of ${chunkSize} rows each.`);
}
// ── SUGGESTION BUTTON ──
function openSuggest() {
  document.getElementById('suggest-modal').classList.add('open');
}

function closeSuggest() {
  document.getElementById('suggest-modal').classList.remove('open');
}

function submitSuggestion() {
  const text = document.getElementById('suggest-text').value.trim();
  if (!text) { alert('Please write your suggestion first.'); return; }
  alert('Thank you! Your suggestion has been received. 🙏');
  document.getElementById('suggest-text').value = '';
  document.getElementById('suggest-email').value = '';
  closeSuggest();
}

// ── PRO GATE ──
async function proGate() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    if (confirm('This is a Pro feature. Log in or sign up to upgrade?\n\nClick OK to go to login page.')) {
      window.location.href = 'login.html';
    }
    return false;
  } else {
    if (confirm('This feature requires a Pro plan ($12/mo).\n\nClick OK to upgrade now.')) {
      window.location.href = 'https://csvnow.lemonsqueezy.com/checkout/buy/c191afcf-8038-4dda-8f5b-9f3f79d1d50d';
    }
    return false;
  }
}