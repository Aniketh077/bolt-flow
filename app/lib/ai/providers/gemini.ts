import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, CodeContext, CodeReview, DebugSuggestion } from './types';

export class GeminiProvider implements AIProvider {
  name = 'Google';
  model = 'gemini-1.5-pro';
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateCode(prompt: string, context: CodeContext): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const enhancedPrompt = `You are an expert ${context.language} developer. Generate clean, efficient code.

Context:
- File: ${context.currentFile}
- Language: ${context.language}
- Framework: ${context.framework || 'None'}
- Dependencies: ${context.dependencies.join(', ')}

Request: ${prompt}

Generate production-ready code with proper error handling and documentation.`;

    const result = await model.generateContent(enhancedPrompt);
    return result.response.text();
  }

  async explainCode(code: string, context: CodeContext): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const prompt = `Explain this ${context.language} code clearly and educationally:

\`\`\`${context.language}
${code}
\`\`\`

Provide:
1. Overview of what it does
2. Step-by-step breakdown
3. Key concepts and patterns
4. Best practices shown
5. Potential improvements`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async reviewCode(code: string, context: CodeContext): Promise<CodeReview> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const prompt = `Review this ${context.language} code for quality, performance, security, and maintainability:

\`\`\`${context.language}
${code}
\`\`\`

Return valid JSON only:
{
  "issues": [{"type": "error|warning|info", "message": "...", "line": 0, "severity": "high|medium|low"}],
  "suggestions": [{"type": "performance|security|style|best-practice", "message": "...", "code": "...", "line": 0}],
  "score": 85,
  "summary": "..."
}`;

    const result = await model.generateContent(prompt);
    
    try {
      return JSON.parse(result.response.text());
    } catch {
      return {
        issues: [],
        suggestions: [],
        score: 50,
        summary: 'Unable to parse review response'
      };
    }
  }

  async debugError(error: string, code: string, context: CodeContext): Promise<DebugSuggestion> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const prompt = `Debug this ${context.language} error:

Error: ${error}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Return JSON only:
{
  "diagnosis": "...",
  "possibleCauses": ["..."],
  "solutions": [{"description": "...", "code": "...", "steps": ["..."]}],
  "confidence": 90
}`;

    const result = await model.generateContent(prompt);
    
    try {
      return JSON.parse(result.response.text());
    } catch {
      return {
        diagnosis: 'Unable to analyze error',
        possibleCauses: [],
        solutions: [],
        confidence: 0
      };
    }
  }

  async optimizeCode(code: string, context: CodeContext): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const prompt = `Optimize this ${context.language} code:

\`\`\`${context.language}
${code}
\`\`\`

Framework: ${context.framework || 'None'}
Focus on performance, readability, and best practices.
Return optimized code with improvement comments.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async generateTests(code: string, context: CodeContext): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    
    const prompt = `Generate comprehensive tests for this ${context.language} code:

\`\`\`${context.language}
${code}
\`\`\`

Include:
- Unit tests for all functions
- Edge case testing
- Error condition testing
- Integration tests where applicable

Use appropriate testing framework.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}