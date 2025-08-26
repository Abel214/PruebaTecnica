from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from employees.views import EmployeeListView, EmployeeDetailView, SwaggerPDFView
from microservicioB.views import AttendanceView, AttendanceListView

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version='v1',
        description="Documentación de las APIs",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('employees.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    #URLS PARA MICROSERVICIO A
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),

    #URLS PARA SWAGGER
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    #URLS MICROSERVICIO B
    path('attendance/', AttendanceView.as_view(), name='attendance-create'),
    path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),

    #URLS PARA DESCARGAR SWAGGER EN PDF
    path('api/docs/pdf/', SwaggerPDFView.as_view(), name='api-docs-pdf'),

]
