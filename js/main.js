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
  XLSX.writeFile(wb, 'csvnow_export.xlsx');
}
// ── CSV TO JSON ──
function convertToJSON() {
  if (!parsedData) { alert('Please upload a CSV file first.'); return; }

  const json = JSON.stringify(parsedData.data, null, 2);
  downloadFile(json, 'csvnow_export.json', 'application/json');
}

// ── DOWNLOAD HELPER ──
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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