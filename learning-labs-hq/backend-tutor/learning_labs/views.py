import logging
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import SyncSessionSerializer

# Configuración de logs industriales para trazabilidad en Learning Labs
logger = logging.getLogger(__name__)

class DataPairingView(APIView):
    """
    ARQUITECTURA TIER GOD: Motor de Sincronización Masiva.
    Responsabilidades:
    1. Autenticación y Seguridad.
    2. Delegación de lógica al Serializador (Single Responsibility).
    3. Manejo de errores de grado industrial.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Recuperamos las sesiones enviadas desde el SyncEngine (Frontend)
        sessions_data = request.data.get('sessions', [])
        
        if not sessions_data:
            return Response(
                {"status": "ignored", "message": "No hay datos para emparejar"}, 
                status=status.HTTP_200_OK
            )

        # 2. Usamos el Serializador para validar e insertar (Tier God)
        # Pasamos many=True porque recibimos un array de sesiones
        serializer = SyncSessionSerializer(
            data=sessions_data, 
            many=True, 
            context={'request': request}
        )

        try:
            # 3. Validación y Persistencia en un solo paso atómico
            if serializer.is_is_valid():
                with transaction.atomic():
                    serializer.save()
                
                logger.info(f"Usuario {request.user.id} emparejó {len(sessions_data)} sesiones con éxito.")
                
                return Response({
                    "status": "paired",
                    "message": f"Sincronización exitosa: {len(sessions_data)} sesiones integradas.",
                    "platform": "Learning Labs 2026"
                }, status=status.HTTP_201_CREATED)
            
            # 4. Manejo de errores de validación (Basado en el esquema de datos)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Log crítico para depuración en producción
            logger.error(f"Error crítico en emparejamiento: {str(e)}")
            return Response(
                {"error": "Fallo interno en el motor de ingesta de datos."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
