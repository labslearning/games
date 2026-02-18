from django.contrib import admin
from django.urls import path
from learning_labs.views import status_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', status_view),
]
