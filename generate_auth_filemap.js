import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate comprehensive auth file mapping for investigation
const authKeywords = ['auth', 'login', 'signup', 'reset', 'password', 'callback', 'session', 'supabase', 'user', 'policy', 'RLS', 'email', 'otp', 'magic', 'oauth', 'google'];

function isAuthRelated(filePath, content) {
  const fileName = path.basename(filePath).toLowerCase();
  const dirPath = path.dirname(filePath).toLowerCase();
  
  // Check file/directory names
  for (const keyword of authKeywords) {
    if (fileName.includes(keyword) || dirPath.includes(keyword)) {
      return { isAuth: true, reason: `Path contains '${keyword}'` };
    }
  }
  
  // Check content
  if (content) {
    const contentLower = content.toLowerCase();
    for (const keyword of authKeywords) {
      if (contentLower.includes(keyword)) {
        return { isAuth: true, reason: `Content contains '${keyword}'` };
      }
    }
  }
  
  return { isAuth: false, reason: 'No auth keywords found' };
}

function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lineCount = content.split('\n').length;
    
    return {
      exists: true,
      size: stats.size,
      lines: lineCount,
      content: content
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      lines: 0,
      content: '',
      error: error.message
    };
  }
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath, results);
      } else if (stats.isFile()) {
        const fileStats = getFileStats(fullPath);
        const authCheck = isAuthRelated(fullPath, fileStats.content);
        
        results.push({
          path: fullPath.replace(process.cwd() + path.sep, ''),
          lines: fileStats.lines,
          bytes: fileStats.size,
          isAuthRelated: authCheck.isAuth,
          why: authCheck.reason,
          exists: fileStats.exists
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error.message);
  }
  
  return results;
}

// Generate the report
console.log('Starting auth file mapping...');
const results = scanDirectory(process.cwd());

// Sort by auth relevance, then by size
results.sort((a, b) => {
  if (a.isAuthRelated && !b.isAuthRelated) return -1;
  if (!a.isAuthRelated && b.isAuthRelated) return 1;
  return b.bytes - a.bytes;
});

// Generate CSV
const csvHeader = 'path,lines,bytes,isAuthRelated,why\n';
const csvContent = results.map(r => 
  `"${r.path}",${r.lines},${r.bytes},${r.isAuthRelated},"${r.why}"`
).join('\n');

fs.writeFileSync('AUTH_FILEMAP.csv', csvHeader + csvContent);

// Generate summary
const authFiles = results.filter(r => r.isAuthRelated);
const totalLines = results.reduce((sum, r) => sum + r.lines, 0);
const authLines = authFiles.reduce((sum, r) => sum + r.lines, 0);
const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
const authBytes = authFiles.reduce((sum, r) => sum + r.bytes, 0);

console.log('\n=== AUTH FILE MAPPING SUMMARY ===');
console.log(`Total files: ${results.length}`);
console.log(`Auth-related files: ${authFiles.length} (${(authFiles.length/results.length*100).toFixed(1)}%)`);
console.log(`Total lines: ${totalLines.toLocaleString()}`);
console.log(`Auth lines: ${authLines.toLocaleString()} (${(authLines/totalLines*100).toFixed(1)}%)`);
console.log(`Total bytes: ${totalBytes.toLocaleString()}`);
console.log(`Auth bytes: ${authBytes.toLocaleString()} (${(authBytes/totalBytes*100).toFixed(1)}%)`);

console.log('\n=== TOP 20 LARGEST AUTH FILES ===');
authFiles.slice(0, 20).forEach((file, i) => {
  console.log(`${i+1}. ${file.path} (${file.lines} lines, ${file.bytes} bytes)`);
});

console.log('\nAUTH_FILEMAP.csv generated successfully!');