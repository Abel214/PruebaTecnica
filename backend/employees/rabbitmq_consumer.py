
import json
import time
import os
import sys
import django
import pika

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from employees.models import Employee


class SimpleEmployeeValidator:
    def __init__(self):
        self.connection = None
        self.channel = None

    def connect(self, max_retries=5, retry_interval=5):
        for attempt in range(max_retries):
            try:
                print(f"🔌 Intentando conectar a RabbitMQ (intento {attempt + 1}/{max_retries})...")

                self.connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host='localhost',
                        port=5672,
                        connection_attempts=3,
                        retry_delay=3
                    )
                )
                self.channel = self.connection.channel()

                self.channel.queue_declare(queue='validate_employee_request', durable=True)
                self.channel.queue_declare(queue='validate_employee_response', durable=True)

                print("✅ Conectado a RabbitMQ exitosamente!")
                return True

            except Exception as e:
                print(f"❌ Error en intento {attempt + 1}: {e}")
                if attempt < max_retries - 1:
                    print(f"⏳ Reintentando en {retry_interval} segundos...")
                    time.sleep(retry_interval)
                else:
                    print("🚫 No se pudo conectar después de varios intentos")
                    return False
        return False

    def validate_callback(self, ch, method, properties, body):

        try:

            message = json.loads(body)
            employee_id = message.get('employee_id')

            print(f"📨 Validando empleado ID: {employee_id}")

            try:
                exists = Employee.objects.filter(id=employee_id).exists()
                response = {
                    'valid': exists,
                    'employee_id': employee_id,
                    'message': 'Empleado válido' if exists else 'Empleado no encontrado'
                }
            except Exception as db_error:
                print(f"❌ Error de base de datos: {db_error}")
                response = {
                    'valid': False,
                    'employee_id': employee_id,
                    'message': 'Error interno del servidor'
                }


            self.channel.basic_publish(
                exchange='',
                routing_key='validate_employee_response',
                body=json.dumps(response),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                )
            )

            print(f"✅ Respuesta enviada: {response}")

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except json.JSONDecodeError:
            print("❌ Error: Mensaje JSON inválido")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            print(f"❌ Error procesando mensaje: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start_consuming(self):

        if not self.connect():
            return

        try:
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(
                queue='validate_employee_request',
                on_message_callback=self.validate_callback,
                auto_ack=False
            )

            print("🔄 Iniciando consumo de mensajes...")
            print("📋 Esperando solicitudes de validación...")
            print("💡 Presiona CTRL+C para detener")

            self.channel.start_consuming()

        except KeyboardInterrupt:
            print("\n🛑 Deteniendo consumidor...")
        except Exception as e:
            print(f"❌ Error en consumo: {e}")
        finally:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                print("🔌 Conexión cerrada")


def start_simple_consumer():
    print("=" * 50)
    print("🚀 INICIANDO CONSUMIDOR RABBITMQ")
    print("=" * 50)

    consumer = SimpleEmployeeValidator()
    consumer.start_consuming()


if __name__ == '__main__':
    start_simple_consumer()