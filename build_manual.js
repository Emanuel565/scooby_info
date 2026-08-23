const fs = require('fs');
const marked = require('marked');
const { execSync } = require('child_process');

const md = fs.readFileSync('MANUAL_DO_USUARIO_POR_CARGO.md', 'utf-8');
const htmlContent = marked.parse(md);

const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Manual do Usuário por Cargo - Scooby OS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #ffffff;
    }
    h1 {
      color: #0f172a;
      font-size: 26px;
      font-weight: 900;
      border-bottom: 3px solid #0d9488;
      padding-bottom: 12px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    h2 {
      color: #0f766e;
      font-size: 19px;
      font-weight: 800;
      margin-top: 30px;
      margin-bottom: 12px;
      border-left: 4px solid #0d9488;
      padding-left: 10px;
    }
    h3 {
      color: #334155;
      font-size: 15px;
      font-weight: 700;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    p, li {
      font-size: 13.5px;
      color: #334155;
    }
    ul, ol {
      padding-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 6px;
    }
    code {
      background-color: #f1f5f9;
      color: #0f766e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-weight: 600;
    }
    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 30px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #0f766e;
      color: #ffffff;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    blockquote {
      border-left: 4px solid #14b8a6;
      margin: 15px 0;
      padding: 10px 15px;
      background-color: #f0fdfa;
      color: #0f766e;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
    }
    @media print {
      body {
        max-width: 100%;
        padding: 20px;
      }
      h2 {
        page-break-after: avoid;
      }
      table, tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

fs.writeFileSync('MANUAL_DO_USUARIO_POR_CARGO.html', fullHtml);
console.log('HTML gerado com sucesso!');
