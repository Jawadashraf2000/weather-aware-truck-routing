from django.urls import path
from .views import AnalyzeRouteView

urlpatterns = [
    path('analyze-route/', AnalyzeRouteView.as_view(), name='analyze-route'),
]