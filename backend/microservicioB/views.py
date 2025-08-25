import json
import uuid
import pika
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.openapi import OpenApiTypes
from .models import AttendanceRecord
from microservicioB.serializer import AttendanceSerializer

class AttendanceView(APIView):

    @extend_schema(
        summary="Crear registro de asistencia",
        description="Crea un nuevo registro de asistencia para un empleado. "
                    "Primero valida que el empleado exista a través del microservicio A usando RabbitMQ.",
        request=AttendanceSerializer,
        responses={
            201: OpenApiResponse(
                response=AttendanceSerializer,
                description="Registro de asistencia creado exitosamente"
            ),
            400: OpenApiResponse(
                description="Datos inválidos o empleado no existe",
                examples={
                    'application/json': {
                        'error': 'Empleado no válido o no existe'
                    }
                }
            ),
        },
        tags=['Asistencias']
    )
    def post(self, request):

        employee_id = request.data.get('employee_id')

        if not self.validate_employee(employee_id):
            return Response(
                {"error": "Empleado no válido o no existe"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def validate_employee(self, employee_id):

        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters('localhost')
            )
            channel = connection.channel()


            channel.queue_declare(queue='validate_employee_request', durable=True)
            channel.queue_declare(queue='validate_employee_response', durable=True)


            result = channel.queue_declare(queue='', exclusive=True)
            callback_queue = result.method.queue
            correlation_id = str(uuid.uuid4())
            message = {'employee_id': employee_id}

            channel.basic_publish(
                exchange='',
                routing_key='validate_employee_request',
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    reply_to=callback_queue,
                    correlation_id=correlation_id,
                    delivery_mode=2,
                )
            )
            response = None

            def on_response(ch, method, props, body):
                nonlocal response
                if props.correlation_id == correlation_id:
                    response = json.loads(body)
                    connection.close()

            channel.basic_consume(
                queue=callback_queue,
                on_message_callback=on_response,
                auto_ack=True
            )

            # Esperar con timeout
            connection.process_data_events(time_limit=5)  # 5 segundos timeout

            if response:
                return response.get('valid', False)
            else:
                print("⏰ Timeout en validación RabbitMQ")
                return False

        except Exception as e:
            print(f"❌ Error en validación RabbitMQ: {e}")
            return False


class AttendanceListView(APIView):

    @extend_schema(
        summary="Listar registros de asistencia",
        description="Obtiene una lista de todos los registros de asistencia en el sistema.",
        responses={
            200: OpenApiResponse(
                response=AttendanceSerializer(many=True),
                description="Lista de registros de asistencia"
            ),
        },
        tags=['Asistencias']
    )
    def get(self, request):
        records = AttendanceRecord.objects.all()
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)