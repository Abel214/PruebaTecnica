# employees/views.py
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from employees.models import Employee
from employees.serializers import EmployeeSerializer


class EmployeeListView(APIView):
    @extend_schema(
        summary="Listar todos los empleados",
        description="Obtiene una lista de todos los empleados registrados en el sistema",
        responses={200: EmployeeSerializer(many=True)}
    )
    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Crear nuevo empleado",
        description="Crea un nuevo empleado con los datos proporcionados",
        request=EmployeeSerializer,
        responses={
            201: EmployeeSerializer,
            400: OpenApiTypes.OBJECT
        },
        examples=[
            OpenApiExample(
                'Ejemplo de creación',
                value={
                    "first_name": "Juan",
                    "last_name": "Pérez",
                    "email": "juan@empresa.com",
                    "phone_number": "+1234567890",
                    "position": "Desarrollador",
                    "salary": "50000.00",
                    "hire_date": "2024-01-15"
                },
                request_only=True
            )
        ]
    )
    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeDetailView(APIView):
    @extend_schema(
        summary="Obtener empleado específico",
        description="Obtiene los detalles de un empleado por su ID",
        parameters=[
            OpenApiParameter(
                name='pk',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='ID del empleado'
            )
        ],
        responses={
            200: EmployeeSerializer,
            404: OpenApiTypes.OBJECT
        }
    )
    def get(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Actualizar empleado",
        description="Actualiza los datos de un empleado existente",
        request=EmployeeSerializer,
        responses={
            200: EmployeeSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT
        }
    )
    def put(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
            serializer = EmployeeSerializer(employee, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Eliminar empleado",
        description="Elimina un empleado del sistema",
        parameters=[
            OpenApiParameter(
                name='pk',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='ID del empleado'
            )
        ],
        responses={
            204: None,
            404: OpenApiTypes.OBJECT
        }
    )
    def delete(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
            employee.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)