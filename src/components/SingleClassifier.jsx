import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Languages,
  Zap,
  Dices
} from 'lucide-react';
import { api, AVAILABLE_MODELS, ENTITY_TYPES } from '../api/client';
import { PARSED_SAMPLE_DATA } from '../data/testFiles';

const DEFAULT_SAMPLE_VALUES = {
  projectTitle: 'Digital Payment Platform',
  projectDescription: 'A comprehensive platform for processing, monitoring, and validating digital payments across multiple banking rails.',
  problemStatement: 'Businesses require a reliable, secure mechanism for processing customer payments through multiple channels with instant settlement.',
  projectGoal: 'Provide secure, fault-tolerant, and sub-second digital payment processing with fraud controls.',
  projectType: 'development',
  productVision: 'Empower businesses worldwide with frictionless, instant financial transaction infrastructure.',
  rawTitle: 'Account Access Control',
  rawDescription: 'Users should be strictly prevented from accessing another customer account even when they know the account identifier or public token.',
};

export default function SingleClassifier({ initialData }) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    problemStatement: '',
    projectGoal: '',
    projectType: 'development',
    productVision: '',
    rawTitle: '',
    rawDescription: '',
  });

  const [selectedModel, setSelectedModel] = useState('linear_svm');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // If initialData is loaded from DatasetViewer
  useEffect(() => {
    if (initialData) {
      setFormData({
        projectTitle: initialData.projectTitle || '',
        projectDescription: initialData.projectDescription || '',
        problemStatement: initialData.problemStatement || '',
        projectGoal: initialData.projectGoal || '',
        projectType: initialData.projectType || 'development',
        productVision: initialData.productVision || '',
        rawTitle: initialData.entityTitle || initialData.rawTitle || '',
        rawDescription: initialData.entityDescription || initialData.rawDescription || '',
      });
      setResult(null);
      setError(null);
    }
  }, [initialData]);

  // Load standard default test values
  const handleFillDefaultValues = () => {
    setFormData(DEFAULT_SAMPLE_VALUES);
    setResult(null);
    setError(null);
  };

  // Pick a random row from the 40 sample rows
  const handleRandomizeSample = () => {
    const randomIndex = Math.floor(Math.random() * PARSED_SAMPLE_DATA.length);
    handleLoadPreset(randomIndex);
  };

  // Load a preset by index
  const handleLoadPreset = (index) => {
    const row = PARSED_SAMPLE_DATA[index];
    if (row) {
      setFormData({
        projectTitle: row.projectTitle || '',
        projectDescription: row.projectDescription || '',
        problemStatement: row.problemStatement || '',
        projectGoal: row.projectGoal || '',
        projectType: row.projectType || 'development',
        productVision: row.productVision || '',
        rawTitle: row.entityTitle || '',
        rawDescription: row.entityDescription || '',
      });
      setResult(null);
      setError(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      projectTitle: '',
      projectDescription: '',
      problemStatement: '',
      projectGoal: '',
      projectType: 'development',
      productVision: '',
      rawTitle: '',
      rawDescription: '',
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.classifyEntity(formData, selectedModel);
      if (response && response.data) {
        setResult(response.data);
      } else {
        throw new Error('Invalid response structure received from backend.');
      }
    } catch (err) {
      console.error('Single classification error:', err);
      setError(err.message || 'Classification request failed. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click: Fill default values & immediately classify
  const handleFillAndClassifyNow = async () => {
    setFormData(DEFAULT_SAMPLE_VALUES);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.classifyEntity(DEFAULT_SAMPLE_VALUES, selectedModel);
      if (response && response.data) {
        setResult(response.data);
      } else {
        throw new Error('Invalid response structure received from backend.');
      }
    } catch (err) {
      console.error('Single classification error:', err);
      setError(err.message || 'Classification request failed. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold uppercase tracking-wider border border-teal-500/30">
                Single Entity Classifier
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Endpoint: /classification/classify-entity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Requirements Entity Categorizer
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Classify individual software requirements into Requirement, Feature, Constraint, Scope, External Interface, or Invalid.
            </p>
          </div>

          {/* Quick Default Test Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleFillAndClassifyNow}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-md shadow-teal-500/20 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>1-Click Test (Default Values)</span>
            </button>

            <button
              type="button"
              onClick={handleFillDefaultValues}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
              title="Autofill form with default values"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Autofill Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleRandomizeSample}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 text-sm font-bold transition shadow-sm"
              title="Random row from 40 sample suite"
            >
              <Dices className="w-4 h-4 text-purple-500" />
              <span>Random Preset</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Or Select Preset From File:</span>
            <select
              onChange={(e) => handleLoadPreset(Number(e.target.value))}
              defaultValue=""
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-teal-800 dark:text-teal-300 focus:outline-none focus:border-teal-500 shadow-sm"
            >
              <option value="" disabled>Choose a sample from file...</option>
              <option value="0">#1 Digital Payment (Account Access)</option>
              <option value="1">#2 Food Delivery (Password Expiry)</option>
              <option value="2">#3 Travel Booking (3rd Party Identity)</option>
              <option value="3">#4 Legal Case Mgmt (Monthly Dashboard)</option>
              <option value="4">#5 Public Transit (Browser Boundary)</option>
              <option value="16">#17 Agriculture (Purple Banana Edge Case)</option>
              <option value="23">#24 Digital Wallet (Account Recovery)</option>
              <option value="30">#31 Pharmacy (Invalid Banana)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Reset Form"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Form</span>
          </button>
        </div>

        {/* Classification Form & Realtime Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {/* Project Context Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                1. Project Context Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Project Title *</label>
                    <span className="text-xs text-slate-500 font-mono font-semibold">3-150 chars</span>
                  </div>
                  <input
                    type="text"
                    name="projectTitle"
                    required
                    value={formData.projectTitle}
                    onChange={handleChange}
                    placeholder="e.g. Digital Payment Platform"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">Project Type *</label>
                  <select
                    name="projectType"
                    required
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 shadow-sm capitalize"
                  >
                    <option value="development">development</option>
                    <option value="enhancement">enhancement</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Project Description *</label>
                  <span className="text-xs text-slate-500 font-mono font-semibold">10-2000 chars ({formData.projectDescription.length})</span>
                </div>
                <textarea
                  name="projectDescription"
                  required
                  rows={2}
                  value={formData.projectDescription}
                  onChange={handleChange}
                  placeholder="Comprehensive description of the software project..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Problem Statement *</label>
                    <span className="text-xs text-slate-500 font-mono font-semibold">10-2000 chars</span>
                  </div>
                  <textarea
                    name="problemStatement"
                    required
                    rows={2}
                    value={formData.problemStatement}
                    onChange={handleChange}
                    placeholder="What core business problem does this solve?"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Project Goal *</label>
                    <span className="text-xs text-slate-500 font-mono font-semibold">10-1000 chars</span>
                  </div>
                  <textarea
                    name="projectGoal"
                    required
                    rows={2}
                    value={formData.projectGoal}
                    onChange={handleChange}
                    placeholder="Key strategic objective..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Vision (Optional)</label>
                  <span className="text-xs text-slate-500 font-mono font-semibold">20-5000 chars if provided</span>
                </div>
                <input
                  type="text"
                  name="productVision"
                  value={formData.productVision}
                  onChange={handleChange}
                  placeholder="Long-term inspirational product vision..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            {/* Entity Under Test Box */}
            <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-slate-900/60 border-2 border-teal-300 dark:border-teal-500/40 space-y-4 shadow-sm">
              <span className="text-sm font-extrabold text-teal-900 dark:text-teal-300 uppercase tracking-wider block flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>2. Entity Requirement Content (Raw or Any Language)</span>
              </span>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-900 dark:text-slate-100">Entity Title (rawTitle) *</label>
                  <span className="text-xs text-teal-800 dark:text-teal-400 font-mono font-bold">3-200 chars ({formData.rawTitle.length})</span>
                </div>
                <input
                  type="text"
                  name="rawTitle"
                  required
                  value={formData.rawTitle}
                  onChange={handleChange}
                  placeholder="e.g. Account Access Control or User Login Verification"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-900 dark:text-slate-200">Entity Description (rawDescription)</label>
                  <span className="text-xs text-slate-500 font-mono font-semibold">10-2000 chars if provided</span>
                </div>
                <textarea
                  name="rawDescription"
                  rows={3}
                  value={formData.rawDescription}
                  onChange={handleChange}
                  placeholder="Detailed requirement statement. e.g. Users should be prevented from accessing another customer's account even when they know the account identifier."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 shadow-sm"
                />
              </div>
            </div>

            {/* Model & Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">ML Classifier Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500 shadow-sm"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-1/2 flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2.5 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Cpu className="w-5 h-5 animate-spin" />
                      <span>Classifying with AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 stroke-[2.5]" />
                      <span>Classify Entity</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Results Column */}
          <div className="lg:col-span-5">
            {result ? (
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border-2 border-teal-400/50 dark:border-teal-500/40 bg-teal-50/40 dark:bg-teal-500/5 space-y-6 shadow-md">
                <div>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 uppercase font-extrabold">
                    Classification Result
                  </span>
                  <div className="mt-3.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 block">Classified Entity Type:</span>
                    <div className="mt-1.5 flex items-center space-x-2">
                      <span className={`text-xl sm:text-2xl font-black px-4 py-2 rounded-2xl shadow-sm ${ENTITY_TYPES[result.entityType]?.badgeClass || 'bg-teal-500 text-slate-950'}`}>
                        {ENTITY_TYPES[result.entityType]?.label || result.entityType}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                      {ENTITY_TYPES[result.entityType]?.desc}
                    </p>
                  </div>
                </div>

                {/* Score Banner */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">Confidence / Output Score</span>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-teal-700 dark:text-teal-300 mt-0.5">
                      {typeof result.score === 'number' ? result.score.toFixed(4) : result.score || 'N/A'}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Type: {result.scoreType || 'standard'}
                  </span>
                </div>

                {/* LLM Converted Content */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                  <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-900 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
                    <span>LLM Normalized Content (GPT):</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Title: </span>
                    {result.title}
                  </div>
                  {result.description && (
                    <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Description: </span>
                      {result.description}
                    </div>
                  )}
                </div>

                {/* Class Scores Breakdown */}
                {result.classScores && Object.keys(result.classScores).length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-300 flex items-center justify-between">
                      <span>Multi-Class Scores Breakdown:</span>
                      <span className="text-xs text-slate-500 font-mono font-bold">6 classes</span>
                    </span>
                    <div className="space-y-2">
                      {Object.entries(result.classScores)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, scoreVal]) => {
                          const isTop = className === result.entityType;
                          const formattedScore = typeof scoreVal === 'number' ? scoreVal.toFixed(3) : scoreVal;
                          return (
                            <div key={className} className="text-xs sm:text-sm">
                              <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span className={isTop ? 'font-extrabold text-teal-800 dark:text-teal-300' : 'font-semibold text-slate-600 dark:text-slate-400'}>
                                  {ENTITY_TYPES[className]?.label || className}
                                </span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formattedScore}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isTop ? 'bg-teal-600 dark:bg-teal-400' : 'bg-slate-400 dark:bg-slate-600'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.max(5, (scoreVal > 0 ? (scoreVal <= 1 ? scoreVal * 100 : Math.min(100, (scoreVal + 3) * 15)) : 5)))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[420px] border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
                  <Cpu className="w-8 h-8" />
                </div>
                <span className="text-base font-bold text-slate-700 dark:text-slate-300">Awaiting Classification Input</span>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                  Click <strong className="text-teal-600 dark:text-teal-400">1-Click Test (Default Values)</strong> or choose a preset to instantly test AI classification and probability scores.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
