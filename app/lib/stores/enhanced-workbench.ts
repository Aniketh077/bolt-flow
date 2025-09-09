import { atom, map, type MapStore, type WritableAtom } from 'nanostores';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  dependencies: string[];
  framework?: string;
}

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface CollaborationSession {
  id: string;
  users: Array<{
    id: string;
    name: string;
    color: string;
    cursor?: { line: number; column: number };
  }>;
  isActive: boolean;
}

export class EnhancedWorkbenchStore {
  // AI Settings
  aiSettings: WritableAtom<AISettings> = atom({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2000
  });

  // Project Templates
  templates: MapStore<Record<string, ProjectTemplate>> = map({});

  // Collaboration
  collaborationSession: WritableAtom<CollaborationSession | null> = atom(null);

  // Debug State
  debuggerEnabled: WritableAtom<boolean> = atom(false);
  breakpoints: MapStore<Record<string, number[]>> = map({});

  // Performance Metrics
  performanceMetrics: WritableAtom<{
    loadTime: number;
    buildTime: number;
    aiResponseTime: number;
  }> = atom({
    loadTime: 0,
    buildTime: 0,
    aiResponseTime: 0
  });

  // User Preferences
  userPreferences: WritableAtom<{
    theme: 'light' | 'dark';
    fontSize: number;
    autoSave: boolean;
    aiAssistance: boolean;
    collaborationEnabled: boolean;
  }> = atom({
    theme: 'dark',
    fontSize: 14,
    autoSave: true,
    aiAssistance: true,
    collaborationEnabled: true
  });

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: Record<string, ProjectTemplate> = {
      'react-typescript': {
        id: 'react-typescript',
        name: 'React + TypeScript',
        description: 'Modern React app with TypeScript and Vite',
        framework: 'React',
        dependencies: ['react', 'react-dom', '@types/react', '@types/react-dom', 'typescript', 'vite'],
        files: {
          'package.json': JSON.stringify({
            name: 'react-typescript-app',
            private: true,
            version: '0.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              '@types/react': '^18.2.15',
              '@types/react-dom': '^18.2.7',
              '@vitejs/plugin-react': '^4.0.3',
              typescript: '^5.0.2',
              vite: '^4.4.5'
            }
          }, null, 2),
          'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + TypeScript App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
          'src/App.tsx': `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>React + TypeScript</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
          'src/App.css': `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}`,
          'src/index.css': `body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}`
        }
      },
      'vue-typescript': {
        id: 'vue-typescript',
        name: 'Vue + TypeScript',
        description: 'Vue 3 app with TypeScript and Vite',
        framework: 'Vue',
        dependencies: ['vue', '@vitejs/plugin-vue', 'typescript'],
        files: {
          'package.json': JSON.stringify({
            name: 'vue-typescript-app',
            private: true,
            version: '0.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vue-tsc && vite build',
              preview: 'vite preview'
            },
            dependencies: {
              vue: '^3.3.4'
            },
            devDependencies: {
              '@vitejs/plugin-vue': '^4.2.3',
              typescript: '^5.0.2',
              'vue-tsc': '^1.8.5',
              vite: '^4.4.5'
            }
          }, null, 2),
          'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue + TypeScript App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
          'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
          'src/App.vue': `<template>
  <div id="app">
    <h1>Vue + TypeScript</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}
</style>`
        }
      }
    };

    this.templates.set(defaultTemplates);
  }

  // AI Settings Methods
  updateAISettings(settings: Partial<AISettings>) {
    this.aiSettings.set({ ...this.aiSettings.get(), ...settings });
  }

  // Template Methods
  addTemplate(template: ProjectTemplate) {
    this.templates.setKey(template.id, template);
  }

  getTemplate(id: string): ProjectTemplate | undefined {
    return this.templates.get()[id];
  }

  // Collaboration Methods
  startCollaboration(session: CollaborationSession) {
    this.collaborationSession.set(session);
  }

  endCollaboration() {
    this.collaborationSession.set(null);
  }

  // Debug Methods
  toggleDebugger() {
    this.debuggerEnabled.set(!this.debuggerEnabled.get());
  }

  addBreakpoint(file: string, line: number) {
    const current = this.breakpoints.get();
    const fileBreakpoints = current[file] || [];
    if (!fileBreakpoints.includes(line)) {
      this.breakpoints.setKey(file, [...fileBreakpoints, line]);
    }
  }

  removeBreakpoint(file: string, line: number) {
    const current = this.breakpoints.get();
    const fileBreakpoints = current[file] || [];
    this.breakpoints.setKey(file, fileBreakpoints.filter(l => l !== line));
  }

  // Performance Methods
  updatePerformanceMetrics(metrics: Partial<{
    loadTime: number;
    buildTime: number;
    aiResponseTime: number;
  }>) {
    this.performanceMetrics.set({ ...this.performanceMetrics.get(), ...metrics });
  }

  // User Preferences Methods
  updateUserPreferences(preferences: Partial<{
    theme: 'light' | 'dark';
    fontSize: number;
    autoSave: boolean;
    aiAssistance: boolean;
    collaborationEnabled: boolean;
  }>) {
    this.userPreferences.set({ ...this.userPreferences.get(), ...preferences });
  }
}

export const enhancedWorkbenchStore = new EnhancedWorkbenchStore();