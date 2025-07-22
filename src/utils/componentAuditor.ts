/**
 * 🔥 CROPGENIUS COMPONENT AUDITOR - INFINITY IQ GENIUS SYSTEM
 * Brutally investigates every component like a crash investigation team
 * Exposes every broken connection, missing wire, and orphaned UI fragment
 * 
 * This is the surgical AI that will resurrect the dead UI into a living force!
 */

import { promises as fs } from 'fs';
import path from 'path';

// INFINITY IQ GENIUS interfaces for component analysis
export interface ComponentAuditResult {
  name: string;
  path: string;
  status: 'connected' | 'orphaned' | 'partial' | 'broken';
  dependencies: string[];
  dataRequirements: DataRequirement[];
  integrationIssues: IntegrationIssue[];
  fixPlan: FixAction[];
  usageCount: number;
  exportType: 'default' | 'named' | 'none';
  hasTests: boolean;
  complexity: 'low' | 'medium' | 'high';
  priority: number; // 1-10 based on user journey importance
}

export interface DataRequirement {
  type: 'supabase' | 'api' | 'context' | 'props' | 'hooks';
  source: string;
  required: boolean;
  currentStatus: 'missing' | 'partial' | 'connected';
  description: string;
}

export interface IntegrationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'routing' | 'data' | 'styling' | 'props' | 'imports' | 'exports';
  description: string;
  solution: string;
  effort: 'low' | 'medium' | 'high';
}

export interface FixAction {
  action: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  dependencies: string[];
}

export interface ComponentRegistry {
  components: ComponentAuditResult[];
  categories: ComponentCategory[];
  integrationStatus: IntegrationStatus;
  lastAudit: Date;
  totalComponents: number;
  connectedComponents: number;
  orphanedComponents: number;
  brokenComponents: number;
}

export interface ComponentCategory {
  name: string;
  path: string;
  componentCount: number;
  integrationRate: number;
  priority: number;
}

export interface IntegrationStatus {
  overall: number; // percentage
  byCategory: Record<string, number>;
  criticalIssues: number;
  highPriorityIssues: number;
  totalIssues: number;
}

/**
 * 🧠 INFINITY IQ GENIUS COMPONENT AUDITOR CLASS
 * The surgical AI that exposes every broken connection
 */
export class ComponentAuditor {
  private componentsPath: string;
  private pagesPath: string;
  private auditResults: ComponentAuditResult[] = [];
  private usageMap: Map<string, string[]> = new Map();

  constructor(projectRoot: string = process.cwd()) {
    this.componentsPath = path.join(projectRoot, 'src', 'components');
    this.pagesPath = path.join(projectRoot, 'src', 'pages');
  }

  /**
   * 🔥 MAIN AUDIT EXECUTION - UNLEASH THE SURGICAL AI
   */
  async executeFullAudit(): Promise<ComponentRegistry> {
    console.log('🔥 INFINITY IQ GENIUS COMPONENT AUDITOR ACTIVATED!');
    console.log('💀 Beginning brutal investigation of UI fragments...');

    try {
      // Step 1: Discover all components recursively
      const componentFiles = await this.discoverComponents();
      console.log(`📊 Discovered ${componentFiles.length} component files`);

      // Step 2: Build usage map by scanning all files
      await this.buildUsageMap();
      console.log(`🔍 Built usage map with ${this.usageMap.size} entries`);

      // Step 3: Analyze each component with surgical precision
      for (const filePath of componentFiles) {
        const auditResult = await this.analyzeComponent(filePath);
        this.auditResults.push(auditResult);
      }

      // Step 4: Generate comprehensive registry
      const registry = this.generateRegistry();
      
      console.log('✅ COMPONENT AUDIT COMPLETED!');
      console.log(`📈 Integration Status: ${registry.integrationStatus.overall}%`);
      console.log(`🔗 Connected: ${registry.connectedComponents}/${registry.totalComponents}`);
      console.log(`💀 Orphaned: ${registry.orphanedComponents}`);
      console.log(`💥 Broken: ${registry.brokenComponents}`);

      return registry;
    } catch (error) {
      console.error('❌ AUDIT FAILED:', error);
      throw error;
    }
  }

