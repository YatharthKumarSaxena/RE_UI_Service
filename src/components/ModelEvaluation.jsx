import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  AlertCircle, 
  Cpu, 
  Award 
} from 'lucide-react';
import { api } from '../api/client';

export default function ModelEvaluation() {
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileKey, setSelectedFileKey] = useState('model_comparison_results');
  const [error, setError] = useState(null);

  const fetchEvaluation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getModelEvaluation();
      if (response && response.data) {
        setEvalData(response.data);
        const keys = Object.keys(response.data);
        if (keys.length > 0 && !response.data[selectedFileKey]) {
          setSelectedFileKey(keys[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load model evaluation:', err);
      setError('Could not connect to /evaluation/model-evaluation. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const activeRows = evalData?.[selectedFileKey] || [];
  const columns = activeRows[0] ? Object.keys(activeRows[0]) : [];
  const modelColumn = columns.find((column) => column.toLowerCase().includes('model'));
  const orderedColumns = modelColumn
    ? [modelColumn, ...columns.filter((column) => column !== modelColumn)]
    : columns;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold uppercase tracking-wider border border-teal-500/30">
                ML Performance Benchmarks
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Endpoint: /evaluation/model-evaluation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Classification Model Benchmarks & Comparison</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Cross-model evaluation across Linear SVM, SGD, Random Forest, Naive Bayes, and Ridge Classifiers.
            </p>
          </div>

          <button
            onClick={fetchEvaluation}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Benchmarks</span>
          </button>
        </div>

        {/* Benchmark Dataset Selector */}
        {evalData && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            {Object.keys(evalData).map((key) => {
              const isSelected = selectedFileKey === key;
              const title = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFileKey(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-bold shadow-md shadow-teal-500/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {title} ({evalData[key].length})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error ? (
        <div className="glass-panel p-6 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading evaluation benchmarks...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Performer Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-teal-200 dark:border-teal-500/30 bg-teal-50/50 dark:bg-teal-500/5">
              <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Primary Production Model</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Linear Support Vector Machine</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Highest cross-validation accuracy and fastest inference latency on TF-IDF word vectors.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Active Model Count</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{activeRows.length} Tested</div>
              <p className="text-xs text-slate-500 mt-1">Comparing linear, probabilistic, and tree-based ensembles.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Default Taxonomy</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">6 Classes</div>
              <p className="text-xs text-slate-500 mt-1">Requirement, Scope, Constraint, Feature, Interface, Irrelevant.</p>
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                {selectedFileKey.replace(/_/g, ' ')}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeRows.length} model entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/90 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {orderedColumns.map((col) => (
                      <th key={col} className="py-3 px-4">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                  {activeRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      {orderedColumns.map((col) => {
                        const val = row[col];
                        const isScore = !isNaN(parseFloat(val)) && parseFloat(val) <= 1 && parseFloat(val) >= 0;
                        const isModelCol = col.toLowerCase().includes('model');
                        return (
                          <td key={col} className="py-3.5 px-4 font-mono">
                            {isModelCol ? (
                              <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">{val}</span>
                            ) : isScore ? (
                              <span className="text-teal-700 dark:text-teal-300 font-bold">
                                {(parseFloat(val) * 100).toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
