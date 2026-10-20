import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Layers, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Search, 
  Sparkles,
  BarChart2,
  Eye,
  Zap,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api, AVAILABLE_MODELS, ENTITY_TYPES } from '../api/client';
import { TEST_THROUGH_FILES, exportToCsvString } from '../data/testFiles';

export default function BulkClassifier({ preselectedFile, onNavigateToViewer }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [selectedModel, setSelectedModel] = useState('linear_svm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filterClass, setFilterClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeInput, setPageSizeInput] = useState('5');
  const [jumpPageInput, setJumpPageInput] = useState('');

  // If a preselected file is passed from DatasetViewer, set it
  useEffect(() => {
    if (preselectedFile) {
      setFile(preselectedFile);
      setFileName(preselectedFile.name);
    }
  }, [preselectedFile]);

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv') && !droppedFile.name.endsWith('.xlsx')) {
        setError('Only .csv and .xlsx files are supported.');
        return;
      }
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setError(null);
    }
  };

  // 1-Click Load Sample Test File
  const handleLoadSampleSuite = () => {
    const sample = TEST_THROUGH_FILES[0];
    const blob = new Blob([sample.rawCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], sample.fileName, { type: 'text/csv' });
    setFile(sampleFile);
    setFileName(sampleFile.name);
    setError(null);
  };

  // 1-Click Run Test with Default Sample Dataset Immediately
  const handleInstantDefaultTest = async () => {
    const sample = TEST_THROUGH_FILES[0];
    const blob = new Blob([sample.rawCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], sample.fileName, { type: 'text/csv' });
    setFile(sampleFile);
    setFileName(sampleFile.name);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.classifyBulkEntity(sampleFile, selectedModel);
      if (response && response.data) {
        setResults(response.data);
      } else {
        throw new Error('Invalid response structure from backend.');
      }
    } catch (err) {
      console.error('Bulk classification error:', err);
      setError(err.message || 'Failed to process bulk classification. Ensure backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Bulk Classification on current file
  const handleRunClassification = async () => {
    if (!file) {
      setError('Please select or load a CSV/XLSX file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.classifyBulkEntity(file, selectedModel);
      if (response && response.data) {
        setResults(response.data);
      } else {
        throw new Error('Invalid response structure from backend.');
      }
    } catch (err) {
      console.error('Bulk classification error:', err);
      setError(err.message || 'Failed to process bulk classification. Ensure backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate Distribution of Results
  const distribution = React.useMemo(() => {
    if (!results || !results.rows) return {};
    const counts = {};
    results.rows.forEach((row) => {
      const pred = row.modelOutput?.prediction || (row.isValid ? 'UNKNOWN' : 'INVALID_ROW');
      counts[pred] = (counts[pred] || 0) + 1;
    });
    return counts;
  }, [results]);

  // Filtered Rows
  const filteredRows = React.useMemo(() => {
    if (!results || !results.rows) return [];
    return results.rows.filter((row) => {
      const pred = row.modelOutput?.prediction;
      if (filterClass !== 'ALL') {
        if (filterClass === 'INVALID' && row.isValid) return false;
        if (filterClass !== 'INVALID' && pred !== filterClass) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (row.projectTitle || '').toLowerCase().includes(q) ||
        (row.entityTitle || '').toLowerCase().includes(q) ||
        (row.invalidReason || '').toLowerCase().includes(q) ||
        (pred || '').toLowerCase().includes(q)
      );
    });
  }, [results, filterClass, searchQuery]);

  // Paginated Rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handlePageJump = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
      setJumpPageInput('');
    }
  };

  // Export Results
  const handleExportResults = () => {
    if (!results || !results.rows) return;
    const flatRows = results.rows.map((r) => ({
      rowId: r.rowId,
      projectTitle: r.projectTitle,
      projectType: r.projectType,
      entityTitle: r.entityTitle,
      isValid: r.isValid,
      invalidReason: r.invalidReason,
      classifiedEntityType: r.modelOutput?.prediction || 'N/A',
      confidenceScore: r.modelOutput?.score || 'N/A',
      scoreType: r.modelOutput?.score_type || 'N/A',
    }));

    const csvStr = exportToCsvString(flatRows);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classified_${fileName || 'results.csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Upload & Model Configuration Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold uppercase tracking-wider border border-teal-500/30">
                Batch ML Pipeline
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Endpoint: /classification/classify-bulk-entity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Bulk Entity Classification Engine
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Upload requirement spreadsheets (.csv or .xlsx) and execute multi-model entity classification in parallel.
            </p>
          </div>

          {/* Quick 1-Click Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleInstantDefaultTest}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>1-Click Test Default File</span>
            </button>

            <button
              onClick={handleLoadSampleSuite}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-500/30 text-sm font-bold transition shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Load 40-Row Sample</span>
            </button>

            <button
              onClick={onNavigateToViewer}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
            >
              <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Inspect Files</span>
            </button>
          </div>
        </div>

        {/* Upload Zone & Config Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Dropzone */}
          <div className="lg:col-span-2">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-2xl p-9 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                file
                  ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <input
                type="file"
                id="bulk-file-input"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="bulk-file-input" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center mb-3.5 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                  <UploadCloud className="w-8 h-8" />
                </div>
                {file ? (
                  <div>
                    <span className="text-base font-extrabold text-teal-800 dark:text-teal-300 flex items-center justify-center space-x-2">
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>{fileName}</span>
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      Drop your Requirements CSV or XLSX file here
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      Max file size: 20MB &bull; Supports .csv, .xlsx spreadsheets
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Model Selection & Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Select Classification Model:</span>
                <span className="text-xs text-teal-700 dark:text-teal-400 font-mono font-bold">10 ML Models</span>
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 shadow-sm"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isDefault ? '⭐' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.desc}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRunClassification}
              disabled={!file || isProcessing}
              className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-teal-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2.5 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing with {selectedModel}...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Execute Bulk Classification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Rows Processed</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">{results.totalRows}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Model: {selectedModel}</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between uppercase tracking-wider">
                <span>Valid Rows</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300 font-mono mt-1">{results.validRows}</div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {((results.validRows / results.totalRows) * 100).toFixed(1)}% Success Rate
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-2 border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center justify-between uppercase tracking-wider">
                <span>Invalid / Error Rows</span>
                <XCircle className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-rose-900 dark:text-rose-300 font-mono mt-1">{results.invalidRows}</div>
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                {results.invalidRows > 0 ? 'Malformed or missing required fields' : 'None detected'}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Export Results</div>
              <button
                onClick={handleExportResults}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-500/30 text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition mt-2 shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export Classified CSV</span>
              </button>
            </div>
          </div>

          {/* Classification Distribution Badges */}
          <div className="glass-panel rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-800">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Classification Breakdown</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => { setFilterClass('ALL'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  filterClass === 'ALL'
                    ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-black shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-2 border-slate-300 dark:border-slate-800'
                }`}
              >
                All Rows ({results.totalRows})
              </button>

              {Object.keys(ENTITY_TYPES).map((typeKey) => {
                const count = distribution[typeKey] || 0;
                const meta = ENTITY_TYPES[typeKey];
                const isActive = filterClass === typeKey;
                return (
                  <button
                    key={typeKey}
                    onClick={() => { setFilterClass(typeKey); setCurrentPage(1); }}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition flex items-center space-x-2 ${
                      isActive
                        ? meta.badgeClass + ' font-black ring-2 ring-teal-500/50 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span>{meta.label}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-extrabold">
                      {count}
                    </span>
                  </button>
                );
              })}

              {results.invalidRows > 0 && (
                <button
                  onClick={() => { setFilterClass('INVALID'); setCurrentPage(1); }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition flex items-center space-x-2 ${
                    filterClass === 'INVALID'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-300 border-rose-500 font-black'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span>Invalid Entries</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-950 text-rose-900 dark:text-rose-300 font-extrabold">
                    {results.invalidRows}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-transparent">
              <div className="relative w-full lg:w-96">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter results by keyword..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>

              <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Rows / Page:</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pageSizeInput}
                  aria-label="Rows per page"
                  onChange={(e) => {
                    const value = e.target.value;
                    setPageSizeInput(value);
                    const parsed = Number(value);
                    if (Number.isInteger(parsed) && parsed > 0) {
                      setPageSize(parsed);
                      setCurrentPage(1);
                    }
                  }}
                  onBlur={() => {
                    if (!pageSizeInput || Number(pageSizeInput) < 1 || !Number.isInteger(Number(pageSizeInput))) {
                      setPageSizeInput(String(pageSize));
                    }
                  }}
                  className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500 shadow-sm"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  Total: {filteredRows.length} rows
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-100 dark:bg-slate-900/90 text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-extrabold border-b-2 border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-4 w-12 text-center">#</th>
                    <th className="py-4 px-4 w-52">Project Title</th>
                    <th className="py-4 px-4 w-52">Entity Title</th>
                    <th className="py-4 px-4 w-48">Predicted Category</th>
                    <th className="py-4 px-4 w-32">Score</th>
                    <th className="py-4 px-4 min-w-[220px]">Validation Status / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-500 text-base font-semibold">
                        No rows matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => {
                      const pred = row.modelOutput?.prediction;
                      const typeMeta = ENTITY_TYPES[pred] || {
                        label: pred || 'Unknown',
                        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
                      };
                      const score = row.modelOutput?.score;
                      const scoreType = row.modelOutput?.score_type;

                      return (
                        <tr key={row.rowId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                          <td className="py-4 px-4 text-center font-mono text-slate-500 dark:text-slate-400 font-bold">
                            {row.rowId}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                            {row.projectTitle}
                          </td>
                          <td className="py-4 px-4 text-slate-900 dark:text-slate-200 font-semibold">
                            {row.entityTitle}
                          </td>
                          <td className="py-4 px-4">
                            {row.isValid && pred ? (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-black ${typeMeta.badgeClass}`}>
                                {typeMeta.label}
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-500/30">
                                Invalid Entry
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs sm:text-sm">
                            {score !== undefined && score !== null ? (
                              <div className="flex flex-col">
                                <span className="font-extrabold text-teal-800 dark:text-teal-300">
                                  {typeof score === 'number' ? score.toFixed(4) : score}
                                </span>
                                <span className="text-xs text-slate-500 capitalize font-medium">{scoreType}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 font-medium">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-700 dark:text-slate-400 font-medium">
                            {row.isValid ? (
                              <span className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-center space-x-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Passed Validation</span>
                              </span>
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 text-xs sm:text-sm flex items-center space-x-1.5 font-bold" title={row.invalidReason}>
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span className="line-clamp-1">{row.invalidReason}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Table Pagination Bar */}
            <div className="p-4 sm:p-5 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-transparent">
              <div>
                Showing <span className="font-extrabold text-slate-900 dark:text-slate-100">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{Math.min(currentPage * pageSize, filteredRows.length)}</span> of{' '}
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{filteredRows.length}</span> rows
              </div>

              {/* Jump to Page + Navigation Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handlePageJump} className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Go to page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    placeholder={String(currentPage)}
                    className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition"
                  >
                    Go
                  </button>
                </form>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    title="First Page"
                    className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous Page"
                    className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 font-mono text-teal-800 dark:text-teal-300 font-extrabold bg-teal-50 dark:bg-teal-500/15 rounded-lg border border-teal-300 dark:border-teal-500/30">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Next Page"
                    className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Last Page"
                    className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
