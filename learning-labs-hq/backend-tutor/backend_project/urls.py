from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Una vista rápida para probar que la API responde
def api_status(request):
    return JsonResponse({"status": "online", "system": "Learning Labs HQ", "ia_status": "DeepSeek Connected"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', api_status),
    # Aquí es donde el juego buscará la lógica de la IA
    # path('api/tutor/', include('tutor_ai.urls')), 
]
