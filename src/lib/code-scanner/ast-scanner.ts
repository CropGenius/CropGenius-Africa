import * as ts from 'typescript';
import { UnusedExport, UnusedImport } from './types';

export class ASTScanner {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(fileNames: string[], options: ts.CompilerOptions = {}) {
    this.program = ts.createProgram(fileNames, {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      ...options
    });
    this.checker = this.program.getTypeChecker();
  }

  scanForUnusedExports(filePath: string): UnusedExport[] {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const exports: UnusedExport[] = [];
    const exportedSymbols = new Set<string>();

    const visit = (node: ts.Node) => {
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(element => {
            exportedSymbols.add(element.name.text);
          });
        }
      } else if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.name) {
          exports.push({
            filePath,
            exportName: node.name.text,
            exportType: 'function',
            lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            confidence: this.calculateExportConfidence(node.name.text, filePath)
          });
        }
      } else if (ts.isClassDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.name) {
          exports.push({
            filePath,
            exportName: node.name.text,
            exportType: 'class',
            lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            confidence: this.calculateExportConfidence(node.name.text, filePath)
          });
        }
      } else if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            exports.push({
              filePath,
              exportName: decl.name.text,
              exportType: 'const',
              lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
              confidence: this.calculateExportConfidence(decl.name.text, filePath)
            });
          }
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return exports.filter(exp => !this.isExportUsed(exp.exportName, filePath));
  }

  scanForUnusedImports(filePath: string): UnusedImport[] {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const imports: UnusedImport[] = [];
    const usedIdentifiers = new Set<string>();

    // First pass: collect all used identifiers
    const collectUsed = (node: ts.Node) => {
      if (ts.isIdentifier(node)) {
        usedIdentifiers.add(node.text);
      }
      ts.forEachChild(node, collectUsed);
    };

    // Second pass: find imports
    const findImports = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier) && node.importClause) {
          const source = moduleSpecifier.text;
          
          if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach(element => {
              const importName = element.name.text;
              if (!usedIdentifiers.has(importName)) {
                imports.push({
                  filePath,
                  importName,
                  importSource: source,
                  lineNumber: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                  isTypeImport: node.importClause?.isTypeOnly || false
                });
              }
            });
          }
        }
      }
      ts.forEachChild(node, findImports);
    };

    collectUsed(sourceFile);
    findImports(sourceFile);
    return imports;
  }

  private calculateExportConfidence(exportName: string, filePath: string): number {
    // Higher confidence for unused exports
    const references = this.findReferences(exportName, filePath);
    if (references.length === 0) return 95;
    if (references.length === 1) return 80;
    return 60;
  }

  private isExportUsed(exportName: string, filePath: string): boolean {
    return this.findReferences(exportName, filePath).length > 0;
  }

  private findReferences(symbolName: string, excludeFile: string): ts.ReferenceEntry[] {
    const sourceFiles = this.program.getSourceFiles();
    const references: ts.ReferenceEntry[] = [];

    for (const sourceFile of sourceFiles) {
      if (sourceFile.fileName === excludeFile) continue;
      
      const visit = (node: ts.Node) => {
        if (ts.isIdentifier(node) && node.text === symbolName) {
          references.push({
            fileName: sourceFile.fileName,
            textSpan: { start: node.getStart(), length: node.getWidth() },
            isWriteAccess: false,
            isDefinition: false
          });
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    }

    return references;
  }
}