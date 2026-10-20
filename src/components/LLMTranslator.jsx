import React, { useState } from 'react';
import { 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight,
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';
import { api } from '../api/client';

export default function LLMTranslator({ onSendToClassifier }) {
  const [rawTitle, setRawTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleInputs = [
    {
      title: 'उपयोगकर्ता प्रमाणीकरण प्रणाली',
      desc: 'सिस्टम को उपयोगकर्ताओं को उनके खाते में लॉगिन करने से पहले पासवर्ड और ओटीपी सत्यापित करना चाहिए।',
      label: 'Default Hindi Requirement',
    },
    {
      title: 'Sistema de pago seguro',
      desc: 'Los usuarios deben poder pagar con tarjeta de crédito y recibir confirmación inmediata.',
      label: 'Spanish Requirement',
    },
    {
      title: 'banana keyboard elephant moon chair',
      desc: 'quick brown fox jumps 123456 lorem',
      label: 'Gibberish / Noise Test',
    },
  ];

  const handleRunDefaultTest = async (sample = sampleInputs[0]) => {
    setRawTitle(sample.title);
    setRawDescription(sample.desc);
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await api.convertContentToEnglish(sample.title, sample.desc);
      if (response && response.data) {
        setResult(response.data);
      }
    } catch (err) {
      console.error('LLM translation error:', err);
      setError(err.message || 'Translation failed. Ensure Groq API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!rawTitle.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.convertContentToEnglish(rawTitle, rawDescription);
      if (response && response.data) {
        setResult(response.data);
      }
    } catch (err) {
      console.error('LLM translation error:', err);
      setError(err.message || 'Translation failed. Ensure Groq API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const text = `Title: ${result.title}\nDescription: ${result.description || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="px-3 py-1 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            LLM Service (GPT / Groq)
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            Endpoint: /llm/convert-content-to-english
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
          Multi-lingual Requirement Normalizer
        </h1>
        <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
          Converts informal, non-English, or multilingual requirement statements into standardized English technical specifications, with automatic clarity and ambiguity checking.
        </p>

        {/* Quick Sample Chips & 1-Click Default Actions */}
        <div className="mt-5 space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleRunDefaultTest(sampleInputs[0])}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-teal-500/20 active:scale-95 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ 1-Click Test (Default Hindi Requirement)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRawTitle(sampleInputs[0].title);
                setRawDescription(sampleInputs[0].desc);
                setResult(null);
                setError(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition shadow-sm"
            >
              Autofill Form
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">More Pre-loaded Presets:</span>
            {sampleInputs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setRawTitle(sample.title);
                  setRawDescription(sample.desc);
                  setResult(null);
                  setError(null);
                }}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-teal-800 dark:text-teal-300 transition shadow-sm"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <Languages className="w-5 h-5 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
              <span>Raw Requirement Input</span>
            </h2>

            <button
              type="button"
              onClick={() => {
                setRawTitle(sampleInputs[0].title);
                setRawDescription(sampleInputs[0].desc);
              }}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              Fill Default
            </button>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Raw Title (any language or format) *
              </label>
              <input
                type="text"
                required
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                placeholder="e.g. उपयोगकर्ता प्रमाणीकरण प्रणाली or login feature"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Raw Description (optional)
              </label>
              <textarea
                rows={4}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Detailed raw description, notes, or foreign language text..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 transition shadow-sm"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || !rawTitle.trim()}
                className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2.5 active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Translating with Groq / GPT...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Normalize & Convert</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRunDefaultTest(sampleInputs[0])}
                disabled={loading}
                className="py-3.5 px-4 rounded-xl border-2 border-teal-500/50 hover:border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 font-extrabold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-sm whitespace-nowrap active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ Test Default</span>
              </button>
            </div>
          </form>
        </div>

        {/* Translation Output */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>Normalized Output</span>
              </h2>
              {result && (
                <button
                  onClick={handleCopyResult}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center space-x-1.5 border border-slate-300 dark:border-slate-700 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4 mt-5">
                {/* Clarification Alert */}
                {result.need_clarification ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-extrabold block text-base">Need Clarification Flagged</span>
                      <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200/90 mt-1 font-medium">
                        The AI determined that the provided requirement text is ambiguous, vague, or nonsensical. Please refine before classification.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center space-x-2.5 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Clear and Meaningful Requirement Verified</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                      Normalized English Title:
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 shadow-sm">
                      {result.title}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                      Normalized English Description:
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed mt-1 shadow-sm">
                      {result.description || <span className="italic text-slate-400 dark:text-slate-600">No description provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-500">
                <Languages className="w-14 h-14 mb-3 opacity-30 text-slate-400" />
                <span className="text-sm font-semibold">Normalized translation will appear here</span>
              </div>
            )}
          </div>

          {result && onSendToClassifier && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onSendToClassifier({ entityTitle: result.title, entityDescription: result.description })}
                className="w-full py-3 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-500/30 text-sm font-bold flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <span>Send to Single Classifier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
