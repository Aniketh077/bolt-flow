import OpenAI from 'openai';
import type { AIProvider, CodeContext, CodeReview, DebugSuggestion } from './types';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  model = 'gpt-4';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateCode(prompt: string, context: CodeContext): Promise<string> {
    const systemPrompt = `You are an expert ${context.language} developer. Generate clean, efficient, and well-documented code.
    
Current file: ${context.currentFile}
Language: ${context.language}
Framework: ${context.framework || 'None'}
Dependencies: ${context.dependencies.join(', ')}

Generate code that follows best practices and is production-ready.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || '';
  }

  async explainCode(code: string, context: CodeContext): Promise<string> {
    const prompt = `Explain this ${context.language} code in detail. Break down what each part does and why it's written this way:

\`\`\`${context.language}
${code}
\`\`\`

Provide a clear, educational explanation suitable for developers.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    return response.choices[0]?.message?.content || '';
  }

  async reviewCode(code: string, context: CodeContext): Promise<CodeReview> {
    const prompt = `Review this ${context.language} code and provide detailed feedback:

\`\`\`${context.language}
${code}
\`\`\`

Analyze for:
1. Code quality and best practices
2. Performance issues
3. Security vulnerabilities
4. Maintainability concerns
5. Style and formatting

Return a JSON response with the following structure:
{
  "issues": [{"type": "error|warning|info", "message": "...", "line": number, "severity": "high|medium|low"}],
  "suggestions": [{"type": "performance|security|style|best-practice", "message": "...", "code": "...", "line": number}],
  "score": number (0-100),
  "summary": "Overall assessment"
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response.choices[0]?.message?.content || '{}');
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
    const prompt = `Debug this ${context.language} error:

Error: ${error}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Context:
- File: ${context.currentFile}
- Language: ${context.language}
- Framework: ${context.framework || 'None'}

Provide debugging assistance in JSON format:
{
  "diagnosis": "What's wrong",
  "possibleCauses": ["cause1", "cause2"],
  "solutions": [{"description": "...", "code": "...", "steps": ["step1", "step2"]}],
  "confidence": number (0-100)
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    try {
      return JSON.parse(response.choices[0]?.message?.content || '{}');
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
    const prompt = `Optimize this ${context.language} code for better performance, readability, and maintainability:

\`\`\`${context.language}
${code}
\`\`\`

Context:
- Framework: ${context.framework || 'None'}
- Dependencies: ${context.dependencies.join(', ')}

Return only the optimized code with comments explaining the improvements.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || code;
  }

  async generateTests(code: string, context: CodeContext): Promise<string> {
    const prompt = `Generate comprehensive unit tests for this ${context.language} code:

\`\`\`${context.language}
${code}
\`\`\`

Context:
- Framework: ${context.framework || 'None'}
- Testing framework: Jest/Vitest

Generate tests that cover:
1. Happy path scenarios
2. Edge cases
3. Error conditions
4. Boundary values

Return complete test code with proper imports and setup.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || '';
  }
}