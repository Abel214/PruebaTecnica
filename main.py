import http.server
import socketserver
import webbrowser
import os

PORT = 5000


class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="frontend", **kwargs)


def main():

    if not os.path.exists("frontend"):
        print(" Error: No se encontró la carpeta 'frontend'")
        return

    if not os.path.exists("frontend/index.html"):
        print(" Error: No se encontró 'index.html' en la carpeta frontend")
        return

    print(f" Servidor iniciado en http://localhost:{PORT}")
    print(" Sirviendo archivos desde: ./frontend/")
    print("Presiona Ctrl+C para detener")
    webbrowser.open(f'http://localhost:{PORT}')

    try:
        with socketserver.TCPServer(("", PORT), FrontendHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n Servidor detenido")


if __name__ == "__main__":
    main()