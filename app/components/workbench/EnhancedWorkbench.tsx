import { useStore } from '@nanostores/react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '~/components/ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { renderLogger } from '~/utils/logger';
import { AIAssistant } from '../ai/AIAssistant';
import { CollaborationProvider } from '../collaboration/CollaborationProvider';
import { ShareDialog } from '../collaboration/ShareDialog';
import { UserPresence } from '../collaboration/UserPresence';
import { Debugger } from '../debugger/Debugger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';

interface EnhancedWorkbenchProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export const EnhancedWorkbench = memo(({ chatStarted, isStreaming }: EnhancedWorkbenchProps) => {
  renderLogger.trace('EnhancedWorkbench');

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);

  const [showDebugger, setShowDebugger] = useState(false);
  const [currentCode, setCurrentCode] = useState('');

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  useEffect(() => {
    if (hasPreview) {
      setSelectedView('preview');
    }
  }, [hasPreview]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  useEffect(() => {
    if (currentDocument) {
      setCurrentCode(currentDocument.value);
    }
  }, [currentDocument]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
    setCurrentCode(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(() => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  const onCodeGenerated = useCallback((code: string) => {
    // Handle AI-generated code
    setCurrentCode(code);
  }, []);

  const onCodeInserted = useCallback((code: string) => {
    // Insert code at current cursor position
    workbenchStore.setCurrentDocumentContent(currentCode + '\n' + code);
  }, [currentCode]);

  const onBreakpointToggle = useCallback((line: number) => {
    // Handle breakpoint toggle in editor
    console.log('Toggle breakpoint at line:', line);
  }, []);

  const onShare = useCallback((sessionId: string) => {
    console.log('Sharing session:', sessionId);
  }, []);

  const getLanguageFromFile = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[extension || ''] || 'text';
  };

  return (
    <CollaborationProvider>
      {chatStarted && (
        <motion.div
          initial="closed"
          animate={showWorkbench ? 'open' : 'closed'}
          variants={workbenchVariants}
          className="z-workbench"
        >
          <div
            className={classNames(
              'fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-0 transition-[left,width] duration-200 bolt-ease-cubic-bezier',
              {
                'left-[var(--workbench-left)]': showWorkbench,
                'left-[100%]': !showWorkbench,
              },
            )}
          >
            <div className="absolute inset-0 px-6">
              <div className="h-full flex flex-col bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor shadow-sm rounded-lg overflow-hidden">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-bolt-elements-borderColor">
                  <div className="flex items-center gap-2">
                    <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
                    
                    {/* User Presence */}
                    <UserPresence />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* AI Assistant */}
                    {selectedView === 'code' && currentDocument && (
                      <AIAssistant
                        currentCode={currentCode}
                        currentFile={currentDocument.filePath}
                        language={getLanguageFromFile(currentDocument.filePath)}
                        onCodeGenerated={onCodeGenerated}
                        onCodeInserted={onCodeInserted}
                      />
                    )}
                    
                    {/* Share & Collaborate */}
                    <ShareDialog
                      projectId="current-project"
                      onShare={onShare}
                    />
                    
                    {/* Debug Toggle */}
                    {selectedView === 'code' && (
                      <PanelHeaderButton
                        className="mr-1 text-sm"
                        onClick={() => setShowDebugger(!showDebugger)}
                      >
                        <div className="i-ph:bug" />
                        Debug
                      </PanelHeaderButton>
                    )}
                    
                    {/* Terminal Toggle */}
                    {selectedView === 'code' && (
                      <PanelHeaderButton
                        className="mr-1 text-sm"
                        onClick={() => {
                          workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
                        }}
                      >
                        <div className="i-ph:terminal" />
                        Terminal
                      </PanelHeaderButton>
                    )}
                    
                    {/* Close Button */}
                    <IconButton
                      icon="i-ph:x-circle"
                      className="-mr-1"
                      size="xl"
                      onClick={() => {
                        workbenchStore.showWorkbench.set(false);
                      }}
                    />
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="relative flex-1 overflow-hidden">
                  <View
                    initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
                    animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex-1">
                        <EditorPanel
                          editorDocument={currentDocument}
                          isStreaming={isStreaming}
                          selectedFile={selectedFile}
                          files={files}
                          unsavedFiles={unsavedFiles}
                          onFileSelect={onFileSelect}
                          onEditorScroll={onEditorScroll}
                          onEditorChange={onEditorChange}
                          onFileSave={onFileSave}
                          onFileReset={onFileReset}
                        />
                      </div>
                      
                      {/* Debugger Panel */}
                      <Debugger
                        isVisible={showDebugger}
                        onToggle={() => setShowDebugger(!showDebugger)}
                        currentFile={currentDocument?.filePath || ''}
                        onBreakpointToggle={onBreakpointToggle}
                      />
                    </div>
                  </View>
                  
                  <View
                    initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
                    animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
                  >
                    <Preview />
                  </View>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </CollaborationProvider>
  );
});

interface ViewProps extends HTMLMotionProps<'div'> {
  children: JSX.Element;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});