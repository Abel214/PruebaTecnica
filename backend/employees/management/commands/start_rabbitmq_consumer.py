from django.core.management.base import BaseCommand
from employees.rabbitmq_consumer import start_consumer


class Command(BaseCommand):
    help = 'Inicia el consumidor RabbitMQ para validación de empleados'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Iniciando consumidor RabbitMQ...')
        )
        start_consumer()