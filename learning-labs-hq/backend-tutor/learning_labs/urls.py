from django.urls import path
from .views import DataPairingView
from .reports import AIReportGeneratorView

urlpatterns = [
    path('sync/pair/', DataPairingView.as_view(), name='data-sync'),
    path('reports/generate/<int:session_id>/', AIReportGeneratorView.as_view(), name='gen-report'),
]
