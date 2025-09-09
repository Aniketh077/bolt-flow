import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import { IconButton } from '~/components/ui/IconButton';
import { aiManager, type AIProviderType } from '~/lib/ai/manager';
import type { CodeContext, CodeReview, DebugSuggestion } from '~/lib/ai/providers/types';
import { classNames } from '~/utils/classNames';

interface AIAssistantProps {
  currentCode: string;
  currentFile: string;
  language: string;
  onCodeGenerated: (code: string) => void;
  onCodeInserted: (code: string) => void;
}

export function AIAssistant({ 
  currentCode, 
  currentFile, 
  language, 
  onCodeGenerated, 
  onCodeInserted 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [provider, setProvider] = useState<AIProviderType>('anthropic');
  const [codeReview, setCodeReview] = useState<CodeReview | null>(null);
  const [debugSuggestion, setDebugSuggestion] = useState<DebugSuggestion | null>(null);

  const context: CodeContext = {
    currentFile,
    projectStructure: {},
    dependencies: [],
    recentChanges: [],
    language,
    framework: detectFramework(currentFile)
  };

  useEffect(() => {
    aiManager.setProvider(provider);
  }, [provider]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const generated = await aiManager.generateCode(prompt, context);
      setResult(generated);
      onCodeGenerated(generated);
    } catch (error) {
      console.error('AI generation failed:', error);
      setResult('Error generating code. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!currentCode.trim()) return;
    
    setLoading(true);
    try {
      const explanation = await aiManager.explainCode(currentCode, context);
      setResult(explanation);
    } catch (error) {
      console.error('AI explanation failed:', error);
      setResult('Error explaining code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!currentCode.trim()) return;
    
    setLoading(true);
    try {
      const review = await aiManager.reviewCode(currentCode, context);
      setCodeReview(review);
    } catch (error) {
      console.error('AI review failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!currentCode.trim()) return;
    
    setLoading(true);
    try {
      const optimized = await aiManager.optimizeCode(currentCode, context);
      setResult(optimized);
      onCodeGenerated(optimized);
    } catch (error) {
      console.error('AI optimization failed:', error);
      setResult('Error optimizing code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!currentCode.trim()) return;
    
    setLoading(true);
    try {
      const tests = await aiManager.generateTests(currentCode, context);
      setResult(tests);
      onCodeGenerated(tests);
    } catch (error) {
      console.error('AI test generation failed:', error);
      setResult('Error generating tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        icon="i-bolt:stars"
        title="AI Assistant"
        onClick={() => setIsOpen(true)}
        className="text-accent-500 hover:text-accent-400"
      />

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[80vh] bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
              <div className="flex items-center gap-3">
                <div className="i-bolt:stars text-xl text-accent-500" />
                <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">AI Assistant</h2>
                
                <Select.Root value={provider} onValueChange={(value) => setProvider(value as AIProviderType)}>
                  <Select.Trigger className="flex items-center gap-2 px-3 py-1 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded text-sm">
                    <Select.Value />
                    <Select.Icon className="i-ph:caret-down" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded shadow-lg">
                      <Select.Item value="anthropic" className="px-3 py-2 hover:bg-bolt-elements-background-depth-3 cursor-pointer">
                        Claude (Anthropic)
                      </Select.Item>
                      <Select.Item value="openai" className="px-3 py-2 hover:bg-bolt-elements-background-depth-3 cursor-pointer">
                        GPT-4 (OpenAI)
                      </Select.Item>
                      <Select.Item value="gemini" className="px-3 py-2 hover:bg-bolt-elements-background-depth-3 cursor-pointer">
                        Gemini (Google)
                      </Select.Item>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              
              <Dialog.Close asChild>
                <IconButton icon="i-ph:x" />
              </Dialog.Close>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <Tabs.List className="flex border-b border-bolt-elements-borderColor">
                <Tabs.Trigger 
                  value="generate" 
                  className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:border-b-2 data-[state=active]:border-accent-500"
                >
                  Generate
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="explain" 
                  className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:border-b-2 data-[state=active]:border-accent-500"
                >
                  Explain
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="review" 
                  className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:border-b-2 data-[state=active]:border-accent-500"
                >
                  Review
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="optimize" 
                  className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:border-b-2 data-[state=active]:border-accent-500"
                >
                  Optimize
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="test" 
                  className="px-4 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:border-b-2 data-[state=active]:border-accent-500"
                >
                  Tests
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 flex">
                <Tabs.Content value="generate" className="flex-1 p-4 flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                      Describe what you want to build:
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Create a React component for a user profile card with avatar, name, and bio"
                      className="w-full h-24 p-3 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary resize-none"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate Code'}
                  </button>
                </Tabs.Content>

                <Tabs.Content value="explain" className="flex-1 p-4 flex flex-col">
                  <p className="text-bolt-elements-textSecondary mb-4">
                    Get an AI explanation of your current code
                  </p>
                  <button
                    onClick={handleExplain}
                    disabled={loading || !currentCode.trim()}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                  >
                    {loading ? 'Explaining...' : 'Explain Code'}
                  </button>
                </Tabs.Content>

                <Tabs.Content value="review" className="flex-1 p-4 flex flex-col">
                  <p className="text-bolt-elements-textSecondary mb-4">
                    Get AI feedback on code quality, performance, and best practices
                  </p>
                  <button
                    onClick={handleReview}
                    disabled={loading || !currentCode.trim()}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                  >
                    {loading ? 'Reviewing...' : 'Review Code'}
                  </button>
                  
                  {codeReview && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">Score: {codeReview.score}/100</span>
                        <div className={classNames(
                          'px-2 py-1 rounded text-xs font-medium',
                          codeReview.score >= 80 ? 'bg-green-100 text-green-800' :
                          codeReview.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {codeReview.score >= 80 ? 'Excellent' :
                           codeReview.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                      
                      <p className="text-bolt-elements-textSecondary">{codeReview.summary}</p>
                      
                      {codeReview.issues.length > 0 && (
                        <div>
                          <h4 className="font-medium text-bolt-elements-textPrimary mb-2">Issues:</h4>
                          <div className="space-y-2">
                            {codeReview.issues.map((issue, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-bolt-elements-background-depth-2 rounded">
                                <div className={classNames(
                                  'w-2 h-2 rounded-full mt-2',
                                  issue.severity === 'high' ? 'bg-red-500' :
                                  issue.severity === 'medium' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                )} />
                                <div>
                                  <p className="text-sm text-bolt-elements-textPrimary">{issue.message}</p>
                                  {issue.line && <p className="text-xs text-bolt-elements-textTertiary">Line {issue.line}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="optimize" className="flex-1 p-4 flex flex-col">
                  <p className="text-bolt-elements-textSecondary mb-4">
                    Get AI suggestions to improve performance and code quality
                  </p>
                  <button
                    onClick={handleOptimize}
                    disabled={loading || !currentCode.trim()}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                  >
                    {loading ? 'Optimizing...' : 'Optimize Code'}
                  </button>
                </Tabs.Content>

                <Tabs.Content value="test" className="flex-1 p-4 flex flex-col">
                  <p className="text-bolt-elements-textSecondary mb-4">
                    Generate comprehensive unit tests for your code
                  </p>
                  <button
                    onClick={handleGenerateTests}
                    disabled={loading || !currentCode.trim()}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                  >
                    {loading ? 'Generating Tests...' : 'Generate Tests'}
                  </button>
                </Tabs.Content>

                {/* Results Panel */}
                <div className="w-1/2 border-l border-bolt-elements-borderColor flex flex-col">
                  <div className="p-4 border-b border-bolt-elements-borderColor">
                    <h3 className="font-medium text-bolt-elements-textPrimary">Result</h3>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="i-svg-spinners:90-ring-with-bg text-2xl text-accent-500" />
                      </div>
                    ) : result ? (
                      <div className="space-y-4">
                        <pre className="bg-bolt-elements-background-depth-2 p-4 rounded text-sm overflow-auto">
                          <code>{result}</code>
                        </pre>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onCodeInserted(result)}
                            className="px-3 py-1 bg-accent-500 hover:bg-accent-600 text-white rounded text-sm"
                          >
                            Insert Code
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="px-3 py-1 bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-4 text-bolt-elements-textPrimary rounded text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-bolt-elements-textTertiary text-center mt-8">
                        Results will appear here
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Tabs.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function detectFramework(filePath: string): string | undefined {
  if (filePath.includes('react') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    return 'React';
  }
  if (filePath.includes('vue') || filePath.endsWith('.vue')) {
    return 'Vue';
  }
  if (filePath.includes('angular') || filePath.includes('.component.ts')) {
    return 'Angular';
  }
  if (filePath.includes('svelte') || filePath.endsWith('.svelte')) {
    return 'Svelte';
  }
  return undefined;
}