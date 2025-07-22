#!/usr/bin/env node

/**
 * 🔥 CROPGENIUS COMPONENT AUDIT EXECUTION SCRIPT (Node.js Compatible)
 * INFINITY IQ GENIUS system that brutally investigates every UI fragment
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🧠 SIMPLIFIED COMPONENT AUDITOR FOR IMMEDIATE EXECUTION
 */
class SimpleComponentAuditor {
  constructor() {
    this.componentsPath = path.join(process.cwd(), 'src', 'components');
    this.pagesPath = path.join(process.cwd(), 'src', 'pages');
    this.auditResults = [];
    this.usageMap = new Map();
  }

  async executeAudit() {
    console.log('🔥 INFINITY IQ GENIUS COMPONENT AUDITOR ACTIVATED!');
    console.log('💀 Beginning brutal investigation of UI fragments...');

    try {
      // Discover components
      const componentFiles = await this.discoverComponents();
      console.log(`📊 Discovered ${componentFiles.length} component files`);

      // Build usage map
      await this.buildUsageMap();
      console.log(`🔍 Built usage map with ${this.usageMap.size} entries`);

      // Analyze each component
      for (const filePath of componentFiles) {
        const result = await this.analyzeComponent(filePath);
        this.auditResults.push(result);
      }

      return this.generateSummary();
    } catch (error) {
      console.error('❌ AUDIT FAILED:', error);
      throw error;
    }
  }

