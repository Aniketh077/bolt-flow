export interface CodeContext {
  currentFile: string;
  projectStructure: Record<string, any>;
  dependencies: string[];
  recentChanges: string[];
  language: string;
  framework?: string;
}

export interface CodeReview {
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  score: number;
  summary: string;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  severity: 'high' | 'medium' | 'low';
}

export interface CodeSuggestion {
  type: 'performance' | 'security' | 'style' | 'best-practice';
  message: string;
  code?: string;
  line?: number;
}

export interface DebugSuggestion {
  diagnosis: string;
  possibleCauses: string[];
  solutions: Solution[];
  confidence: number;
}

export interface Solution {
  description: string;
  code?: string;
  steps: string[];
}

export interface AIProvider {
  name: string;
  model: string;
  generateCode(prompt: string, context: CodeContext): Promise<string>;
  explainCode(code: string, context: CodeContext): Promise<string>;
  reviewCode(code: string, context: CodeContext): Promise<CodeReview>;
  debugError(error: string, code: string, context: CodeContext): Promise<DebugSuggestion>;
  optimizeCode(code: string, context: CodeContext): Promise<string>;
  generateTests(code: string, context: CodeContext): Promise<string>;
}