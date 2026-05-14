# IRIS.SEC ML Microservice

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Endpoints:

- `GET /health`
- `GET /models/status`
- `POST /features/extract`
- `POST /features/batch`
- `POST /inference/predict`
- `POST /inference/batch`
- `POST /risk/adaptive`
