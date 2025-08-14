import { OrphanedFile } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class OrphanDetector {
  private excludePatterns = [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.next/,
    /\.nuxt/,
    /\.vscode/,
    /\.idea/,
    /package\.json/,
    /package-lock\.json/,
    /yarn\.lock/,
    /tsconfig\.json/,
    /vite\.config/,
    /\.env/,
    /README/,
    /LICENSE/,
    /\.md$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.ico$/
  ];

  scanForOrphanedFiles(rootDir: string): OrphanedFile[] {
    const allFiles = this.getAllFiles(rootDir);
    const referencedFiles = new Set<string>();
    const orphans: OrphanedFile[] = [];

    // Build dependency graph
    for (const file of allFiles) {
      if (this.isExcluded(file)) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = this.extractImports(content, file);
        imports.forEach(imp => referencedFiles.add(imp));
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Find orphaned files
    for (const file of allFiles) {
      if (this.isExcluded(file)) continue;
      
      const relativePath = path.relative(rootDir, file);
      if (!referencedFiles.has(file) && !this.isEntryPoint(file)) {
        orphans.push({
          filePath: relativePath,
          reason: 'No imports found',
          confidence: this.calculateOrphanConfidence(file, allFiles)
        });
      }
    }

    return orphans;
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentDir: string) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!this.isExcluded(fullPath)) {
              traverse(fullPath);
            }
          } else if (stat.isFile() && this.isSourceFile(fullPath)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    traverse(dir);
    return files;
  }

  private extractImports(content: string, currentFile: string): string[] {
    const imports: string[] = [];
    const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    let match;
    
    // Extract ES6 imports
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = this.resolveImportPath(match[1], currentFile);
      if (importPath) imports.push(importPath);
    }
    
    // Extract CommonJS requires
    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = this.resolveImportPath(match[1], currentFile);
      if (importPath) imports.push(importPath);
    }
    
    return imports;
  }

  private resolveImportPath(importPath: string, currentFile: string): string | null {
    // Skip node_modules imports
    if (!importPath.startsWith('.')) return null;
    
    const currentDir = path.dirname(currentFile);
    const resolved = path.resolve(currentDir, importPath);
    
    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) return withExt;
    }
    
    // Try index files
    for (const ext of extensions) {
      const indexFile = path.join(resolved, 'index' + ext);
      if (fs.existsSync(indexFile)) return indexFile;
    }
    
    return null;
  }

  private isSourceFile(filePath: string): boolean {
    return /\.(ts|tsx|js|jsx)$/.test(filePath);
  }

  private isExcluded(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  private isEntryPoint(filePath: string): boolean {
    const entryPoints = [
      /main\.(ts|tsx|js|jsx)$/,
      /index\.(ts|tsx|js|jsx)$/,
      /app\.(ts|tsx|js|jsx)$/,
      /App\.(ts|tsx|js|jsx)$/,
      /vite\.config/,
      /\.config\./
    ];
    
    return entryPoints.some(pattern => pattern.test(filePath));
  }

  private calculateOrphanConfidence(filePath: string, allFiles: string[]): number {
    let confidence = 80;
    
    // Lower confidence for test files
    if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath)) {
      confidence -= 20;
    }
    
    // Lower confidence for utility files
    if (/utils?|helpers?|constants?/.test(filePath)) {
      confidence -= 10;
    }
    
    // Higher confidence for component files with no references
    if (/components?/.test(filePath)) {
      confidence += 10;
    }
    
    return Math.max(60, Math.min(95, confidence));
  }
}