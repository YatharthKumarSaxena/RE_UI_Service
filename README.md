# RE AI Model Intelligence Suite - Frontend

This is the modern React + Vite frontend for the **RE_AI_Model_Service** (Requirements Engineering AI Classification & Analytics Service).

## Features

1. **Dataset & Bulk File Viewer (`DatasetViewer`)**:
   - Inspect the **40-row sample requirements file** directly in the UI.
   - Hardcoded test-through-files registry (`/samples/sample_requirements.csv`, `fintech_banking_sample.csv`, `edge_cases_sample.csv`, `healthcare_logistics_sample.csv`).
   - Drag-and-drop any custom CSV/XLSX to inspect before classification.
   - Verifies column compliance against the backend schema (`IMPORT_ENTITY_TYPE`).
   - 1-click **"Test in Bulk Classifier"** and **"Load Row into Single Classifier"**.

2. **Bulk Classification (`BulkClassifier`)**:
   - Upload requirement files (`.csv`, `.xlsx`).
   - 1-Click quick test using the built-in 40-row sample dataset.
   - Choose from 10 machine learning models (Linear SVM, SGD, Random Forest, Naive Bayes, etc.).
   - Interactive data table with entity type tags, scores, validity verification, and CSV export.

3. **Single Entity Classifier (`SingleClassifier`)**:
   - Test single requirements with full project context.
   - Real-time character counters reflecting backend constraints.
   - Normalized LLM English translation + multi-class confidence distribution.

4. **Data Insights (`DataInsights`)**:
   - Analyzes training corpus (>5,000 records).
   - Class distribution charts for `REQUIREMENT`, `SCOPE`, `CONSTRAINT`, `HIGH_LEVEL_FEATURE`, `EXTERNAL_INTERFACE`, `INVALID_IRRELEVANT`.
   - Training dataset explorer table.

5. **Model Evaluation (`ModelEvaluation`)**:
   - Visualizes performance benchmarks across models from `ml/evaluation/entityType/*.csv`.

6. **LLM Translator (`LLMTranslator`)**:
   - Multi-lingual translation and requirement normalization via Groq / GPT with ambiguity checks.

7. **Device Identity Management (`DeviceSettingsModal`)**:
   - Auto-generates and sends required headers: `x-device-uuid`, `x-device-name`, `x-device-type`.

## Quick Start

### 1. Start Backend (Root Directory)
```bash
python3 server.py
# Server runs on http://127.0.0.1:8083
```

### 2. Start Frontend (`Frontend` Directory)
```bash
cd Frontend
npm run dev
# Vite runs on http://localhost:3000
```
In local development, Vite proxies `/health` and `/re-model-service` requests to `http://127.0.0.1:8083`. Production builds use `https://re-ai-model-service.onrender.com` by default. Set `VITE_BACKEND_URL` at build time to override the backend origin if needed. The backend must allow requests from the deployed frontend origin through CORS.

### 3. Build for Production
```bash
npm run build
```
