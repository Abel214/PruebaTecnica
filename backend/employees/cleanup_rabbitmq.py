# cleanup_rabbitmq.py
import pika


def cleanup_queues():
    """Eliminar y recrear las colas con la configuración correcta"""
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters('localhost')
        )
        channel = connection.channel()

        # Eliminar colas existentes
        channel.queue_delete(queue='validate_employee_request')
        channel.queue_delete(queue='validate_employee_response')

        print("✅ Colas eliminadas")

        # Crear colas nuevas con durable=True
        channel.queue_declare(queue='validate_employee_request', durable=True)
        channel.queue_declare(queue='validate_employee_response', durable=True)

        print("✅ Colas recreadas con durable=True")
        connection.close()

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == '__main__':
    cleanup_queues()