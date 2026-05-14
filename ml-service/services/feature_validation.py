import math


class FeatureValidator:
    def validate(self, values: dict[str, float], required: list[str]) -> list[str]:
        warnings: list[str] = []
        for name in required:
            if name not in values:
                values[name] = 0.0
                warnings.append(f"missing:{name}")
            value = values[name]
            if value is None or math.isnan(float(value)) or math.isinf(float(value)):
                values[name] = 0.0
                warnings.append(f"invalid:{name}")
        extra = [key for key in values if key not in required]
        for key in extra:
            values.pop(key, None)
        return warnings


feature_validator = FeatureValidator()
