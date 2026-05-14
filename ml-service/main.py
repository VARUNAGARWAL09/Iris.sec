from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers.health import router as health_router
from routers.features import router as features_router
from routers.inference import router as inference_router
from routers.models import router as models_router
from routers.risk import router as risk_router
from routers.sla import router as sla_router
from routers.intent import router as intent_router
from routers.correlation import router as correlation_router
from routers.ueba import router as ueba_router
from routers.mitre import router as mitre_router
from routers.classification import router as classification_router
from utils.config import settings
from utils.logging import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="IRIS.SEC ML Microservice",
    description="Enterprise-grade modular ML inference service for IRIS.SEC.",
    version=settings.service_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(models_router)
app.include_router(features_router)
app.include_router(inference_router)
app.include_router(risk_router)
app.include_router(sla_router)
app.include_router(intent_router)
app.include_router(correlation_router)
app.include_router(ueba_router)
app.include_router(mitre_router)
app.include_router(classification_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled request failure", extra={"path": str(request.url.path)})
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "internal_error",
                "message": "Internal ML service error.",
            },
            "data": None,
            "metadata": {"service_version": settings.service_version},
        },
    )
