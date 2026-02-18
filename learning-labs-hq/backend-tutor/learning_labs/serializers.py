from django.db import transaction
from rest_framework import serializers
from .models import GameSession, PedagogicalFailure, TelemetryData

# --- SERIALIZADORES DE SOPORTE (Validación Estricta) ---

class FailureIngestionSerializer(serializers.Serializer):
    """Valida los fallos detectados por la IA de DeepSeek."""
    concept = serializers.CharField(max_length=255)
    ai_feedback = serializers.CharField()
    timestamp = serializers.DateTimeField()

class TelemetryIngestionSerializer(serializers.Serializer):
    """Valida los micro-impactos de Rapier calculados en WASM."""
    force = serializers.FloatField()
    timestamp = serializers.DateTimeField()

# --- SERIALIZADOR PRINCIPAL TIER GOD ---

class SyncSessionSerializer(serializers.ModelSerializer):
    """
    MOTOR DE INGESTA ATÓMICA:
    Maneja la creación de la sesión y sus miles de datos relacionados
    en una sola transacción de base de datos.
    """
    # Usamos ListField para validar que cada elemento del array cumpla con el esquema
    failures = FailureIngestionSerializer(many=True, write_only=True)
    telemetry = TelemetryIngestionSerializer(many=True, write_only=True)

    class Meta:
        model = GameSession
        fields = ['local_db_id', 'start_time', 'end_time', 'score', 'failures', 'telemetry']

    def validate_local_db_id(self, value):
        """Evita la duplicidad de datos (Idempotencia)."""
        if GameSession.objects.filter(local_db_id=value).exists():
            raise serializers.ValidationError("Esta sesión ya ha sido emparejada con Learning Labs.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        """
        NIVEL DIOS: Orquestación de persistencia masiva.
        """
        # 1. Extraemos los datos anidados
        failures_data = validated_data.pop('failures')
        telemetry_data = validated_data.pop('telemetry')
        
        # 2. Obtenemos el usuario del contexto (Inyectado por el View)
        user = self.context['request'].user
        
        # 3. Creamos la sesión principal
        session = GameSession.objects.create(user=user, **validated_data)

        # 4. Ingesta Masiva de Fallos (Contexto DeepSeek)
        # Convertimos los datos validados en objetos de modelo
        failure_objs = [
            PedagogicalFailure(
                session=session,
                concept=f['concept'],
                ai_feedback=f['ai_feedback'],
                timestamp=f['timestamp']
            ) for f in failures_data
        ]
        PedagogicalFailure.objects.bulk_create(failure_objs)

        # 5. Ingesta Masiva de Telemetría (Físicas WASM) [cite: 18, 65]
        # Usamos bulk_create para insertar miles de impactos en una sola consulta SQL
        telemetry_objs = [
            TelemetryData(
                session=session,
                force=t['force'],
                timestamp=t['timestamp']
            ) for t in telemetry_data
        ]
        TelemetryData.objects.bulk_create(telemetry_objs)

        return session
