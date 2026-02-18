
from django.db import models
from django.contrib.auth.models import User

class GameSession(models.Model):
    """
    Representa una sesión completa de 'La Forja Molecular'.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)
    # Almacena el ID único generado por Dexie para evitar duplicados (Idempotencia)
    local_db_id = models.IntegerField(unique=True) 

    def __str__(self):
        return f"Sesión {self.local_db_id} - {self.user.username}"

class PedagogicalFailure(models.Model):
    """
    Registro de fallos donde la IA de DeepSeek intervino.
    """
    session = models.ForeignKey(GameSession, related_name='failures', on_delete=models.CASCADE)
    concept = models.CharField(max_length=255) # Ej: "Ley de Boyle"
    severity = models.CharField(max_length=50) # Critical, Medium, Low
    ai_feedback = models.TextField() # Lo que DeepSeek le dijo al alumno 
    timestamp = models.DateTimeField()

class TelemetryData(models.Model):
    """
    Datos masivos de impactos de partículas para analítica avanzada.
    """
    session = models.ForeignKey(GameSession, related_name='telemetry', on_delete=models.CASCADE)
    force = models.FloatField()
    timestamp = models.DateTimeField()
