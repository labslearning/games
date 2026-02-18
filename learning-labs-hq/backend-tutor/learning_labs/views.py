from django.http import JsonResponse
import random

def status_view(request):
    temp = float(request.GET.get('temp', 300))
    # Simulamos fluctuación
    current_temp = temp + random.uniform(-2, 2)
    
    # --- MOTOR DE LECCIONES TEÓRICAS ---
    if current_temp < 330:
        concept = "TEORÍA CINÉTICA: A bajas temperaturas, la velocidad media de las moléculas disminuye. Observa cómo los choques contra las paredes del reactor son menos frecuentes."
        label = "CONCEPTO: ENERGÍA TÉRMICA BAJA"
    elif 330 <= current_temp <= 420:
        concept = "LEY DE GAY-LUSSAC: Al mantener el volumen constante, la presión es directamente proporcional a la temperatura. ¿Ves cómo el HUD de presión sube junto al calor?"
        label = "CONCEPTO: PROPORCIONALIDAD DIRECTA"
    else:
        concept = "ESTADO CRÍTICO: Las partículas han ganado tanta energía cinética que el campo de contención está fallando. ¡Esto es lo que ocurre en una fusión descontrolada!"
        label = "CONCEPTO: ENTROPÍA MÁXIMA"

    return JsonResponse({
        "temp": current_temp,
        "pressure": current_temp * 1.5, # Simulación de Ley de Gases
        "is_critical": current_temp > 420,
        "ai_advice": concept,
        "current_lesson": label
    })
