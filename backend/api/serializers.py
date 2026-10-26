from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

class RouteAnalysisInputSerializer(serializers.Serializer):
    origin = serializers.CharField(max_length=255)
    destination = serializers.CharField(max_length=255)
    departure_time = serializers.DateTimeField()

    def validate_departure_time(self, value):
        now = timezone.now()
        if timezone.is_aware(value):
            value = timezone.make_naive(value)
        if value < now:
            raise serializers.ValidationError("Departure time must be in the future.")
        if value > now + timedelta(days=14):
            raise serializers.ValidationError(
                "Departure time must be within the next 14 days."
            )
        return value
    load_weight_lbs = serializers.IntegerField(min_value=0)
    sample_interval_miles = serializers.IntegerField(default=25, min_value=10, max_value=50)