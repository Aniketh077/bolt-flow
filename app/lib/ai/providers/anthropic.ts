import Anthropic from '@anthropic/sdk';
import type { AIProvider, CodeContext, CodeReview, DebugSuggestion } from './types';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  model = 'claude-3-5-sonnet-20241022';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateCode(prompt: string, context: CodeContext): Promise<string> {
    const systemPrompt = `You are Claude, an expert ${context.language} developer. Generate clean, efficient, and well-documented code.
    
Current context:
- File: ${context.currentFile}
- Language: ${context.language}
- Framework: ${context.framework || 'None'}
- Dependencies: ${context.dependencies.join(', ')}

Focus on writing production-ready code that follows best practices and is maintainable.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  async explainCode(code: string, context: CodeContext): Promise<string> {
    const prompt = `Please explain this ${context.language} code in detail:

\`\`\`${context.language}
${code}
\`\`\`

Break down:
1. What the code does
2. How it works
3. Key concepts used
4. Best practices demonstrated
5. Potential improvements

Make it educational and easy to understand.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  async reviewCode(code: string, context: CodeContext): Promise<CodeReview> {
    const prompt = `Please review this ${context.language} code and provide structured feedback:

\`\`\`${context.language}
${code}
\`\`\`

Analyze for code quality, performance, security, and maintainability. 

Respond with valid JSON in this exact format:
{
  "issues": [{"type": "error|warning|info", "message": "description", "line": number, "severity": "high|medium|low"}],
  "suggestions": [{"type": "performance|security|style|best-practice", "message": "description", "code": "suggested fix", "line": number}],
  "score": number,
  "summary": "overall assessment"
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
      return JSON.parse(content);
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
    const prompt = `Help debug this ${context.language} error:

Error: ${error}

Code:
\`\`\`${context.language}
${code}
\`\`\`

Context: ${context.currentFile} (${context.framework || 'No framework'})

Provide debugging help in this JSON format:
{
  "diagnosis": "what's wrong",
  "possibleCauses": ["cause1", "cause2"],
  "solutions": [{"description": "solution", "code": "fix code", "steps": ["step1", "step2"]}],
  "confidence": number
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
      return JSON.parse(content);
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
    const prompt = `Optimize this ${context.language} code for better performance and maintainability:

\`\`\`${context.language}
${code}
\`\`\`

Context: ${context.framework || 'No framework'}, Dependencies: ${context.dependencies.join(', ')}

Return the optimized code with comments explaining improvements.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : code;
  }

  async generateTests(code: string, context: CodeContext): Promise<string> {
    const prompt = `Generate comprehensive tests for this ${context.language} code:

\`\`\`${context.language}
${code}
\`\`\`

Create tests that cover:
- Normal functionality
- Edge cases
- Error conditions
- Integration scenarios

Use appropriate testing framework for ${context.language}.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }
}