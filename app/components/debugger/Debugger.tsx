import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { classNames } from '~/utils/classNames';

interface Breakpoint {
  id: string;
  file: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

interface StackFrame {
  id: string;
  function: string;
  file: string;
  line: number;
  column: number;
}

interface Variable {
  name: string;
  value: any;
  type: string;
  scope: 'local' | 'global' | 'closure';
}

interface DebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
  currentFile: string;
  onBreakpointToggle: (line: number) => void;
}

export function Debugger({ isVisible, onToggle, currentFile, onBreakpointToggle }: DebuggerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [callStack, setCallStack] = useState<StackFrame[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [newWatchExpression, setNewWatchExpression] = useState('');

  const addBreakpoint = (line: number) => {
    const newBreakpoint: Breakpoint = {
      id: Math.random().toString(36).substr(2, 9),
      file: currentFile,
      line,
      enabled: true
    };
    setBreakpoints(prev => [...prev, newBreakpoint]);
    onBreakpointToggle(line);
  };

  const removeBreakpoint = (id: string) => {
    const breakpoint = breakpoints.find(bp => bp.id === id);
    if (breakpoint) {
      setBreakpoints(prev => prev.filter(bp => bp.id !== id));
      onBreakpointToggle(breakpoint.line);
    }
  };

  const toggleBreakpoint = (id: string) => {
    setBreakpoints(prev => prev.map(bp => 
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    ));
  };

  const startDebugging = () => {
    setIsRunning(true);
    setIsPaused(false);
    // Simulate debugging session
    setTimeout(() => {
      setIsPaused(true);
      setCallStack([
        {
          id: '1',
          function: 'main',
          file: currentFile,
          line: 10,
          column: 5
        },
        {
          id: '2',
          function: 'handleClick',
          file: currentFile,
          line: 25,
          column: 12
        }
      ]);
      setVariables([
        { name: 'count', value: 5, type: 'number', scope: 'local' },
        { name: 'user', value: { name: 'John', age: 30 }, type: 'object', scope: 'local' },
        { name: 'isActive', value: true, type: 'boolean', scope: 'global' }
      ]);
    }, 1000);
  };

  const stopDebugging = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCallStack([]);
    setVariables([]);
  };

  const continueExecution = () => {
    setIsPaused(false);
    // Simulate continued execution
    setTimeout(() => {
      setIsRunning(false);
    }, 500);
  };

  const stepOver = () => {
    // Simulate step over
    console.log('Step over');
  };

  const stepInto = () => {
    // Simulate step into
    console.log('Step into');
  };

  const stepOut = () => {
    // Simulate step out
    console.log('Step out');
  };

  const addWatchExpression = () => {
    if (newWatchExpression.trim()) {
      setWatchExpressions(prev => [...prev, newWatchExpression.trim()]);
      setNewWatchExpression('');
    }
  };

  const removeWatchExpression = (index: number) => {
    setWatchExpressions(prev => prev.filter((_, i) => i !== index));
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-1"
    >
      <PanelHeader>
        <div className="flex items-center gap-2">
          <div className="i-ph:bug-duotone text-lg" />
          <span>Debugger</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Debug Controls */}
          <IconButton
            icon={isRunning ? "i-ph:stop-fill" : "i-ph:play-fill"}
            title={isRunning ? "Stop Debugging" : "Start Debugging"}
            onClick={isRunning ? stopDebugging : startDebugging}
            className={isRunning ? "text-red-500" : "text-green-500"}
          />
          
          {isPaused && (
            <>
              <IconButton
                icon="i-ph:play-fill"
                title="Continue"
                onClick={continueExecution}
                className="text-green-500"
              />
              <IconButton
                icon="i-ph:arrow-right"
                title="Step Over"
                onClick={stepOver}
              />
              <IconButton
                icon="i-ph:arrow-down"
                title="Step Into"
                onClick={stepInto}
              />
              <IconButton
                icon="i-ph:arrow-up"
                title="Step Out"
                onClick={stepOut}
              />
            </>
          )}
          
          <IconButton
            icon="i-ph:x"
            title="Close Debugger"
            onClick={onToggle}
          />
        </div>
      </PanelHeader>

      <div className="h-64 flex">
        <Tabs.Root defaultValue="breakpoints" className="flex-1 flex flex-col">
          <Tabs.List className="flex border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
            <Tabs.Trigger 
              value="breakpoints" 
              className="px-3 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:bg-bolt-elements-background-depth-1"
            >
              Breakpoints
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="callstack" 
              className="px-3 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:bg-bolt-elements-background-depth-1"
            >
              Call Stack
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="variables" 
              className="px-3 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:bg-bolt-elements-background-depth-1"
            >
              Variables
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="watch" 
              className="px-3 py-2 text-sm font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary data-[state=active]:text-bolt-elements-textPrimary data-[state=active]:bg-bolt-elements-background-depth-1"
            >
              Watch
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="breakpoints" className="flex-1 p-3 overflow-auto">
            <div className="space-y-2">
              {breakpoints.length === 0 ? (
                <p className="text-bolt-elements-textTertiary text-sm">No breakpoints set</p>
              ) : (
                breakpoints.map((breakpoint) => (
                  <div key={breakpoint.id} className="flex items-center gap-2 p-2 bg-bolt-elements-background-depth-2 rounded">
                    <button
                      onClick={() => toggleBreakpoint(breakpoint.id)}
                      className={classNames(
                        'w-3 h-3 rounded-full border-2',
                        breakpoint.enabled 
                          ? 'bg-red-500 border-red-500' 
                          : 'border-bolt-elements-borderColor'
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-sm text-bolt-elements-textPrimary">
                        {breakpoint.file}:{breakpoint.line}
                      </div>
                      {breakpoint.condition && (
                        <div className="text-xs text-bolt-elements-textSecondary">
                          Condition: {breakpoint.condition}
                        </div>
                      )}
                    </div>
                    <IconButton
                      icon="i-ph:trash"
                      size="sm"
                      onClick={() => removeBreakpoint(breakpoint.id)}
                      className="text-red-500"
                    />
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="callstack" className="flex-1 p-3 overflow-auto">
            <div className="space-y-1">
              {callStack.length === 0 ? (
                <p className="text-bolt-elements-textTertiary text-sm">No call stack available</p>
              ) : (
                callStack.map((frame, index) => (
                  <div key={frame.id} className="p-2 hover:bg-bolt-elements-background-depth-2 rounded cursor-pointer">
                    <div className="text-sm text-bolt-elements-textPrimary font-medium">
                      {frame.function}
                    </div>
                    <div className="text-xs text-bolt-elements-textSecondary">
                      {frame.file}:{frame.line}:{frame.column}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="variables" className="flex-1 p-3 overflow-auto">
            <div className="space-y-2">
              {variables.length === 0 ? (
                <p className="text-bolt-elements-textTertiary text-sm">No variables in scope</p>
              ) : (
                variables.map((variable, index) => (
                  <div key={index} className="p-2 bg-bolt-elements-background-depth-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-bolt-elements-textPrimary">
                        {variable.name}
                      </span>
                      <span className="text-xs px-1 py-0.5 bg-bolt-elements-background-depth-3 rounded text-bolt-elements-textSecondary">
                        {variable.type}
                      </span>
                      <span className="text-xs px-1 py-0.5 bg-accent-500/20 text-accent-500 rounded">
                        {variable.scope}
                      </span>
                    </div>
                    <div className="text-sm text-bolt-elements-textSecondary mt-1">
                      {typeof variable.value === 'object' 
                        ? JSON.stringify(variable.value, null, 2)
                        : String(variable.value)
                      }
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="watch" className="flex-1 p-3 overflow-auto">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWatchExpression}
                  onChange={(e) => setNewWatchExpression(e.target.value)}
                  placeholder="Add watch expression..."
                  className="flex-1 px-2 py-1 text-sm bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded"
                  onKeyDown={(e) => e.key === 'Enter' && addWatchExpression()}
                />
                <IconButton
                  icon="i-ph:plus"
                  size="sm"
                  onClick={addWatchExpression}
                />
              </div>
              
              {watchExpressions.map((expression, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-bolt-elements-background-depth-2 rounded">
                  <span className="flex-1 text-sm text-bolt-elements-textPrimary">
                    {expression}
                  </span>
                  <span className="text-sm text-bolt-elements-textSecondary">
                    undefined
                  </span>
                  <IconButton
                    icon="i-ph:trash"
                    size="sm"
                    onClick={() => removeWatchExpression(index)}
                    className="text-red-500"
                  />
                </div>
              ))}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </motion.div>
  );
}