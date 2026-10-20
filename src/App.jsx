import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Header from './components/Header';
import SingleClassifier from './components/SingleClassifier';
import BulkClassifier from './components/BulkClassifier';
import DatasetViewer from './components/DatasetViewer';
import DataInsights from './components/DataInsights';
import ModelEvaluation from './components/ModelEvaluation';
import LLMTranslator from './components/LLMTranslator';
import About from './components/About';
import DeviceSettingsModal from './components/DeviceSettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [singleClassifierData, setSingleClassifierData] = useState(null);
  const [bulkFileToRun, setBulkFileToRun] = useState(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('re_ai_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('re_ai_theme', theme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Callback from DatasetViewer to load row into SingleClassifier
  const handleLoadSingleRow = (row) => {
    setSingleClassifierData(row);
    setActiveTab('single');
  };

  // Callback from DatasetViewer to run file in BulkClassifier
  const handleRunBulkFile = (file) => {
    setBulkFileToRun(file);
    setActiveTab('bulk');
  };

  // Callback from LLMTranslator to load translated text into SingleClassifier
  const handleSendTranslated = (translatedData) => {
    setSingleClassifierData((prev) => ({
      ...prev,
      rawTitle: translatedData.entityTitle,
      rawDescription: translatedData.entityDescription,
    }));
    setActiveTab('single');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'single' && (
          <SingleClassifier initialData={singleClassifierData} />
        )}

        {activeTab === 'bulk' && (
          <BulkClassifier
            preselectedFile={bulkFileToRun}
            onNavigateToViewer={() => setActiveTab('viewer')}
          />
        )}

        {activeTab === 'viewer' && (
          <DatasetViewer
            onLoadSingleRow={handleLoadSingleRow}
            onRunBulkFile={handleRunBulkFile}
          />
        )}

        {activeTab === 'insights' && <DataInsights />}

        {activeTab === 'evaluation' && <ModelEvaluation />}

        {activeTab === 'llm' && (
          <LLMTranslator onSendToClassifier={handleSendTranslated} />
        )}

        {activeTab === 'about' && <About />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 py-6 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-400">RE AI Model Service Frontend</span>
            <span>&bull;</span>
            <span>Backend on Port 8083</span>
            <span>&bull;</span>
            <span className="capitalize font-mono text-[11px] text-teal-600 dark:text-teal-400">{theme} Mode Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[11px] text-slate-500">
              Sample File: /samples/sample_requirements.csv (40 rows)
            </span>
            <button
              onClick={() => setActiveTab('about')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200 transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              About this project
            </button>
          </div>
        </div>
      </footer>

      {/* Device Identity Modal */}
      <DeviceSettingsModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onUpdated={() => {}}
      />
    </div>
  );
}
