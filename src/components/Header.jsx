import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  FileSpreadsheet, 
  BarChart3, 
  CheckCircle2, 
  Languages, 
  Smartphone, 
  Laptop, 
  Tablet, 
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { getDeviceIdentity } from '../utils/deviceId';
import { api } from '../api/client';

export default function Header({ activeTab, setActiveTab, onOpenDeviceSettings, theme, toggleTheme }) {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceIdentity());
  const [serverOnline, setServerOnline] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const checkHealth = async () => {
    setIsPinging(true);
    const isUp = await api.checkBackendHealth();
    setServerOnline(isUp);
    setIsPinging(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'single', label: 'Single Classifier', icon: Cpu },
    { id: 'bulk', label: 'Bulk Classification', icon: Layers },
    { id: 'viewer', label: 'Dataset & Test Files', icon: FileSpreadsheet, badge: 'Sample Ready' },
    { id: 'insights', label: 'Data Insights', icon: BarChart3 },
    { id: 'evaluation', label: 'Model Evaluation', icon: CheckCircle2 },
    { id: 'llm', label: 'LLM Translator', icon: Languages },
  ];

  const getDeviceIcon = () => {
    if (deviceInfo.deviceType === 'mobile') return Smartphone;
    if (deviceInfo.deviceType === 'tablet') return Tablet;
    return Laptop;
  };
  const DeviceIcon = getDeviceIcon();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-40 transition-colors duration-200 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-3 sm:h-20 sm:py-0">
          {/* Logo & Title */}
          <div className="flex min-w-0 flex-1 items-center space-x-2.5 sm:flex-none sm:space-x-3.5">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-teal-500/20 sm:w-12 sm:h-12">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center transition-colors">
                <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center space-x-2.5">
                <span className="truncate font-extrabold text-sm tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  <span className="sm:hidden">RE AI Suite</span>
                  <span className="hidden sm:inline">RE AI Model Suite</span>
                </span>
                <span className="hidden shrink-0 text-xs font-mono px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-bold sm:inline">
                  v1.0 ML
                </span>
              </div>
              <p className="hidden text-xs sm:block sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Requirements Engineering Intelligence Platform
              </p>
            </div>
          </div>

          {/* Controls: Health, Device, Night/Day Theme Toggle */}
          <div className="flex shrink-0 items-center space-x-1.5 sm:space-x-3">
            {/* Backend Health Badge */}
            <button
              onClick={checkHealth}
              title="Click to re-check backend connection"
              aria-label={`Backend status: ${serverOnline === true ? 'online' : serverOnline === false ? 'offline' : 'connecting'}. Click to re-check.`}
              className="flex items-center space-x-2 rounded-xl bg-slate-100 px-2.5 py-2 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:px-3.5 sm:text-sm font-semibold transition shadow-sm hover:bg-slate-200"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${
                serverOnline === true 
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-400/80 animate-pulse' 
                  : serverOnline === false 
                    ? 'bg-rose-500 shadow-sm shadow-rose-500/80' 
                    : 'bg-amber-400'
              }`} />
              <span className="hidden text-slate-800 dark:text-slate-200 sm:inline">
                {serverOnline === true ? 'Backend: Online' : serverOnline === false ? 'Backend: Offline' : 'Connecting...'}
              </span>
              <RefreshCw className={`hidden w-3.5 h-3.5 text-slate-500 dark:text-slate-400 sm:block ${isPinging ? 'animate-spin' : ''}`} />
            </button>

            {/* Device Identity Button */}
            <button
              onClick={onOpenDeviceSettings}
              title="Device UUID & Headers Configuration"
              className="hidden items-center space-x-2 rounded-xl bg-teal-50 p-2 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 border border-teal-300 dark:border-teal-500/30 text-xs sm:flex sm:px-3.5 sm:py-2 sm:text-sm text-teal-800 dark:text-teal-300 font-mono font-bold transition shadow-sm hover:bg-teal-100"
            >
              <DeviceIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="hidden truncate max-w-[120px] sm:inline" title={deviceInfo.uuid}>
                {deviceInfo.uuid.slice(0, 8)}...
              </span>
            </button>

            {/* Night / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 p-2.5 text-slate-800 shadow-sm transition active:scale-95 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-300 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-slate-800 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" className="border-t border-slate-200 py-2 dark:border-slate-800 sm:py-2.5">
          <label className="sr-only" htmlFor="mobile-main-navigation">Go to section</label>
          <select
            id="mobile-main-navigation"
            aria-label="Go to section"
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:hidden"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
            <option value="about">About</option>
          </select>
          <div className="hidden gap-2 sm:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <React.Fragment key={item.id}>
                  {item.id === 'insights' && (
                    <span
                      aria-hidden="true"
                      className="mx-1 h-8 shrink-0 border-l border-slate-300 dark:border-slate-700"
                    />
                  )}
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex shrink-0 items-center space-x-2.5 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 shadow-md shadow-teal-500/25 ring-2 ring-teal-600/30 dark:ring-teal-400/40'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-950 stroke-[2.5]' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/30 dark:bg-slate-900/30 text-white dark:text-slate-900'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-300 dark:border-teal-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
