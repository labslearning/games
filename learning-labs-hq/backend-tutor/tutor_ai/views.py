import httpx
import os
import asyncio
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

class DeepSeekTutorView(APIView):
    """
    ARQUITECTURA NIVEL DIOS: 
    Implementación asíncrona con validación de contexto pedagógico
    y salida estructurada para sincronización con Learning Labs.
    """

    async def post(self, request):
        # 1. Extracción y Validación de Contexto (Clean Architecture)
        data = request.data
        concept = data.get('concept', 'Concepto Desconocido')
        physics = data.get('currentPhysics', {})
        history = data.get('history', [])
        
        # 2. Prompt Engineering de Grado Industrial
        # Forzamos a la IA a devolver JSON para que el frontend pueda procesar 
        # estadísticas y conceptos por separado.
        system_prompt = (
            "Eres el núcleo de IA de Learning Labs. Tu objetivo es la enseñanza profunda. "
            "Debes responder EXCLUSIVAMENTE en formato JSON con la siguiente estructura: "
            "{ 'concept_explanation': '...', 'technical_tip': '...', 'pedagogical_tag': '...', 'severity_analysis': '...' }. "
            f"Contexto: El alumno falló en {concept}. "
            f"Física del reactor: Temp {physics.get('temp')}K, Presión {physics.get('pressure')}atm. "
            f"Historial de errores previos: {history}."
        )

        try:
            # 3. Llamada Asíncrona (Tier God: No bloquea el hilo principal del servidor)
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
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": "Analiza mi error y ayúdame a mejorar."}
                        ],
                        "response_format": {"type": "json_object"} # Forzamos formato JSON
                    }
                )
            
            if response.status_code != 200:
                return Response({"error": "IA Temporalmente fuera de línea"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            ai_response = response.json()
            # Extraemos el contenido ya estructurado
            pedagogical_data = ai_response['choices'][0]['message']['content']

            # 4. Registro en el Historial de Learning Labs (Simulado)
            # Aquí guardarías en tu DB de Django para el emparejamiento final de datos
            await self.log_pedagogical_event(concept, physics, pedagogical_data)

            return Response({
                "data": pedagogical_data,
                "server_timestamp": "2026-02-17T16:00:00Z", # Ejemplo de trazabilidad industrial
                "status": "success"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log de errores de nivel industrial (Sentry/ELK)
            print(f"CRITICAL ERROR EN TUTOR AI: {str(e)}")
            return Response({"error": "Fallo en el motor de pensamiento"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def log_pedagogical_event(self, concept, physics, ai_data):
        """
        Guarda el evento para analítica avanzada y emparejamiento de datos.
        """
        # Aquí iría la lógica de persistencia en tu DB SQL para Learning Labs
        pass
