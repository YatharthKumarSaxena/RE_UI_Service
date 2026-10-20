import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Database, 
  Layers, 
  PieChart, 
  RefreshCw, 
  Search, 
  AlertCircle,
  TrendingUp,
  Hash,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { api, ENTITY_TYPES } from '../api/client';

export default function DataInsights() {
  const [insights, setInsights] = useState(null);
  const [datasetRows, setDatasetRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeInput, setPageSizeInput] = useState('5');
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const handlePageJump = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPageInput('');
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getDatasetInsights();
      if (response && response.data) {
        setInsights(response.data);
      }
    } catch (err) {
      console.error('Failed to load dataset insights:', err);
      setError('Could not connect to /data-insight/dataset-insights. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataset = async () => {
    if (datasetRows.length > 0) return;
    setLoadingDataset(true);
    try {
      const response = await api.getDataset();
      if (response && response.data) {
        setDatasetRows(response.data);
      }
    } catch (err) {
      console.error('Failed to load dataset rows:', err);
    } finally {
      setLoadingDataset(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'raw_dataset') {
      fetchDataset();
    }
  };

  const filteredDataset = React.useMemo(() => {
    if (!datasetRows) return [];
    if (!searchQuery.trim()) return datasetRows;
    const q = searchQuery.toLowerCase();
    return datasetRows.filter((r) => 
      (r.projectTitle || '').toLowerCase().includes(q) ||
      (r.projectDescription || '').toLowerCase().includes(q) ||
      (r.projectGoal || '').toLowerCase().includes(q) ||
      (r.productVision || '').toLowerCase().includes(q) ||
      (r.entityTitle || '').toLowerCase().includes(q) ||
      (r.entityType || '').toLowerCase().includes(q)
    );
  }, [datasetRows, searchQuery]);

  const totalPages = Math.ceil(filteredDataset.length / pageSize) || 1;
  const paginatedDataset = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDataset.slice(start, start + pageSize);
  }, [filteredDataset, page, pageSize]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
                Data Insights · Training Analytics
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Endpoint: /data-insight/dataset-insights</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Data Insights</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Explore training-data distributions and summary metrics here. Sample and uploaded test files are managed separately in Dataset & Test Files.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleTabChange('insights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'insights'
                  ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Overview Insights
            </button>
            <button
              onClick={() => handleTabChange('raw_dataset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'raw_dataset'
                  ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Raw Dataset ({insights?.totalRecords || '...'})
            </button>
            <button
              onClick={fetchInsights}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
              title="Refresh Insights"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="glass-panel p-6 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/5 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading dataset insights from backend...</span>
        </div>
      ) : activeTab === 'insights' && insights ? (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Training Records</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{insights.totalRecords?.toLocaleString()}</div>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5 block font-semibold">High-quality labeled corpus</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Unique Projects</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{insights.uniqueProjects}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Across varied domains</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Avg Records / Project</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{insights.averageRecordsPerProject}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Well-distributed entities</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Classification Classes</span>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300 font-mono mt-1">{insights.totalEntityTypes}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Multi-class taxonomy</span>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entity Types Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Entity Types Distribution</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">6 Classes</span>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(insights.entityDistribution || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([typeKey, count]) => {
                    const percent = ((count / insights.totalRecords) * 100).toFixed(1);
                    const meta = ENTITY_TYPES[typeKey] || { label: typeKey };
                    return (
                      <div key={typeKey} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{meta.label}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {count} <span className="text-slate-400 dark:text-slate-600">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Project Types Distribution & Missing Fields */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Project Types Breakdown</span>
                </h3>
                <div className="space-y-3 pt-2">
                  {Object.entries(insights.projectTypeDistribution || {}).map(([pType, count]) => {
                    const percent = ((count / insights.totalRecords) * 100).toFixed(1);
                    return (
                      <div key={pType} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">{pType}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">{count} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-500 dark:bg-cyan-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Average Field Lengths */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Average Text Lengths (Characters)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {Object.entries(insights.averageFieldLengths || {}).slice(0, 6).map(([field, len]) => (
                    <div key={field} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block truncate font-mono">{field}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{len} chars</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Raw Dataset Table */
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 dark:bg-transparent">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, project context, type, or class..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-sm"
              />
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Rows per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Rows:</span>
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
                      setPage(1);
                    }
                  }}
                  onBlur={() => {
                    if (!pageSizeInput || Number(pageSizeInput) < 1 || !Number.isInteger(Number(pageSizeInput))) {
                      setPageSizeInput(String(pageSize));
                    }
                  }}
                  className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>

              <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                {filteredDataset.length.toLocaleString()} records
              </span>
            </div>
          </div>

          {loadingDataset ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin" />
              <span>Fetching full dataset from /data-insight/dataset...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/90 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-44">Project Title</th>
                    <th className="py-3 px-4 w-28">Type</th>
                    <th className="py-3 px-4 w-48">Entity Title</th>
                    <th className="py-3 px-4 min-w-[220px]">Entity Description</th>
                    <th className="py-3 px-4 w-36">Ground Truth EntityType</th>
                    <th className="py-3 px-4 w-24 text-right">More</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                  {paginatedDataset.map((row, idx) => {
                    const meta = ENTITY_TYPES[row.entityType] || { label: row.entityType, badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
                    const rowId = row.rowId ?? (page - 1) * pageSize + idx + 1;
                    const isExpanded = expandedRowId === String(rowId);
                    return (
                      <React.Fragment key={rowId}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 dark:text-slate-500">
                          {rowId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">{row.projectTitle}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {row.projectType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-teal-700 dark:text-teal-300">{row.entityTitle}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400" title={row.entityDescription || ''}>
                          <div className="line-clamp-3">{row.entityDescription || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.badgeClass}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={`project-context-${rowId}`}
                            onClick={() => setExpandedRowId(isExpanded ? null : String(rowId))}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-teal-500 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300 transition-colors"
                          >
                            {isExpanded ? 'Less' : 'More'}
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr id={`project-context-${rowId}`} className="bg-slate-50/80 dark:bg-slate-900/50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                              {[
                                ['Project Description', row.projectDescription],
                                ['Project Goal', row.projectGoal],
                                ['Product Vision', row.productVision],
                              ].map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/70 p-3">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</h4>
                                  <p className="mt-1.5 whitespace-normal text-xs leading-5 text-slate-700 dark:text-slate-300">{value || 'Not provided'}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Enhanced Pagination Controls Bar */}
              <div className="p-4 sm:p-5 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-transparent">
                <div>
                  Showing <span className="font-extrabold text-slate-900 dark:text-slate-100">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{Math.min(page * pageSize, filteredDataset.length)}</span> of{' '}
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{filteredDataset.length}</span> records
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
                      placeholder={String(page)}
                      className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition"
                    >
                      Go
                    </button>
                  </form>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      title="First Page"
                      className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      title="Previous Page"
                      className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 font-mono text-teal-800 dark:text-teal-300 font-extrabold bg-teal-50 dark:bg-teal-500/15 rounded-lg border border-teal-300 dark:border-teal-500/30">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      title="Next Page"
                      className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      title="Last Page"
                      className="p-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition shadow-sm"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
