from dataclasses import dataclass
from pathlib import Path

import joblib
import lightgbm as lgb
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from pipelines.feature_pipeline import FEATURE_COLUMNS


@dataclass(frozen=True)
class TrainingResult:
    model_name: str
    artifact_path: str
    metrics: dict[str, float]


class Trainer:
    def train(self, frame: pd.DataFrame, target_column: str, output_dir: Path) -> list[TrainingResult]:
        output_dir.mkdir(parents=True, exist_ok=True)
        x = frame[FEATURE_COLUMNS]
        y = frame[target_column]
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)

        estimators = {
            "random_forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
            "logistic_regression": Pipeline(
                [("scaler", StandardScaler()), ("classifier", LogisticRegression(max_iter=1000))]
            ),
            "xgboost": xgb.XGBClassifier(eval_metric="mlogloss", random_state=42),
            "lightgbm": lgb.LGBMClassifier(random_state=42),
        }

        results: list[TrainingResult] = []
        for name, estimator in estimators.items():
            estimator.fit(x_train, y_train)
            predictions = estimator.predict(x_test)
            metrics = {
                "accuracy": float(accuracy_score(y_test, predictions)),
                "precision": float(precision_score(y_test, predictions, average="weighted", zero_division=0)),
                "recall": float(recall_score(y_test, predictions, average="weighted", zero_division=0)),
                "f1_score": float(f1_score(y_test, predictions, average="weighted", zero_division=0)),
            }
            artifact_path = output_dir / f"{name}.joblib"
            joblib.dump(estimator, artifact_path)
            results.append(TrainingResult(model_name=name, artifact_path=str(artifact_path), metrics=metrics))
        return results
