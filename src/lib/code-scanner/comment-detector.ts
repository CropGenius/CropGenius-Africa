import { CommentedCodeBlock } from './types';

export class CommentDetector {
  private codePatterns = [
    /\/\/\s*(function|const|let|var|class|interface|type|import|export)/,
    /\/\*[\s\S]*?(function|const|let|var|class|interface|type|import|export)[\s\S]*?\*\//,
    /\/\/\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]/,
    /\/\/\s*if\s*\(/,
    /\/\/\s*for\s*\(/,
    /\/\/\s*while\s*\(/,
    /\/\/\s*return\s+/,
    /\/\/\s*console\./
  ];

  private documentationPatterns = [
    /\/\*\*[\s\S]*?\*\//,
    /\/\/\s*@\w+/,
    /\/\/\s*TODO:/,
    /\/\/\s*FIXME:/,
    /\/\/\s*NOTE:/,
    /\/\/\s*HACK:/
  ];

  scanForCommentedCode(filePath: string, content: string): CommentedCodeBlock[] {
    const lines = content.split('\n');
    const blocks: CommentedCodeBlock[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip documentation comments
      if (this.isDocumentation(line)) continue;
      
      // Check for commented code
      if (this.isCommentedCode(line)) {
        const block = this.extractCommentBlock(lines, i, filePath);
        if (block) {
          blocks.push(block);
          i = block.lineEnd - 1; // Skip processed lines
        }
      }
    }
    
    return blocks;
  }

  private isCommentedCode(line: string): boolean {
    const trimmed = line.trim();
    return this.codePatterns.some(pattern => pattern.test(trimmed));
  }

  private isDocumentation(line: string): boolean {
    const trimmed = line.trim();
    return this.documentationPatterns.some(pattern => pattern.test(trimmed));
  }

  private extractCommentBlock(lines: string[], startIndex: number, filePath: string): CommentedCodeBlock | null {
    let endIndex = startIndex;
    let content = lines[startIndex];
    
    // Extend block for consecutive commented lines
    while (endIndex + 1 < lines.length) {
      const nextLine = lines[endIndex + 1].trim();
      if (nextLine.startsWith('//') || nextLine.startsWith('/*') || nextLine.includes('*/')) {
        endIndex++;
        content += '\n' + lines[endIndex];
      } else {
        break;
      }
    }
    
    // Calculate confidence based on code patterns
    const confidence = this.calculateCodeConfidence(content);
    
    if (confidence < 60) return null; // Too low confidence
    
    return {
      filePath,
      content,
      lineStart: startIndex + 1,
      lineEnd: endIndex + 1,
      confidence
    };
  }

  private calculateCodeConfidence(content: string): number {
    let score = 0;
    const totalPatterns = this.codePatterns.length;
    
    for (const pattern of this.codePatterns) {
      if (pattern.test(content)) {
        score += 1;
      }
    }
    
    // Bonus for multiple code indicators
    if (content.includes('{') && content.includes('}')) score += 2;
    if (content.includes('(') && content.includes(')')) score += 1;
    if (content.includes(';')) score += 1;
    
    return Math.min(95, (score / totalPatterns) * 100);
  }
}