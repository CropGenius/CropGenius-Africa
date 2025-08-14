import { ASTScanner } from './ast-scanner';
import { CommentDetector } from './comment-detector';
import { OrphanDetector } from './orphan-detector';
import { ScanResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class CodeScanner {
  private astScanner: ASTScanner;
  private commentDetector: CommentDetector;
  private orphanDetector: OrphanDetector;

  constructor(rootDir: string) {
    const tsFiles = this.getTSFiles(rootDir);
    this.astScanner = new ASTScanner(tsFiles);
    this.commentDetector = new CommentDetector();
    this.orphanDetector = new OrphanDetector();
  }

  async scanProject(rootDir: string): Promise<ScanResult> {
    const tsFiles = this.getTSFiles(rootDir);
    const unusedExports = [];
    const unusedImports = [];
    const commentedCode = [];

    // Scan each TypeScript file
    for (const file of tsFiles) {
      try {
        // Scan for unused exports and imports
        const exports = this.astScanner.scanForUnusedExports(file);
        const imports = this.astScanner.scanForUnusedImports(file);
        
        unusedExports.push(...exports);
        unusedImports.push(...imports);

        // Scan for commented code
        const content = fs.readFileSync(file, 'utf-8');
        const comments = this.commentDetector.scanForCommentedCode(file, content);
        commentedCode.push(...comments);
      } catch (error) {
        console.warn(`Failed to scan ${file}:`, error);
      }
    }

    // Scan for orphaned files
    const orphanedFiles = this.orphanDetector.scanForOrphanedFiles(rootDir);

    const totalIssues = unusedExports.length + unusedImports.length + 
                       commentedCode.length + orphanedFiles.length;

    const potentialSavings = {
      linesRemoved: commentedCode.reduce((sum, block) => 
        sum + (block.lineEnd - block.lineStart + 1), 0) + unusedImports.length,
      filesRemoved: orphanedFiles.length
    };

    return {
      unusedExports,
      unusedImports,
      commentedCode,
      orphanedFiles,
      totalIssues,
      potentialSavings
    };
  }

  private getTSFiles(rootDir: string): string[] {
    const files: string[] = [];
    
    const traverse = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !this.shouldSkipDir(item)) {
            traverse(fullPath);
          } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    traverse(rootDir);
    return files;
  }

  private shouldSkipDir(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
    return skipDirs.includes(dirName);
  }
}

export * from './types';
export { ASTScanner } from './ast-scanner';
export { CommentDetector } from './comment-detector';
export { OrphanDetector } from './orphan-detector';