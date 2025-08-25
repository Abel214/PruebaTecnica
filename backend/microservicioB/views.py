# attendance/views.py
import json
import uuid
import pika

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AttendanceRecord
from microservicioB.serializer import AttendanceSerializer


class AttendanceView(APIView):
    def post(self, request):
        # Validar empleado via RabbitMQ primero
        employee_id = request.data.get('employee_id')

        if not self.validate_employee(employee_id):
            return Response(
                {"error": "Empleado no válido o no existe"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Si el empleado es válido, crear el registro
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def validate_employee(self, employee_id):
        """Validar empleado via RabbitMQ (implementación real)"""
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters('localhost')
            )
            channel = connection.channel()

            # Declarar colas
            channel.queue_declare(queue='validate_employee_request', durable=True)
            channel.queue_declare(queue='validate_employee_response', durable=True)

            # Configurar consumo de respuesta
            result = channel.queue_declare(queue='', exclusive=True)
            callback_queue = result.method.queue

            # Enviar mensaje de validación con correlation_id
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

            # Esperar respuesta
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
    def get(self, request):
        records = AttendanceRecord.objects.all()
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)