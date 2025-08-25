
from rest_framework import serializers
from .models import Employee
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Ejemplo de empleado',
            value={
                "id": 1,
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan@empresa.com",
                "phone_number": "+1234567890",
                "position": "Desarrollador",
                "salary": "50000.00",
                "hire_date": "2024-01-15"
            },
            response_only=True
        )
    ]
)
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

    def validate_email(self, value):
        if self.instance and self.instance.email == value:
            return value
        # Verificar si el email ya existe en otros registros
        if Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")

        return value

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("El salario no puede ser negativo")
        return value