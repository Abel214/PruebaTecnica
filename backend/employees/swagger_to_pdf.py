import yaml
import json
import os
from io import BytesIO

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from xhtml2pdf import pisa
from django.http import HttpResponse
from django.conf import settings


class SwaggerToPDFConverter:
    def __init__(self, swagger_file_path):
        self.swagger_file_path = swagger_file_path
        self.spec = None

    def load_swagger_spec(self):

        try:
            with open(self.swagger_file_path, 'r', encoding='utf-8') as f:
                if self.swagger_file_path.endswith('.json'):
                    self.spec = json.load(f)
                else:
                    self.spec = yaml.safe_load(f)
            return True
        except Exception as e:
            print(f"❌ Error cargando archivo Swagger: {e}")
            return False

    def generate_html_content(self):

        if not self.spec:
            return None

        info = self.spec.get('info', {})
        paths = self.spec.get('paths', {})
        components = self.spec.get('components', {})

        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{info.get('title', 'API Documentation')}</title>
            <style>
                {self.get_css_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                {self.generate_header(info)}
                {self.generate_paths_section(paths)}
                {self.generate_components_section(components)}
            </div>
        </body>
        </html>
        """

        return html_content

    def get_css_styles(self):

        return """
        body { 
            font-family: Helvetica, Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            padding: 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
        .header h1 { color: #007bff; font-size: 24px; margin-bottom: 10px; }
        .header .description { color: #666; font-size: 14px; }
        .header .version { background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }

        .section { margin-bottom: 25px; }
        .section h2 { color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px; }

        .endpoint { background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 15px; }
        .endpoint-header { margin-bottom: 10px; }
        .method { 
            padding: 3px 8px; 
            border-radius: 3px; 
            color: white; 
            font-weight: bold; 
            margin-right: 10px; 
            font-size: 11px; 
            display: inline-block;
        }
        .method-get { background: #28a745; }
        .method-post { background: #007bff; }
        .method-put { background: #ffc107; color: #000; }
        .method-delete { background: #dc3545; }
        .path { font-family: monospace; font-size: 14px; font-weight: bold; }
        .description { color: #666; margin-bottom: 10px; font-size: 13px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
        table th, table td { padding: 6px; text-align: left; border: 1px solid #dee2e6; }
        table th { background-color: #e9ecef; font-weight: bold; }

        .sub-title { font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; }

        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #6c757d; font-size: 11px; }
        """

    def generate_header(self, info):
        return f"""
        <div class="header">
            <h1>{info.get('title', 'API Documentation')}</h1>
            <div class="description">{info.get('description', '')}</div>
            <div class="version">Versión: {info.get('version', '1.0.0')}</div>
        </div>
        """

    def generate_paths_section(self, paths):
        paths_html = "<div class='section'><h2>Endpoints</h2>"

        for path, methods in paths.items():
            for method, details in methods.items():
                if method.upper() in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
                    paths_html += self.generate_endpoint_html(path, method.upper(), details)

        paths_html += "</div>"
        return paths_html

    def generate_endpoint_html(self, path, method, details):
        method_class = f"method method-{method.lower()}"

        return f"""
        <div class="endpoint">
            <div class="endpoint-header">
                <span class="{method_class}">{method}</span>
                <span class="path">{path}</span>
            </div>
            <div class="description">{details.get('description', '')}</div>
            {self.generate_responses_html(details.get('responses', {}))}
        </div>
        """

    def generate_responses_html(self, responses):
        if not responses:
            return ""

        rows = ""
        for code, response in responses.items():
            rows += f"<tr><td>{code}</td><td>{response.get('description', '')}</td></tr>"

        return f"""
        <div class="responses">
            <div class="sub-title">Respuestas</div>
            <table>
                <tr><th>Código</th><th>Descripción</th></tr>
                {rows}
            </table>
        </div>
        """

    def generate_components_section(self, components):
        if not components:
            return ""

        schemas_html = ""
        schemas = components.get('schemas', {})

        for schema_name, schema_def in schemas.items():
            schemas_html += f"""
            <div class="endpoint">
                <h3>{schema_name}</h3>
                <div class="description">{schema_def.get('description', '')}</div>
            </div>
            """

        return f"""
        <div class="section">
            <h2>Esquemas</h2>
            {schemas_html}
        </div>
        """ if schemas_html else ""

    def convert_to_pdf(self, output_file=None):
        """Convierte el Swagger a PDF usando xhtml2pdf"""
        try:
            if not self.load_swagger_spec():
                return None

            html_content = self.generate_html_content()
            if not html_content:
                return None

            # Crear PDF
            pdf_buffer = BytesIO()
            pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)

            if pisa_status.err:
                print("❌ Error creando PDF")
                return None

            pdf_data = pdf_buffer.getvalue()
            pdf_buffer.close()

            # Guardar archivo si se especifica
            if output_file:
                output_dir = os.path.dirname(output_file)
                if output_dir and not os.path.exists(output_dir):
                    os.makedirs(output_dir)

                with open(output_file, 'wb') as f:
                    f.write(pdf_data)
                print(f"✅ PDF generado: {output_file}")

            return pdf_data

        except Exception as e:
            print(f"❌ Error generando PDF: {e}")
            return None


def convert_swagger_to_pdf(swagger_file, output_file=None):

    converter = SwaggerToPDFConverter(swagger_file)
    return converter.convert_to_pdf(output_file)


class SwaggerPDFView(APIView):

    def get(self, request):
        swagger_file = os.path.join(settings.BASE_DIR, 'schema.yml')

        pdf_data = convert_swagger_to_pdf(swagger_file)

        if pdf_data:
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="api_documentation.pdf"'
            return response
        else:
            return Response(
                {"error": "Error generando documentación PDF"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )