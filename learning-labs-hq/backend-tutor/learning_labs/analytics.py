from django.db.models import Avg, StdDev, Count
from .models import GameSession, TelemetryData

def get_student_performance(session_id):
    """
    Calcula métricas nivel AAA sobre el desempeño físico y pedagógico.
    """
    # 1. Analizamos la estabilidad de la presión
    stats = TelemetryData.objects.filter(session_id=session_id).aggregate(
        avg_force=Avg('force'),
        stability=StdDev('force'), # Una desviación alta significa caos
        total_impacts=Count('id')
    )
    
    # 2. Obtenemos los conceptos donde más falló según la IA
    common_failures = GameSession.objects.get(id=session_id).failures.values('concept').annotate(
        count=Count('concept')
    ).order_order_by('-count')

    return {
        "score_card": stats,
        "critical_concepts": list(common_failures),
        "rank": "Ingeniero Senior" if stats['stability'] and stats['stability'] < 20 else "Principiante"
    }
