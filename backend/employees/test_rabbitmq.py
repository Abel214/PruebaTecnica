# test_rabbitmq.py
import pika
import json
import time


def test_rabbitmq_connection():
    """Probar conexión a RabbitMQ"""
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters('localhost')
        )
        print("✅ Conexión a RabbitMQ exitosa!")
        connection.close()
        return True
    except Exception as e:
        print(f"❌ No se pudo conectar a RabbitMQ: {e}")
        return False


def send_test_message():
    """Enviar mensaje de prueba"""
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters('localhost')
        )
        channel = connection.channel()

        # Declarar colas CON durable=True (misma configuración)
        channel.queue_declare(queue='validate_employee_request', durable=True)
        channel.queue_declare(queue='validate_employee_response', durable=True)

        # Mensaje de prueba
        test_data = {'employee_id': 1}

        channel.basic_publish(
            exchange='',
            routing_key='validate_employee_request',
            body=json.dumps(test_data),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mensaje persistente
            )
        )

        print("✅ Mensaje de prueba enviado!")
        connection.close()

    except Exception as e:
        print(f"❌ Error enviando mensaje: {e}")


if __name__ == '__main__':
    print("🧪 Probando conexión RabbitMQ...")
    if test_rabbitmq_connection():
        send_test_message()