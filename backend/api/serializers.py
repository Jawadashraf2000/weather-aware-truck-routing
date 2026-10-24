from rest_framework import serializers

class RouteAnalysisInputSerializer(serializers.Serializer):
    origin = serializers.CharField(max_length=255)
    destination = serializers.CharField(max_length=255)
    departure_time = serializers.DateTimeField()
    load_weight_lbs = serializers.IntegerField(min_value=0)
    sample_interval_miles = serializers.IntegerField(default=25, min_value=10, max_value=50)