  async discoverComponents() {
    const componentFiles = [];

    const scanDirectory = async (dirPath) => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && 
                !entry.name.includes('__tests__') && 
                entry.name !== 'node_modules') {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile() && 
                     (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
                     !entry.name.endsWith('.test.tsx') &&
                     !entry.name.endsWith('.test.ts')) {
            componentFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan directory ${dirPath}:`, error.message);
      }
    };

    await scanDirectory(this.componentsPath);
    return componentFiles;
  }

  async buildUsageMap() {
    const scanPaths = [
      this.pagesPath,
      this.componentsPath,
      path.join(path.dirname(this.componentsPath), 'hooks'),
      path.join(path.dirname(this.componentsPath), 'services'),
      path.join(path.dirname(this.componentsPath), 'providers')
    ];

    for (const scanPath of scanPaths) {
      try {
        await this.scanForUsage(scanPath);
      } catch (error) {
        // Directory might not exist, skip silently
      }
    }
  }

  async scanForUsage(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.includes('__tests__')) {
          await this.scanForUsage(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          await this.analyzeFileUsage(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }
  }

  async analyzeFileUsage(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const importRegex = /import\s+(?:{[^}]*}|[^,\s]+|[^,\s]+\s*,\s*{[^}]*})\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        if (importPath.includes('/components/') || importPath.startsWith('@/components/')) {
          const componentName = this.extractComponentNameFromImport(match[0]);
          if (componentName) {
            if (!this.usageMap.has(componentName)) {
              this.usageMap.set(componentName, []);
            }
            this.usageMap.get(componentName).push(filePath);
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  extractComponentNameFromImport(importStatement) {
    const defaultImportMatch = importStatement.match(/import\s+([A-Z][a-zA-Z0-9]*)\s+from/);
    if (defaultImportMatch) {
      return defaultImportMatch[1];
    }

    const namedImportMatch = importStatement.match(/import\s+{[^}]*([A-Z][a-zA-Z0-9]*)[^}]*}\s+from/);
    if (namedImportMatch) {
      return namedImportMatch[1];
    }

    return null;
  }

  async analyzeComponent(filePath) {
    const componentName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const usageCount = this.usageMap.get(componentName)?.length || 0;
      const hasExport = content.includes('export');
      const hasSupabase = content.includes('supabase');
      const hasAPI = content.includes('fetch(') || content.includes('api.');
      const hasError = content.includes('error') || content.includes('catch');
      const hasLoading = content.includes('loading') || content.includes('Loading');
      const hasTests = await this.checkForTests(filePath);
      
      const issues = [];
      if (!hasExport) {
        issues.push({ severity: 'critical', description: 'No export statement' });
      }
      if ((hasSupabase || hasAPI) && !hasError) {
        issues.push({ severity: 'high', description: 'Missing error handling' });
      }
      if ((hasSupabase || hasAPI) && !hasLoading) {
        issues.push({ severity: 'medium', description: 'Missing loading states' });
      }

      let status = 'connected';
      if (issues.some(i => i.severity === 'critical')) {
        status = 'broken';
      } else if (usageCount === 0) {
        status = 'orphaned';
      } else if (issues.length > 0) {
        status = 'partial';
      }

      const priority = this.calculatePriority(componentName, filePath, usageCount);

      return {
        name: componentName,
        path: relativePath,
        status,
        usageCount,
        hasTests,
        issues: issues.length,
        priority,
        hasSupabase,
        hasAPI,
        hasError,
        hasLoading
      };
    } catch (error) {
      return {
        name: componentName,
        path: relativePath,
        status: 'broken',
        usageCount: 0,
        hasTests: false,
        issues: 1,
        priority: 1,
        error: error.message
      };
    }
  }

  async checkForTests(filePath) {
    const testPaths = [
      filePath.replace('.tsx', '.test.tsx'),
      filePath.replace('.ts', '.test.ts'),
      path.join(path.dirname(filePath), '__tests__', path.basename(filePath).replace('.tsx', '.test.tsx'))
    ];
    
    for (const testPath of testPaths) {
      try {
        await fs.access(testPath);
        return true;
      } catch {
        // Test file doesn't exist
      }
    }
    
    return false;
  }

  calculatePriority(componentName, filePath, usageCount) {
    let priority = 5;
    
    const highPriorityPatterns = [
      'auth', 'login', 'dashboard', 'index', 'home', 'field', 'scan', 'chat', 'weather', 'market',
      'navigation', 'layout', 'mobile', 'button', 'card', 'input', 'form'
    ];
    
    const lowerName = componentName.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    
    if (highPriorityPatterns.some(pattern => lowerName.includes(pattern) || lowerPath.includes(pattern))) {
      priority += 3;
    }
    
    priority += Math.min(usageCount * 0.5, 3);
    
    return Math.max(1, Math.min(10, Math.round(priority)));
  }

  generateSummary() {
    const total = this.auditResults.length;
    const connected = this.auditResults.filter(c => c.status === 'connected').length;
    const orphaned = this.auditResults.filter(c => c.status === 'orphaned').length;
    const broken = this.auditResults.filter(c => c.status === 'broken').length;
    const partial = this.auditResults.filter(c => c.status === 'partial').length;

    return {
      totalComponents: total,
      connectedComponents: connected,
      orphanedComponents: orphaned,
      brokenComponents: broken,
      partialComponents: partial,
      integrationRate: total > 0 ? Math.round((connected / total) * 100) : 0,
      components: this.auditResults.sort((a, b) => b.priority - a.priority),
      lastAudit: new Date()
    };
  }
}

/**
 * 📚 SIMPLE BOOK OF LIES GENERATOR
 */
async function generateSimpleBookOfLies(summary) {
  const content = `# 🔥 CROPGENIUS COMPONENTS PAGES BOOK OF LIES
## The Brutal Truth About Our Dead UI

**Generated**: ${summary.lastAudit.toISOString()}  
**Total Components**: ${summary.totalComponents}  
**Integration Rate**: ${summary.integrationRate}%  

## 📊 EXECUTIVE SUMMARY

- **Connected**: ${summary.connectedComponents} (${Math.round((summary.connectedComponents/summary.totalComponents)*100)}%)
- **Orphaned**: ${summary.orphanedComponents} (${Math.round((summary.orphanedComponents/summary.totalComponents)*100)}%)
- **Broken**: ${summary.brokenComponents} (${Math.round((summary.brokenComponents/summary.totalComponents)*100)}%)
- **Partial**: ${summary.partialComponents} (${Math.round((summary.partialComponents/summary.totalComponents)*100)}%)

## 🚨 CRITICAL ISSUES

### 💥 BROKEN COMPONENTS
${summary.components.filter(c => c.status === 'broken').map(c => 
  `- **${c.name}** (${c.path}) - Priority: ${c.priority}/10`
).join('\n') || 'None found! 🎉'}

### 👻 ORPHANED HIGH-PRIORITY COMPONENTS
${summary.components.filter(c => c.status === 'orphaned' && c.priority >= 7).map(c => 
  `- **${c.name}** (${c.path}) - Priority: ${c.priority}/10 - WASTED POTENTIAL!`
).join('\n') || 'None found! 🎉'}

## 🎯 PRIORITY MATRIX

### 🔥 HIGH PRIORITY (8-10)
${summary.components.filter(c => c.priority >= 8).map(c => 
  `- ${c.status === 'connected' ? '✅' : c.status === 'broken' ? '💥' : c.status === 'orphaned' ? '👻' : '⚠️'} **${c.name}** (${c.priority}/10) - ${c.status}`
).join('\n') || 'None found'}

### ⚡ MEDIUM PRIORITY (5-7)
${summary.components.filter(c => c.priority >= 5 && c.priority < 8).slice(0, 10).map(c => 
  `- ${c.status === 'connected' ? '✅' : c.status === 'broken' ? '💥' : c.status === 'orphaned' ? '👻' : '⚠️'} **${c.name}** (${c.priority}/10) - ${c.status}`
).join('\n') || 'None found'}

## 📋 DETAILED COMPONENT ANALYSIS

${summary.components.map(c => `
### ${c.name}
**Path**: \`${c.path}\`  
**Status**: ${c.status === 'connected' ? '✅ CONNECTED' : c.status === 'broken' ? '💥 BROKEN' : c.status === 'orphaned' ? '👻 ORPHANED' : '⚠️ PARTIAL'}  
**Priority**: ${c.priority}/10  
**Usage**: ${c.usageCount} files  
**Has Tests**: ${c.hasTests ? '✅' : '❌'}  
**Issues**: ${c.issues}  
**Supabase**: ${c.hasSupabase ? '✅' : '❌'}  
**API Calls**: ${c.hasAPI ? '✅' : '❌'}  
**Error Handling**: ${c.hasError ? '✅' : '❌'}  
**Loading States**: ${c.hasLoading ? '✅' : '❌'}  
${c.error ? `**Error**: ${c.error}` : ''}
`).join('\n')}

## 🎯 NEXT STEPS

1. **Fix Broken Components**: ${summary.brokenComponents} components need immediate attention
2. **Connect Orphaned Components**: ${summary.orphanedComponents} components are unused
3. **Complete Partial Components**: ${summary.partialComponents} components need finishing touches
4. **Add Error Handling**: Many components lack proper error handling
5. **Add Loading States**: Components need loading indicators
6. **Write Tests**: ${summary.components.filter(c => !c.hasTests).length} components have no tests

## 🚀 RESURRECTION CHECKLIST

- [ ] Fix all broken components
- [ ] Connect high-priority orphaned components  
- [ ] Add error handling to all API calls
- [ ] Add loading states to all data fetching
- [ ] Write tests for critical components
- [ ] Achieve 90%+ integration rate

**When complete, the CropGenius UI will be ALIVE! 🌟**

---
*Generated by INFINITY IQ GENIUS Component Auditor*
`;

  await fs.writeFile('CROPGENIUS_COMPONENTS_BOOK_OF_LIES.md', content, 'utf-8');
  return content;
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
  console.log('🔥💪 CROPGENIUS COMPONENT AUDIT - INFINITY IQ GENIUS MODE ACTIVATED!');
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    
    const auditor = new SimpleComponentAuditor();
    const summary = await auditor.executeAudit();
    
    await generateSimpleBookOfLies(summary);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`⏱️  Execution Time: ${duration} seconds`);
    console.log(`📊 Components Analyzed: ${summary.totalComponents}`);
    console.log(`🔗 Integration Rate: ${summary.integrationRate}%`);
    console.log(`💥 Broken Components: ${summary.brokenComponents}`);
    console.log(`👻 Orphaned Components: ${summary.orphanedComponents}`);
    console.log(`⚠️ Partial Components: ${summary.partialComponents}`);
    console.log(`✅ Connected Components: ${summary.connectedComponents}`);
    console.log('='.repeat(80));

    // Critical findings
    const criticalComponents = summary.components.filter(c => c.status === 'broken');
    if (criticalComponents.length > 0) {
      console.log(`\n💥 ${criticalComponents.length} BROKEN components need immediate attention:`);
      criticalComponents.slice(0, 5).forEach(c => {
        console.log(`   - ${c.name} (Priority: ${c.priority}/10)`);
      });
    }

    const orphanedHighPriority = summary.components.filter(c => c.status === 'orphaned' && c.priority >= 7);
    if (orphanedHighPriority.length > 0) {
      console.log(`\n👻 ${orphanedHighPriority.length} HIGH-PRIORITY components are ORPHANED:`);
      orphanedHighPriority.forEach(c => {
        console.log(`   - ${c.name} (Priority: ${c.priority}/10) - WASTED POTENTIAL!`);
      });
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. 📖 Read: CROPGENIUS_COMPONENTS_BOOK_OF_LIES.md');
    console.log('2. 🔥 Fix broken components first');
    console.log('3. 🎯 Connect high-priority orphaned components');
    console.log('4. ⚡ Add error handling and loading states');
    console.log('5. 🚀 Achieve 90%+ integration rate!');

    console.log('\n💪 THE UI RESURRECTION BEGINS NOW!');

  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error);
    process.exit(1);
  }
}

main().catch(console.error);