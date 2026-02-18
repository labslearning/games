import httpx
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import GameSession

logger = logging.getLogger(__name__)

class AIReportGeneratorView(APIView):
    """
    TIER GOD ANALYTICS ENGINE:
    1. Procesamiento asíncrono (Non-blocking).
    2. Extracción de señales de comportamiento (Learning Science).
    3. Prompt Engineering Estructural.
    """

    async def post(self, request, session_id):
        # 1. Recuperación segura de datos con Prefetch
        session = get_object_or_404(GameSession, id=session_id)
        telemetry = session.telemetry.all()
        failures = session.failures.all()

        if not telemetry.exists():
            return Response({"error": "Datos insuficientes para análisis"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. EXTRACCIÓN DE SEÑALES PEDAGÓGICAS (Data Science)
        # No solo enviamos el promedio, enviamos la "Intención" del alumno
        forces = [t.force for t in telemetry]
        avg_force = sum(forces) / len(forces)
        peak_force = max(forces)
        
        # Calculamos la estabilidad: Desviación de los últimos 20 impactos
        stability_index = "Estable" if (sum(abs(f - avg_force) for f in forces[-20:]) / 20) < 50 else "Errático"
        
        # Mapa de conceptos fallidos
        failure_map = {}
        for f in failures:
            failure_map[f.concept] = failure_map.get(f.concept, 0) + 1

        # 3. PROMPT ENGINEERING DE GRADO INDUSTRIAL
        system_persona = (
            "Eres un Ingeniero Químico Principal y Especialista en Psicología del Aprendizaje de Learning Labs. "
            "Tu tarea es transformar telemetría física en una hoja de ruta de mentoría técnica. "
            "Debes responder estrictamente en formato JSON."
        )

        user_context = f"""
        ANÁLISIS DE TELEMETRÍA - SESIÓN {session_id}
        - Estudiante: {session.user.username}
        - Presión Promedio: {avg_force:.2f} atm
        - Pico de Presión: {peak_force:.2f} atm
        - Comportamiento Mecánico: {stability_index}
        - Fallos Críticos por Concepto: {failure_map}
        
        ESTRUCTURA DEL JSON REQUERIDA:
        {{
            "executive_summary": "Análisis de alto nivel del comportamiento",
            "technical_strengths": ["lista", "de", "aciertos"],
            "critical_weaknesses": ["lista", "de", "áreas", "rojas"],
            "learning_path": ["pasos", "para", "maestría"],
            "ai_score": 0-100
        }}
        """

        # 4. LLAMADA ASÍNCRONA (Nivel Dios: No bloquea el Worker de Django)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_persona},
                            {"role": "user", "content": user_context}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )

            if response.status_code != 200:
                logger.error(f"Error en DeepSeek API: {response.text}")
                return Response({"error": "Motor de IA fuera de línea"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            ai_data = response.json()
            report_content = ai_data['choices'][0]['message']['content']

            # 5. Respuesta Atómica y Limpia
            return Response({
                "session_id": session_id,
                "report": report_content,
                "meta": {"generated_at": "2026-02-17T18:00:00Z", "version": "v2.1-GOD"}
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.critical(f"Fallo masivo en Generador de Reportes: {str(e)}")
            return Response({"error": "Fallo crítico en el procesamiento de inteligencia"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
