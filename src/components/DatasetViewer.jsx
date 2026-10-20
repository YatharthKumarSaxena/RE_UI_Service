import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Play, 
  ArrowRight, 
  Filter, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Zap,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TEST_THROUGH_FILES, exportToCsvString } from '../data/testFiles';

export default function DatasetViewer({ onLoadSingleRow, onRunBulkFile }) {
  const [selectedSuiteId, setSelectedSuiteId] = useState('sample_full_40');
  const [customFileRows, setCustomFileRows] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [expandedRows, setExpandedRows] = useState({});
  const [copied, setCopied] = useState(false);
  
  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeInput, setPageSizeInput] = useState('5');
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Active dataset rows
  const activeSuite = TEST_THROUGH_FILES.find((f) => f.id === selectedSuiteId);
  const rawRows = customFileRows || activeSuite?.data || [];
  const currentFileName = customFileName || activeSuite?.fileName || 'sample_requirements.csv';

  // Required columns in backend IMPORT_ENTITY_TYPE
  const REQUIRED_COLUMNS = [
    'rowId',
    'projectTitle',
    'projectDescription',
    'problemStatement',
    'projectGoal',
    'projectType',
    'entityTitle'
  ];

  // Check column compliance
  const firstRow = rawRows[0] || {};
  const presentColumns = Object.keys(firstRow);
  const missingColumns = REQUIRED_COLUMNS.filter(col => !presentColumns.includes(col));
  const isSchemaValid = missingColumns.length === 0;

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const matchesType = typeFilter === 'ALL' || (row.projectType || '').toLowerCase() === typeFilter.toLowerCase();
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (row.projectTitle || '').toLowerCase().includes(q) ||
        (row.entityTitle || '').toLowerCase().includes(q) ||
        (row.projectDescription || '').toLowerCase().includes(q) ||
        (row.problemStatement || '').toLowerCase().includes(q) ||
        (row.entityDescription || '').toLowerCase().includes(q)
      );
    });
  }, [rawRows, searchQuery, typeFilter]);

  // Paginated rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Handle custom file upload for inspection
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCustomFileRows(results.data);
        setSelectedSuiteId('custom');
        setCurrentPage(1);
      },
      error: (err) => {
        alert('Failed to parse file: ' + err.message);
      }
    });
  };

  const handleDownloadCsv = () => {
    const csvContent = customFileRows ? exportToCsvString(customFileRows) : (activeSuite?.rawCsv || '');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', currentFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCsv = () => {
    const csvContent = customFileRows ? exportToCsvString(customFileRows) : (activeSuite?.rawCsv || '');
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchBulkTest = () => {
    const csvContent = customFileRows ? exportToCsvString(customFileRows) : (activeSuite?.rawCsv || '');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], currentFileName, { type: 'text/csv' });
    if (onRunBulkFile) {
      onRunBulkFile(file, activeSuite?.title || currentFileName);
    }
  };

  const handleResetToDefaultSuite = () => {
    setSelectedSuiteId('sample_full_40');
    setCustomFileRows(null);
    setCustomFileName('');
    setSearchQuery('');
    setTypeFilter('ALL');
    setCurrentPage(1);
  };

  const handlePageJump = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
      setJumpPageInput('');
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                Dataset & Test Files
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Sample suites, uploads, and file inspection
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Requirements Dataset Workspace
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Choose or upload a test file, inspect its records, and run classification tests. Training analytics are available separately under Data Insights.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLaunchBulkTest}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>1-Click Test Bulk File</span>
            </button>
            <button
              onClick={handleResetToDefaultSuite}
              className="flex items-center space-x-1.5 px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
              title="Reset view to default 40-row sample file"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Default 40-Row File</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center space-x-2 px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleCopyCsv}
              className="flex items-center space-x-2 px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Test Preset Selectors */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-300 mb-3.5 flex items-center justify-between">
            <span>PRE-LOADED TEST-THROUGH-FILES:</span>
            <label className="cursor-pointer text-teal-700 dark:text-teal-400 hover:underline text-xs sm:text-sm flex items-center space-x-1.5 font-mono font-bold">
              <Upload className="w-4 h-4" />
              <span>Upload Custom Bulk File to View</span>
              <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEST_THROUGH_FILES.map((suite) => {
              const isSelected = selectedSuiteId === suite.id && !customFileRows;
              return (
                <div
                  key={suite.id}
                  onClick={() => {
                    setSelectedSuiteId(suite.id);
                    setCustomFileRows(null);
                    setCustomFileName('');
                    setCurrentPage(1);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition text-left relative ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{suite.title}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-slate-300 dark:border-slate-700">
                      {suite.rowCount} rows
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{suite.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                    <span className="truncate">{suite.location}</span>
                  </div>
                </div>
              );
            })}

            {customFileRows && (
              <div
                className="p-4 rounded-2xl border-2 bg-teal-50 dark:bg-teal-500/15 border-teal-500 text-left relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-teal-900 dark:text-teal-200 truncate">Custom Uploaded File</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-900 dark:text-teal-200">
                    {customFileRows.length} rows
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{customFileName}</p>
                <button
                  onClick={handleResetToDefaultSuite}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline mt-2 inline-block font-bold"
                >
                  Remove Custom File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Schema Compliance & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
            <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Rows in File</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{rawRows.length}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <Tag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unique Projects</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {new Set(rawRows.map(r => r.projectTitle)).size}
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {isSchemaValid ? <CheckCircle2 className="w-6 h-6 stroke-[2.2]" /> : <AlertCircle className="w-6 h-6 text-rose-500 stroke-[2.2]" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Header Compliance</div>
            <div className={`text-base font-black ${isSchemaValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
              {isSchemaValid ? '100% Backend Match' : `${missingColumns.length} Missing Headers`}
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
            <FileText className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filtered Records</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">{filteredRows.length}</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-transparent">
          <div className="relative w-full lg:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in projects, entities, descriptions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between w-full lg:w-auto gap-3">
            {/* Project Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Type:</span>
              {['ALL', 'development', 'enhancement', 'maintenance'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition ${
                    typeFilter === type
                      ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
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
                className="w-20 px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Interactive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-900/90 text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200 font-extrabold border-b-2 border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4 w-52">Project Title</th>
                <th className="py-4 px-4 w-32">Type</th>
                <th className="py-4 px-4 w-60">Entity Title</th>
                <th className="py-4 px-4 min-w-[320px]">Entity Description & Details</th>
                <th className="py-4 px-4 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 text-base font-semibold">
                    No matching requirements found in this dataset.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isExpanded = expandedRows[row.rowId];
                  return (
                    <React.Fragment key={row.rowId}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="py-4 px-4 text-center font-mono text-slate-500 dark:text-slate-400 font-bold">
                          {row.rowId}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {row.projectTitle}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase font-extrabold ${
                            row.projectType === 'development'
                              ? 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                              : row.projectType === 'enhancement'
                                ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                                : 'bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                          }`}>
                            {row.projectType || 'unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-teal-800 dark:text-teal-300">
                          {row.entityTitle}
                        </td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          <div className={isExpanded ? '' : 'line-clamp-2'}>
                            {row.entityDescription || <span className="italic text-slate-400 dark:text-slate-600">No entity description provided</span>}
                          </div>
                          {row.problemStatement && (
                            <button
                              onClick={() => toggleRow(row.rowId)}
                              className="mt-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center space-x-1"
                            >
                              <span>{isExpanded ? 'Hide context' : 'Show problem statement & goal'}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => onLoadSingleRow(row)}
                            title="Load this row into the Single Entity Classifier form"
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-500/30 text-xs sm:text-sm font-bold transition shadow-sm active:scale-95"
                          >
                            <span>Load to Test</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View for Full Context */}
                      {isExpanded && (
                        <tr className="bg-slate-50 dark:bg-slate-900/90">
                          <td colSpan={6} className="px-7 py-5 border-l-4 border-teal-500 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Problem Statement</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">{row.problemStatement || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Project Goal</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">{row.projectGoal || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Project Description</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">{row.projectDescription || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs uppercase font-extrabold text-slate-500 dark:text-slate-400 block">Product Vision</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-1 leading-relaxed">{row.productVision || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination Controls Bar */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-transparent">
          <div>
            Showing <span className="font-extrabold text-slate-900 dark:text-slate-100">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{Math.min(currentPage * pageSize, filteredRows.length)}</span> of{' '}
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{filteredRows.length}</span> entries
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
  );
}
