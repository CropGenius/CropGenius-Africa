#!/usr/bin/env node

/**
 * 🔥 CROPGENIUS COMPONENT AUDIT EXECUTION SCRIPT
 * INFINITY IQ GENIUS system that brutally investigates every UI fragment
 * 
 * This script:
 * 1. Executes the complete component audit
 * 2. Generates the "Components Pages Book of Lies"
 * 3. Provides actionable insights for UI resurrection
 * 4. Creates a roadmap for connecting every orphaned component
 */

import { executeComponentAudit } from '../utils/componentAuditor';
import { generateBookOfLies } from '../utils/bookOfLiesGenerator';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 🚀 MAIN EXECUTION FUNCTION
 */
async function main() {
  console.log('🔥💪 CROPGENIUS COMPONENT AUDIT - INFINITY IQ GENIUS MODE ACTIVATED!');
  console.log('=' .repeat(80));
  console.log('🎯 MISSION: Expose every broken connection and resurrect the dead UI');
  console.log('💀 TARGET: 150+ component fragments waiting to become a living force');
  console.log('🧠 METHOD: Surgical AI investigation with zero mercy');
  console.log('=' .repeat(80));

  try {
    const startTime = Date.now();

    // Step 1: Execute the brutal component audit
    console.log('\n🔍 PHASE 1: EXECUTING SURGICAL COMPONENT AUDIT...');
    const registry = await executeComponentAudit();

    // Step 2: Generate the Book of Lies
    console.log('\n📚 PHASE 2: GENERATING COMPONENTS PAGES BOOK OF LIES...');
    const bookContent = await generateBookOfLies(registry, {
      outputPath: 'CROPGENIUS_COMPONENTS_BOOK_OF_LIES.md',
      includeDetailedAnalysis: true,
      includePriorityMatrix: true,
      includeFixTimeline: true,
      includeCodeExamples: true
    });

    // Step 3: Generate summary JSON for programmatic access
    console.log('\n💾 PHASE 3: GENERATING AUDIT SUMMARY DATA...');
    const summaryData = {
      auditDate: registry.lastAudit.toISOString(),
      totalComponents: registry.totalComponents,
      integrationStatus: registry.integrationStatus,
      criticalComponents: registry.components.filter(c => 
        c.integrationIssues.some(i => i.severity === 'critical')
      ).map(c => ({
        name: c.name,
        path: c.path,
        priority: c.priority,
        issues: c.integrationIssues.filter(i => i.severity === 'critical').length
      })),
      orphanedHighPriority: registry.components.filter(c => 
        c.status === 'orphaned' && c.priority >= 7
      ).map(c => ({
        name: c.name,
        path: c.path,
        priority: c.priority
      })),
      quickWins: registry.components.filter(c => 
        c.status === 'partial' && 
        c.fixPlan.reduce((sum, f) => sum + f.estimatedHours, 0) <= 2
      ).map(c => ({
        name: c.name,
        path: c.path,
        estimatedHours: c.fixPlan.reduce((sum, f) => sum + f.estimatedHours, 0)
      }))
    };

    await fs.writeFile(
      'cropgenius-audit-summary.json', 
      JSON.stringify(summaryData, null, 2), 
      'utf-8'
    );

    // Step 4: Display results
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(80));
    console.log(`⏱️  Execution Time: ${duration} seconds`);
    console.log(`📊 Components Analyzed: ${registry.totalComponents}`);
    console.log(`🔗 Integration Rate: ${registry.integrationStatus.overall}%`);
    console.log(`💥 Critical Issues: ${registry.integrationStatus.criticalIssues}`);
    console.log(`👻 Orphaned Components: ${registry.components.filter(c => c.status === 'orphaned').length}`);
    console.log(`💀 Broken Components: ${registry.components.filter(c => c.status === 'broken').length}`);
    console.log('=' .repeat(80));

    // Display critical findings
    console.log('\n🚨 CRITICAL FINDINGS:');
    const criticalComponents = registry.components.filter(c => 
      c.integrationIssues.some(i => i.severity === 'critical')
    );
    
    if (criticalComponents.length > 0) {
      console.log(`💥 ${criticalComponents.length} components have CRITICAL issues:`);
      criticalComponents.slice(0, 5).forEach(c => {
        console.log(`   - ${c.name} (Priority: ${c.priority}/10)`);
      });
      if (criticalComponents.length > 5) {
        console.log(`   ... and ${criticalComponents.length - 5} more`);
      }
    } else {
      console.log('✅ No critical issues found!');
    }

    // Display orphaned high-priority components
    const orphanedHighPriority = registry.components.filter(c => 
      c.status === 'orphaned' && c.priority >= 7
    );
    
    if (orphanedHighPriority.length > 0) {
      console.log(`\n👻 ${orphanedHighPriority.length} HIGH-PRIORITY components are ORPHANED:`);
      orphanedHighPriority.forEach(c => {
        console.log(`   - ${c.name} (Priority: ${c.priority}/10) - WASTED POTENTIAL!`);
      });
    }

    // Display quick wins
    const quickWins = registry.components.filter(c => 
      c.status === 'partial' && 
      c.fixPlan.reduce((sum, f) => sum + f.estimatedHours, 0) <= 2
    );

    if (quickWins.length > 0) {
      console.log(`\n⚡ ${quickWins.length} QUICK WINS available (≤2h each):`);
      quickWins.slice(0, 5).forEach(c => {
        const hours = c.fixPlan.reduce((sum, f) => sum + f.estimatedHours, 0);
        console.log(`   - ${c.name} (${hours}h) - Easy integration!`);
      });
    }

    // Display next steps
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. 📖 Read the Book of Lies: CROPGENIUS_COMPONENTS_BOOK_OF_LIES.md');
    console.log('2. 🔥 Fix critical issues first (components that are completely broken)');
    console.log('3. ⚡ Tackle quick wins for immediate progress');
    console.log('4. 🎯 Follow the priority matrix for systematic resurrection');
    console.log('5. 🚀 Execute the fix plans to bring the UI to life!');

    console.log('\n💪 THE UI RESURRECTION BEGINS NOW!');
    console.log('🌟 Transform these 150+ fragments into the agricultural intelligence platform of the future!');

  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error);
    console.error('\nStack trace:', error instanceof Error ? error.stack : 'Unknown error');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as executeAudit };