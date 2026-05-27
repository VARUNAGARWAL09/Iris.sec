# 🤖 IRIS.SEC - Machine Learning Microservice

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-emerald.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-orange.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.1.4-red.svg)](https://xgboost.readthedocs.io/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.6.0-navy.svg)](https://lightgbm.readthedocs.io/)

IRIS.SEC Machine Learning Microservice is an enterprise-grade, modular FastAPI inference and pipeline service designed to provide advanced cyber-security intelligence, adaptive risk scoring, UEBA anomaly detection, intent recognition, SLA forecasting, and MITRE technique classification.

---

## 🏗️ Architecture & Component Design

The service is highly modular, separating routing, data schemas, validation, business/inference logic, and training pipelines:

```
ml-service/
├── main.py                  # Service entrypoint & FastAPI app initialization
├── requirements.txt         # Package dependencies
├── Dockerfile               # Slim Docker configuration for production scaling
├── routers/                 # Endpoint routing layer
│   ├── health.py            # Service status checks
│   ├── models.py            # Model registry, status & hot-reloading controls
│   ├── features.py          # Data ingestion and raw feature extraction
│   ├── inference.py         # Primary ensemble inference pipeline
│   ├── risk.py              # Adaptive risk scoring
│   ├── sla.py               # Incident SLA forecasting
│   ├── intent.py            # NLP Query intent recognition
│   ├── correlation.py       # Multi-alert correlation engine
│   ├── ueba.py              # User & Entity Behavior Analytics anomalies
│   ├── mitre.py             # MITRE ATT&CK technique prediction
│   └── classification.py    # Threat categorization
├── schemas/                 # Pydantic data contract definitions
├── services/                # Specialized domain execution logic
│   ├── adaptive_risk_scoring.py  # Calculates composite risk dynamically
│   ├── correlation_engine.py     # Matches similarity across incident clusters
│   ├── intent_recognition.py     # Maps NLP input to platform actions
│   ├── mitre_prediction.py       # Heatmap technique confidence scoring
│   ├── sla_intelligence.py       # Regressors tracking MTTR and breach risk
│   ├── threat_classification.py  # Multiclass threat classification models
│   ├── ueba_engine.py            # Baseline profiling & impossible travel checks
│   ├── feature_engineering.py    # Out-of-bounds calculations & transforms
│   ├── feature_validation.py     # Schema sanity check gates
│   ├── normalization.py          # Value scaling helpers
│   ├── feature_cache.py          # In-memory performance cache
│   └── inference_logger.py       # Analytics and performance logger
├── training/                # Off-line models training pipelines
└── models/                  # Registry and persisted serialized model binaries
```

---

## ⚡ API Endpoints Reference

The service runs on port `8000` by default. Complete interactive API docs are available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when running.

### 🌐 System & Registry Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Verifies microservice operational status and system load metrics |
| `/models/status` | `GET` | Lists all active models, versions, registry configuration, and load times |
| `/models/reload` | `POST` | Hot-reloads updated serialised models without service interruptions |

### 🛠️ Ingestion & Feature Engineering

| Endpoint | Method | Description |
|---|---|---|
| `/features/extract` | `POST` | Takes raw logs or event payloads and engineers mathematical features |
| `/features/batch` | `POST` | Efficiently processes bulk streams of security events |

### 🧠 Intelligent Security Endpoints

#### 1. Adaptive Risk Scoring (`POST /risk/adaptive`)
Calculates highly granular risk levels using an ensemble of XGBoost, LightGBM, and heuristic engines.
- **Inputs**: Event attributes, MITRE tags, IOC count, source reputation, incident history.
- **Output**: 
  - Calculated risk score (`0-100`)
  - Confidence coefficient (`0.0-1.0`)
  - Escalation probability (`0.0-1.0`)
  - False positive probability (`0.0-1.0`)
  - Detailed feature importance contributions

#### 2. SLA Intelligence & MTTR Regression (`POST /sla/predict`)
Predicts potential breach probabilities and ETA for incident containment based on current queue density and history.
- **Inputs**: SLA limits, analyst load index, current queue length, historical MTTR.
- **Output**: SLA breach probability, predicted resolution time (minutes), queue risk index.

#### 3. NLP Intent Recognition (`POST /intent/recognize`)
Decodes user query strings typed in the platform IRIS AI assistant into specific actionable queries.
- **Inputs**: User message query string.
- **Output**: Classified intent (e.g. `search_incidents`, `system_status`), confidence score, extracted entity keys.

#### 4. Incident & Alert Correlation (`POST /correlation/correlate`)
Clusters raw signals across multiple events into linked campaigns using similarity indices and common adversary infrastructure.
- **Inputs**: Target alert details, historical active clusters.
- **Output**: Similarity indices, campaign correlation tags, cluster linkage map.

#### 5. UEBA & Behavior Anomaly Analytics (`POST /ueba/detect`)
Identifies compromised user accounts and suspicious insider movements using statistical deviations and travel velocity anomalies.
- **Inputs**: Activity type, entity ID, source location history.
- **Output**: Anomaly score, classification (e.g., `impossible_travel`), historical baseline variance.

#### 6. MITRE ATT&CK Mapping (`POST /mitre/predict`)
Predicts downstream attack progression stages and maps alerts into specific MITRE technique IDs.
- **Inputs**: Observed sequences of techniques.
- **Output**: Map of predicted technique IDs, confidence scores, lateral progression probability.

#### 7. Threat Classification (`POST /classification/classify`)
Categorizes incidents dynamically (e.g., Ransomware, Credential Abuse, Web Injection) and prescribes defensive playbook protocols.
- **Inputs**: Incident titles, description bodies.
- **Output**: multiclass category probability map, recommended playbooks, complexity assessment.

---

## 🚀 Setup & Execution

### Prerequisites

- **Python 3.12** or higher installed.
- **Virtual Environment** support tool.

### Running Locally (Development)

1. **Navigate to the ml-service folder**:
   ```bash
   cd ml-service
   ```

2. **Initialize a python virtual environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment**:
   - **Windows PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```

4. **Install all required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the FastAPI microservice**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. The endpoints can now be visited and tested at `http://localhost:8000/docs`.

---

## 🐳 Docker Deployment

The service is fully dockerized and ready to deploy:

### Build Docker Image

```bash
docker build -t iris-ml-service:latest .
```

### Run Docker Container

```bash
docker run -d -p 8000:8000 iris-ml-service:latest
```

---

## 🔒 High-Fidelity Resilience Client

To guarantee the SOC console remains completely operational regardless of network connectivity or API health, the frontend uses an integrated fallback layer inside the UI Client:

```
                  ┌───────────────────────────────┐
                  │      React App UI Component   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                     [ mlClient.ts API Broker ]
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
        [ HTTP API Call ]               [ localFallback ]
        • Target Port: 8000             • Triggers if offline / timeout
        • Direct FastAPI call           • Delivers high-fidelity mocks
        │                               │
        ▼                               ▼
  ┌──────────────┐                ┌──────────────┐
  │ FastAPI ML   │                │ Web Sandbox  │
  │ Microservice │                │ Offline Mode │
  └──────────────┘                └──────────────┘
```

This dual-path setup ensures that dynamic dashboards, interactive classification charts, and smart NLP predictions are rendered instantly under all conditions!
