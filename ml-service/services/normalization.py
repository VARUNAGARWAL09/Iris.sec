import math


class FeatureNormalizer:
    def bounded(self, value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
        if math.isnan(value) or math.isinf(value):
            return minimum
        return max(minimum, min(maximum, value))

    def minmax(self, value: float, minimum: float, maximum: float) -> float:
        if maximum <= minimum:
            return 0.0
        return self.bounded((value - minimum) / (maximum - minimum))

    def log_scale(self, value: float, denominator: float = 10.0) -> float:
        return self.bounded(math.log1p(max(0.0, value)) / denominator)

    def ratio(self, numerator: float, denominator: float) -> float:
        if denominator <= 0:
            return 0.0
        return self.bounded(numerator / denominator)


feature_normalizer = FeatureNormalizer()
