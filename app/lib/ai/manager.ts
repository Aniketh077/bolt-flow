import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import type { AIProvider, CodeContext } from './providers/types';

export type AIProviderType = 'openai' | 'anthropic' | 'gemini';

export class AIManager {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private currentProvider: AIProviderType = 'anthropic';

  constructor() {
    // Initialize providers with API keys from environment
    if (typeof window !== 'undefined') {
      // Client-side initialization
      const openaiKey = localStorage.getItem('openai_api_key');
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const geminiKey = localStorage.getItem('gemini_api_key');

      if (openaiKey) {
        this.providers.set('openai', new OpenAIProvider(openaiKey));
      }
      if (anthropicKey) {
        this.providers.set('anthropic', new AnthropicProvider(anthropicKey));
      }
      if (geminiKey) {
        this.providers.set('gemini', new GeminiProvider(geminiKey));
      }
    }
  }

  setProvider(provider: AIProviderType) {
    if (this.providers.has(provider)) {
      this.currentProvider = provider;
    }
  }

  getCurrentProvider(): AIProvider | null {
    return this.providers.get(this.currentProvider) || null;
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  addProvider(type: AIProviderType, apiKey: string) {
    switch (type) {
      case 'openai':
        this.providers.set(type, new OpenAIProvider(apiKey));
        break;
      case 'anthropic':
        this.providers.set(type, new AnthropicProvider(apiKey));
        break;
      case 'gemini':
        this.providers.set(type, new GeminiProvider(apiKey));
        break;
    }
    
    // Store API key securely
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${type}_api_key`, apiKey);
    }
  }

  async generateCode(prompt: string, context: CodeContext): Promise<string> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.generateCode(prompt, context);
  }

  async explainCode(code: string, context: CodeContext): Promise<string> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.explainCode(code, context);
  }

  async reviewCode(code: string, context: CodeContext) {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.reviewCode(code, context);
  }

  async debugError(error: string, code: string, context: CodeContext) {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.debugError(error, code, context);
  }

  async optimizeCode(code: string, context: CodeContext): Promise<string> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.optimizeCode(code, context);
  }

  async generateTests(code: string, context: CodeContext): Promise<string> {
    const provider = this.getCurrentProvider();
    if (!provider) throw new Error('No AI provider available');
    return provider.generateTests(code, context);
  }

  // Multi-provider comparison
  async compareProviders(prompt: string, context: CodeContext) {
    const results = await Promise.allSettled(
      Array.from(this.providers.entries()).map(async ([type, provider]) => ({
        provider: type,
        result: await provider.generateCode(prompt, context)
      }))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }
}

export const aiManager = new AIManager();