  /**
   * 🕵️ Discover all component files recursively
   */
  private async discoverComponents(): Promise<string[]> {
    const componentFiles: string[] = [];

    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            // Skip test directories and node_modules
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
        console.warn(`⚠️ Could not scan directory ${dirPath}:`, error);
      }
    };

    await scanDirectory(this.componentsPath);
    return componentFiles;
  }

  /**
   * 🔍 Build usage map by scanning all source files
   */
  private async buildUsageMap(): Promise<void> {
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
        console.warn(`⚠️ Could not scan ${scanPath} for usage:`, error);
      }
    }
  }

  /**
   * 🔎 Scan directory for component usage
   */
  private async scanForUsage(dirPath: string): Promise<void> {
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

  /**
   * 📄 Analyze file for component imports and usage
   */
  private async analyzeFileUsage(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract import statements
      const importRegex = /import\s+(?:{[^}]*}|[^,\s]+|[^,\s]+\s*,\s*{[^}]*})\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Check if it's a component import
        if (importPath.includes('/components/') || importPath.startsWith('@/components/')) {
          const componentName = this.extractComponentNameFromImport(match[0]);
          if (componentName) {
            if (!this.usageMap.has(componentName)) {
              this.usageMap.set(componentName, []);
            }
            this.usageMap.get(componentName)!.push(filePath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not analyze file ${filePath}:`, error);
    }
  }

  /**
   * 🔤 Extract component name from import statement
   */
  private extractComponentNameFromImport(importStatement: string): string | null {
    // Handle default imports: import ComponentName from '...'
    const defaultImportMatch = importStatement.match(/import\s+([A-Z][a-zA-Z0-9]*)\s+from/);
    if (defaultImportMatch) {
      return defaultImportMatch[1];
    }

    // Handle named imports: import { ComponentName } from '...'
    const namedImportMatch = importStatement.match(/import\s+{[^}]*([A-Z][a-zA-Z0-9]*)[^}]*}\s+from/);
    if (namedImportMatch) {
      return namedImportMatch[1];
    }

    return null;
  }

  /**
   * 🧪 SURGICAL COMPONENT ANALYSIS - The heart of the audit system
   */
  private async analyzeComponent(filePath: string): Promise<ComponentAuditResult> {
    const componentName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Analyze component structure
      const exportType = this.analyzeExportType(content);
      const dependencies = this.extractDependencies(content);
      const dataRequirements = this.analyzeDataRequirements(content);
      const integrationIssues = this.identifyIntegrationIssues(content, componentName, filePath);
      const usageCount = this.usageMap.get(componentName)?.length || 0;
      const hasTests = await this.checkForTests(filePath);
      const complexity = this.assessComplexity(content);
      const priority = this.calculatePriority(componentName, filePath, usageCount);
      
      // Determine overall status
      const status = this.determineComponentStatus(usageCount, integrationIssues, dataRequirements);
      
      // Generate fix plan
      const fixPlan = this.generateFixPlan(integrationIssues, dataRequirements, status);

      return {
        name: componentName,
        path: relativePath,
        status,
        dependencies,
        dataRequirements,
        integrationIssues,
        fixPlan,
        usageCount,
        exportType,
        hasTests,
        complexity,
        priority
      };
    } catch (error) {
      console.error(`❌ Failed to analyze component ${componentName}:`, error);
      
      return {
        name: componentName,
        path: relativePath,
        status: 'broken',
        dependencies: [],
        dataRequirements: [],
        integrationIssues: [{
          severity: 'critical',
          category: 'imports',
          description: `Failed to analyze component: ${error}`,
          solution: 'Fix file syntax and structure',
          effort: 'medium'
        }],
        fixPlan: [],
        usageCount: 0,
        exportType: 'none',
        hasTests: false,
        complexity: 'high',
        priority: 1
      };
    }
  }

  /**
   * 📤 Analyze export type
   */
  private analyzeExportType(content: string): 'default' | 'named' | 'none' {
    if (content.includes('export default')) {
      return 'default';
    } else if (content.includes('export ') && (content.includes('export const') || content.includes('export function'))) {
      return 'named';
    }
    return 'none';
  }

  /**
   * 🔗 Extract component dependencies
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // Extract React hooks
    const hookMatches = content.match(/use[A-Z][a-zA-Z0-9]*/g);
    if (hookMatches) {
      dependencies.push(...hookMatches);
    }
    
    // Extract Supabase usage
    if (content.includes('supabase')) {
      dependencies.push('supabase');
    }
    
    // Extract external libraries
    const libraryImports = content.match(/from\s+['"]([^@./][^'"]*)['"]/g);
    if (libraryImports) {
      libraryImports.forEach(imp => {
        const lib = imp.match(/from\s+['"]([^'"]*)['"]/)?.[1];
        if (lib && !lib.startsWith('.') && !lib.startsWith('@/')) {
          dependencies.push(lib);
        }
      });
    }
    
    return [...new Set(dependencies)];
  }

  /**
   * 📊 Analyze data requirements
   */
  private analyzeDataRequirements(content: string): DataRequirement[] {
    const requirements: DataRequirement[] = [];
    
    // Check for Supabase usage
    if (content.includes('supabase') || content.includes('from(') || content.includes('.select(')) {
      requirements.push({
        type: 'supabase',
        source: 'Supabase Database',
        required: true,
        currentStatus: content.includes('useQuery') || content.includes('useEffect') ? 'connected' : 'partial',
        description: 'Requires database connection for data fetching'
      });
    }
    
    // Check for API calls
    if (content.includes('fetch(') || content.includes('axios') || content.includes('api.')) {
      requirements.push({
        type: 'api',
        source: 'External API',
        required: true,
        currentStatus: 'partial',
        description: 'Makes external API calls'
      });
    }
    
    // Check for context usage
    if (content.includes('useContext') || content.includes('Context')) {
      requirements.push({
        type: 'context',
        source: 'React Context',
        required: true,
        currentStatus: content.includes('Provider') ? 'connected' : 'partial',
        description: 'Requires React Context for state management'
      });
    }
    
    // Check for custom hooks
    const customHooks = content.match(/use[A-Z][a-zA-Z0-9]*/g);
    if (customHooks) {
      customHooks.forEach(hook => {
        if (!['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'].includes(hook)) {
          requirements.push({
            type: 'hooks',
            source: hook,
            required: true,
            currentStatus: 'partial',
            description: `Requires custom hook: ${hook}`
          });
        }
      });
    }
    
    return requirements;
  }

  /**
   * 🚨 Identify integration issues with surgical precision
   */
  private identifyIntegrationIssues(content: string, componentName: string, filePath: string): IntegrationIssue[] {
    const issues: IntegrationIssue[] = [];
    
    // Check for missing exports
    if (!content.includes('export')) {
      issues.push({
        severity: 'critical',
        category: 'exports',
        description: 'Component has no export statement',
        solution: 'Add export default or named export',
        effort: 'low'
      });
    }
    
    // Check for unused imports
    const importLines = content.match(/import.*from.*/g) || [];
    importLines.forEach(importLine => {
      const importedItems = importLine.match(/import\s+(?:{([^}]*)}|([^,\s]+))/);
      if (importedItems) {
        const items = importedItems[1] ? importedItems[1].split(',').map(s => s.trim()) : [importedItems[2]];
        items.forEach(item => {
          if (item && !content.includes(item.replace(/\s+as\s+\w+/, ''))) {
            issues.push({
              severity: 'low',
              category: 'imports',
              description: `Unused import: ${item}`,
              solution: `Remove unused import: ${item}`,
              effort: 'low'
            });
          }
        });
      }
    });
    
    // Check for missing error handling
    if ((content.includes('fetch(') || content.includes('supabase')) && !content.includes('catch') && !content.includes('error')) {
      issues.push({
        severity: 'high',
        category: 'data',
        description: 'Missing error handling for async operations',
        solution: 'Add try-catch blocks and error state management',
        effort: 'medium'
      });
    }
    
    // Check for missing loading states
    if ((content.includes('fetch(') || content.includes('supabase')) && !content.includes('loading') && !content.includes('Loading')) {
      issues.push({
        severity: 'medium',
        category: 'data',
        description: 'Missing loading state management',
        solution: 'Add loading state and loading indicators',
        effort: 'low'
      });
    }
    
    // Check for missing TypeScript types
    if (filePath.endsWith('.tsx') && !content.includes('interface') && !content.includes('type ') && content.includes('props')) {
      issues.push({
        severity: 'medium',
        category: 'props',
        description: 'Missing TypeScript interface for props',
        solution: 'Define proper TypeScript interfaces for component props',
        effort: 'medium'
      });
    }
    
    // Check for hardcoded values that should be props
    const hardcodedStrings = content.match(/"[^"]{10,}"/g);
    if (hardcodedStrings && hardcodedStrings.length > 3) {
      issues.push({
        severity: 'low',
        category: 'props',
        description: 'Contains hardcoded values that should be configurable',
        solution: 'Extract hardcoded values to props or configuration',
        effort: 'medium'
      });
    }
    
    return issues;
  }

  /**
   * 🧪 Check if component has tests
   */
  private async checkForTests(filePath: string): Promise<boolean> {
    const testPaths = [
      filePath.replace('.tsx', '.test.tsx'),
      filePath.replace('.ts', '.test.ts'),
      path.join(path.dirname(filePath), '__tests__', path.basename(filePath).replace('.tsx', '.test.tsx')),
      path.join(path.dirname(filePath), '__tests__', path.basename(filePath).replace('.ts', '.test.ts'))
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

  /**
   * 🧠 Assess component complexity
   */
  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const lines = content.split('\n').length;
    const hooks = (content.match(/use[A-Z]/g) || []).length;
    const conditionals = (content.match(/if\s*\(|switch\s*\(|\?\s*:/g) || []).length;
    const asyncOps = (content.match(/async|await|\.then\(|fetch\(|supabase/g) || []).length;
    
    const complexityScore = lines * 0.1 + hooks * 2 + conditionals * 1.5 + asyncOps * 3;
    
    if (complexityScore > 50) return 'high';
    if (complexityScore > 20) return 'medium';
    return 'low';
  }

  /**
   * 🎯 Calculate component priority based on user journey importance
   */
  private calculatePriority(componentName: string, filePath: string, usageCount: number): number {
    let priority = 5; // Base priority
    
    // High priority components (core user journey)
    const highPriorityPatterns = [
      'auth', 'login', 'dashboard', 'index', 'home', 'field', 'scan', 'chat', 'weather', 'market',
      'navigation', 'layout', 'mobile', 'button', 'card', 'input', 'form'
    ];
    
    // Medium priority components
    const mediumPriorityPatterns = [
      'modal', 'dialog', 'alert', 'notification', 'settings', 'profile', 'onboarding'
    ];
    
    // Low priority components
    const lowPriorityPatterns = [
      'debug', 'test', 'demo', 'example', 'skeleton', 'fallback'
    ];
    
    const lowerName = componentName.toLowerCase();
    const lowerPath = filePath.toLowerCase();
    
    if (highPriorityPatterns.some(pattern => lowerName.includes(pattern) || lowerPath.includes(pattern))) {
      priority += 3;
    } else if (mediumPriorityPatterns.some(pattern => lowerName.includes(pattern) || lowerPath.includes(pattern))) {
      priority += 1;
    } else if (lowPriorityPatterns.some(pattern => lowerName.includes(pattern) || lowerPath.includes(pattern))) {
      priority -= 2;
    }
    
    // Boost priority based on usage
    priority += Math.min(usageCount * 0.5, 3);
    
    // Ensure priority is within bounds
    return Math.max(1, Math.min(10, Math.round(priority)));
  }

  /**
   * 📊 Determine overall component status
   */
  private determineComponentStatus(
    usageCount: number, 
    issues: IntegrationIssue[], 
    dataRequirements: DataRequirement[]
  ): 'connected' | 'orphaned' | 'partial' | 'broken' {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const missingDataConnections = dataRequirements.filter(r => r.currentStatus === 'missing').length;
    
    if (criticalIssues > 0) {
      return 'broken';
    }
    
    if (usageCount === 0) {
      return 'orphaned';
    }
    
    if (missingDataConnections > 0 || issues.filter(i => i.severity === 'high').length > 0) {
      return 'partial';
    }
    
    return 'connected';
  }

  /**
   * 🔧 Generate fix plan for component
   */
  private generateFixPlan(
    issues: IntegrationIssue[], 
    dataRequirements: DataRequirement[], 
    status: string
  ): FixAction[] {
    const fixPlan: FixAction[] = [];
    
    // Add fixes for critical issues first
    issues.filter(i => i.severity === 'critical').forEach(issue => {
      fixPlan.push({
        action: `Fix ${issue.category} issue`,
        description: issue.solution,
        priority: 'critical',
        estimatedHours: issue.effort === 'high' ? 4 : issue.effort === 'medium' ? 2 : 1,
        dependencies: []
      });
    });
    
    // Add fixes for missing data connections
    dataRequirements.filter(r => r.currentStatus === 'missing').forEach(req => {
      fixPlan.push({
        action: `Connect ${req.type} data source`,
        description: `Implement ${req.description}`,
        priority: 'high',
        estimatedHours: req.type === 'supabase' ? 3 : 2,
        dependencies: req.type === 'supabase' ? ['supabase-client'] : []
      });
    });
    
    // Add fixes for high priority issues
    issues.filter(i => i.severity === 'high').forEach(issue => {
      fixPlan.push({
        action: `Improve ${issue.category}`,
        description: issue.solution,
        priority: 'high',
        estimatedHours: issue.effort === 'high' ? 3 : issue.effort === 'medium' ? 2 : 1,
        dependencies: []
      });
    });
    
    // Add integration fix if orphaned
    if (status === 'orphaned') {
      fixPlan.push({
        action: 'Integrate component into application',
        description: 'Add component to appropriate pages or parent components',
        priority: 'medium',
        estimatedHours: 2,
        dependencies: ['routing', 'page-structure']
      });
    }
    
    return fixPlan;
  }

  /**
   * 📋 Generate comprehensive component registry
   */
  private generateRegistry(): ComponentRegistry {
    const categories = this.generateCategories();
    const integrationStatus = this.calculateIntegrationStatus();
    
    const connectedComponents = this.auditResults.filter(c => c.status === 'connected').length;
    const orphanedComponents = this.auditResults.filter(c => c.status === 'orphaned').length;
    const brokenComponents = this.auditResults.filter(c => c.status === 'broken').length;
    
    return {
      components: this.auditResults.sort((a, b) => b.priority - a.priority),
      categories,
      integrationStatus,
      lastAudit: new Date(),
      totalComponents: this.auditResults.length,
      connectedComponents,
      orphanedComponents,
      brokenComponents
    };
  }

  /**
   * 📂 Generate component categories
   */
  private generateCategories(): ComponentCategory[] {
    const categoryMap = new Map<string, ComponentAuditResult[]>();
    
    this.auditResults.forEach(component => {
      const category = this.extractCategory(component.path);
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(component);
    });
    
    return Array.from(categoryMap.entries()).map(([name, components]) => ({
      name,
      path: name,
      componentCount: components.length,
      integrationRate: Math.round((components.filter(c => c.status === 'connected').length / components.length) * 100),
      priority: Math.round(components.reduce((sum, c) => sum + c.priority, 0) / components.length)
    }));
  }

  /**
   * 📁 Extract category from component path
   */
  private extractCategory(filePath: string): string {
    const pathParts = filePath.split('/');
    const componentsIndex = pathParts.findIndex(part => part === 'components');
    
    if (componentsIndex !== -1 && pathParts.length > componentsIndex + 1) {
      return pathParts[componentsIndex + 1];
    }
    
    return 'root';
  }

  /**
   * 📊 Calculate overall integration status
   */
  private calculateIntegrationStatus(): IntegrationStatus {
    const total = this.auditResults.length;
    const connected = this.auditResults.filter(c => c.status === 'connected').length;
    const overall = total > 0 ? Math.round((connected / total) * 100) : 0;
    
    const byCategory: Record<string, number> = {};
    const categories = this.generateCategories();
    categories.forEach(cat => {
      byCategory[cat.name] = cat.integrationRate;
    });
    
    const allIssues = this.auditResults.flatMap(c => c.integrationIssues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highPriorityIssues = allIssues.filter(i => i.severity === 'high').length;
    
    return {
      overall,
      byCategory,
      criticalIssues,
      highPriorityIssues,
      totalIssues: allIssues.length
    };
  }
}

/**
 * 🚀 EXECUTE COMPONENT AUDIT - Main entry point
 */
export async function executeComponentAudit(projectRoot?: string): Promise<ComponentRegistry> {
  const auditor = new ComponentAuditor(projectRoot);
  return await auditor.executeFullAudit();
}