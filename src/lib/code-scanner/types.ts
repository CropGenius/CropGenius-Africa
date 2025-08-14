export interface UnusedExport {
  filePath: string;
  exportName: string;
  exportType: 'function' | 'class' | 'const' | 'type' | 'interface' | 'default';
  lineNumber: number;
  confidence: number;
}

export interface UnusedImport {
  filePath: string;
  importName: string;
  importSource: string;
  lineNumber: number;
  isTypeImport: boolean;
}

export interface CommentedCodeBlock {
  filePath: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  confidence: number;
}

export interface OrphanedFile {
  filePath: string;
  reason: string;
  confidence: number;
}

export interface ScanResult {
  unusedExports: UnusedExport[];
  unusedImports: UnusedImport[];
  commentedCode: CommentedCodeBlock[];
  orphanedFiles: OrphanedFile[];
  totalIssues: number;
  potentialSavings: {
    linesRemoved: number;
    filesRemoved: number;
  };
}