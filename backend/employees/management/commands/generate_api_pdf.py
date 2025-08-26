from django.core.management.base import BaseCommand
from django.conf import settings
import os

from employees.swagger_to_pdf import convert_swagger_to_pdf


class Command(BaseCommand):
    help = 'Genera documentación PDF de la API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='api_documentation.pdf',
            help='Nombre del archivo PDF de salida'
        )

    def handle(self, *args, **options):
        swagger_file = os.path.join(settings.BASE_DIR, 'schema.yml')
        output_file = options['output']

        self.stdout.write('Generando documentación PDF con xhtml2pdf...')

        result = convert_swagger_to_pdf(swagger_file, output_file)

        if result:
            self.stdout.write(
                self.style.SUCCESS(f'✅ PDF generado: {output_file}')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Error generando PDF')
            )