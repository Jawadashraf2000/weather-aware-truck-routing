from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RouteAnalysisInputSerializer
from .services import RouteAnalysisService

class AnalyzeRouteView(APIView):
    def post(self, request):
        serializer = RouteAnalysisInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            routes = RouteAnalysisService.analyze_routes(
                origin=data["origin"],
                destination=data["destination"],
                departure_dt=data["departure_time"],
                load_weight_lbs=data["load_weight_lbs"],
                sample_interval_miles=data["sample_interval_miles"]
            )
            return Response({"status": "success", "routes": routes}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
