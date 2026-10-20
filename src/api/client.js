// api/client.js
import { getAuthHeaders } from '../utils/deviceId';

const API_BASE = '/re-model-service/api/v1';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || (data?.errors && JSON.stringify(data.errors)) || response.statusText || 'Request failed';
    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // 1. Single Entity Classification
  classifyEntity: async (payload, model = 'linear_svm') => {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };

    const body = {
      ...payload,
      model,
    };

    const response = await fetch(`${API_BASE}/classification/classify-entity`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  // 2. Bulk Entity Classification (File Upload)
  classifyBulkEntity: async (file, model = 'linear_svm') => {
    const headers = {
      ...getAuthHeaders(),
      // Note: Do not set Content-Type for FormData, browser sets multipart boundary automatically
    };

    const formData = new FormData();
    formData.append('file', file);
    if (model) {
      formData.append('model', model);
    }

    const response = await fetch(`${API_BASE}/classification/classify-bulk-entity`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse(response);
  },

  // 3. Dataset Insights
  getDatasetInsights: async () => {
    const headers = {
      ...getAuthHeaders(),
    };

    const response = await fetch(`${API_BASE}/data-insight/dataset-insights`, {
      method: 'GET',
      headers,
    });

    return handleResponse(response);
  },

  // 4. Training Dataset Explorer
  getDataset: async (page, limit) => {
    const headers = {
      ...getAuthHeaders(),
    };

    const params = new URLSearchParams();
    if (page !== undefined && page !== null) params.append('page', page);
    if (limit !== undefined && limit !== null) params.append('limit', limit);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_BASE}/data-insight/dataset${queryString}`, {
      method: 'GET',
      headers,
    });

    return handleResponse(response);
  },

  // 5. Model Evaluation Metrics
  getModelEvaluation: async () => {
    const headers = {
      ...getAuthHeaders(),
    };

    const response = await fetch(`${API_BASE}/evaluation/model-evaluation`, {
      method: 'GET',
      headers,
    });

    return handleResponse(response);
  },

  // 6. LLM Content Translator
  convertContentToEnglish: async (rawTitle, rawDescription = '') => {
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    };

    const body = {
      rawTitle,
      rawDescription,
    };

    const response = await fetch(`${API_BASE}/llm/convert-content-to-english`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse(response);
  },

  // Health check test
  checkBackendHealth: async () => {
    try {
      const response = await fetch('/health', { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export const AVAILABLE_MODELS = [
  { id: 'linear_svm', name: 'Linear SVM (Default)', desc: 'Fast, high-dimensional text separation', isDefault: true },
  { id: 'sgd_classifier', name: 'SGD Classifier', desc: 'Stochastic Gradient Descent optimizer' },
  { id: 'ridge_classifier', name: 'Ridge Classifier', desc: 'L2 Regularized linear regression classification' },
  { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Calibrated probabilistic classification' },
  { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble of decision trees with bagging' },
  { id: 'extra_trees', name: 'Extra Trees', desc: 'Extremely randomized trees ensemble' },
  { id: 'decision_tree', name: 'Decision Tree', desc: 'Interpretable hierarchical decision rules' },
  { id: 'multinomial_naive_bayes', name: 'Multinomial Naive Bayes', desc: 'Classic bag-of-words text baseline' },
  { id: 'complement_naive_bayes', name: 'Complement Naive Bayes', desc: 'Suited for imbalanced datasets' },
  { id: 'bernoulli_naive_bayes', name: 'Bernoulli Naive Bayes', desc: 'Binary occurrence feature model' },
];

export const ENTITY_TYPES = {
  REQUIREMENT: {
    label: 'Requirement',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    desc: 'Functional or behavior expectation defining system operations',
  },
  HIGH_LEVEL_FEATURE: {
    label: 'High-Level Feature',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    desc: 'Broad capability or functional block of the product',
  },
  EXTERNAL_INTERFACE: {
    label: 'External Interface',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    desc: 'Communication boundary with 3rd-party services, APIs, hardware',
  },
  CONSTRAINT: {
    label: 'Constraint',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    desc: 'Policy, operational rule, technical limit, or compliance requirement',
  },
  SCOPE: {
    label: 'Scope',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    desc: 'Project boundaries, release phases, and inclusion/exclusion limits',
  },
  INVALID_IRRELEVANT: {
    label: 'Invalid / Irrelevant',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    desc: 'Nonsense text, unrelated gibberish, or malformed entries',
  },
};
