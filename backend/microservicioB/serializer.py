from rest_framework import serializers
from .models import AttendanceRecord
class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

    def validate_employee_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("El ID del empleado debe ser positivo")
        return value