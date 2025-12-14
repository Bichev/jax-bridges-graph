#!/usr/bin/env node

/**
 * Publish Business Reports to Public Folder
 * 
 * This script copies business reports to the public folder and generates
 * a beautiful index.html for browsing and downloading.
 * 
 * Usage:
 *   node scripts/publish-reports.js
 *   npm run publish-reports
 * 
 * Output:
 *   public/reports/ - Contains all PDFs and index.html
 *   Accessible at: https://your-site.com/reports/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const SOURCE_DIR = path.join(__dirname, '..', 'output', 'business-reports');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'reports');

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Extract business name from filename
 */
function extractBusinessName(filename) {
  // Remove _Partnership_Analysis_YYYY-MM-DD.pdf
  return filename
    .replace(/_Partnership_Analysis_\d{4}-\d{2}-\d{2}\.pdf$/, '')
    .replace(/_/g, ' ')
    .replace(/&/g, '&amp;');
}

/**
 * Generate the HTML index page
 */
function generateIndexHTML(files) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const fileRows = files.map((file, idx) => `
        <tr>
          <td class="num">${idx + 1}</td>
          <td class="name">
            <a href="${encodeURIComponent(file.name)}" download>
              <span class="icon">📄</span>
              ${file.displayName}
            </a>
          </td>
          <td class="size">${file.size}</td>
          <td class="action">
            <a href="${encodeURIComponent(file.name)}" download class="btn">
              ⬇️ Download
            </a>
          </td>
        </tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JAX Bridges Partnership Reports</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>
    :root {
      --navy: #0A1628;
      --cyan: #00D9FF;
      --dark: #111827;
      --gray-800: #1F2937;
      --gray-600: #4B5563;
      --gray-400: #9CA3AF;
      --gray-200: #E5E7EB;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, var(--navy) 0%, var(--dark) 100%);
      min-height: 100vh;
      color: #fff;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(90deg, var(--cyan), #00FF88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: var(--gray-400);
      font-size: 1.1rem;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--cyan);
    }
    
    .stat-label {
      color: var(--gray-400);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .card {
      background: rgba(31, 41, 55, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
    
    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .search-box {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 12px;
    }
    
    .search-box input {
      background: none;
      border: none;
      color: #fff;
      font-size: 0.95rem;
      width: 200px;
      outline: none;
    }
    
    .search-box input::placeholder {
      color: var(--gray-400);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 16px 24px;
      text-align: left;
    }
    
    th {
      background: rgba(0, 0, 0, 0.2);
      color: var(--gray-400);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    
    tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background 0.2s;
    }
    
    tbody tr:hover {
      background: rgba(0, 217, 255, 0.05);
    }
    
    .num {
      width: 50px;
      color: var(--gray-400);
      font-size: 0.9rem;
    }
    
    .name a {
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }
    
    .name a:hover {
      color: var(--cyan);
    }
    
    .icon {
      font-size: 1.2rem;
    }
    
    .size {
      width: 100px;
      color: var(--gray-400);
      font-size: 0.9rem;
    }
    
    .action {
      width: 140px;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--cyan), #00C4E0);
      color: var(--navy);
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 217, 255, 0.4);
    }
    
    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: var(--gray-400);
      font-size: 0.85rem;
    }
    
    footer a {
      color: var(--cyan);
      text-decoration: none;
    }
    
    .hidden {
      display: none !important;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px 10px;
      }
      
      th, td {
        padding: 12px 10px;
      }
      
      .size, .num {
        display: none;
      }
      
      .action {
        width: auto;
      }
      
      .search-box input {
        width: 150px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">JAX Bridges</div>
      <p class="subtitle">Business Partnership Analysis Reports</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${files.length}</div>
          <div class="stat-label">Reports Available</div>
        </div>
        <div class="stat">
          <div class="stat-value">${date.split(' ')[0]}</div>
          <div class="stat-label">${date.split(' ').slice(1).join(' ')}</div>
        </div>
      </div>
    </header>
    
    <main class="card">
      <div class="card-header">
        <h2 class="card-title">📊 Partnership Reports</h2>
        <div class="search-box">
          <span>🔍</span>
          <input type="text" id="search" placeholder="Search businesses...">
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Business Name</th>
            <th>Size</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="file-list">
${fileRows}
        </tbody>
      </table>
    </main>
    
    <footer>
      <p>Generated by <a href="https://jaxaiagency.com" target="_blank">JAX AI Agency</a> • Powered by AI</p>
      <p style="margin-top: 8px;">Each report contains partnership opportunities with all other businesses in the cohort.</p>
    </footer>
  </div>
  
  <script>
    // Simple search functionality
    const searchInput = document.getElementById('search');
    const rows = document.querySelectorAll('#file-list tr');
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      
      rows.forEach(row => {
        const name = row.querySelector('.name').textContent.toLowerCase();
        if (name.includes(query)) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Main execution
 */
async function main() {
  console.log('📤 Publishing Business Reports to Public Folder\n');
  console.log('=' .repeat(50));
  
  // Check source directory
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('❌ Source directory not found:', SOURCE_DIR);
    console.error('   Run "npm run generate-business-reports" first.\n');
    process.exit(1);
  }
  
  // Create public/reports directory
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log('📁 Created directory:', PUBLIC_DIR);
  }
  
  // Get list of PDF files
  const pdfFiles = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b));
  
  console.log(`\n📄 Found ${pdfFiles.length} PDF files to publish\n`);
  
  // Copy files and collect metadata
  const files = [];
  
  for (const filename of pdfFiles) {
    const sourcePath = path.join(SOURCE_DIR, filename);
    const destPath = path.join(PUBLIC_DIR, filename);
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    
    // Get file size
    const stats = fs.statSync(destPath);
    
    files.push({
      name: filename,
      displayName: extractBusinessName(filename),
      size: formatFileSize(stats.size)
    });
    
    console.log(`   ✓ ${filename}`);
  }
  
  // Generate index.html
  console.log('\n📝 Generating index.html...');
  const indexHTML = generateIndexHTML(files);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexHTML);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ PUBLISH COMPLETE!\n');
  console.log(`   📁 Location: public/reports/`);
  console.log(`   📄 Files: ${files.length} PDFs`);
  console.log(`   🌐 URL (after deploy): https://your-site.com/reports/`);
  console.log('\n💡 Next steps:');
  console.log('   1. Run "npm run build" to build the site');
  console.log('   2. Deploy to Vercel/hosting');
  console.log('   3. Share the /reports/ link with the cohort!\n');
}

// Run
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

