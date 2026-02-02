// Aura Board - Main Application Component
import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PageNavigator } from './components/PageNavigator';
import { useSettingsStore } from './store';
import { useKeyboardShortcuts } from './hooks';
import './styles/globals.css';

function App() {
  const { theme, locale } = useSettingsStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Apply theme and locale to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
  }, [theme, locale]);

  return (
    <div className="app">
      <Toolbar />
      <main className="main-content">
        <Canvas />
      </main>
      <PageNavigator />
    </div>
  );
}

export default App;


