# PruebaTecnica
Prueba técnica empresa PENTVIEW - Sistema de Gestión de Empleados y Asistencias
Imágenes del programa:
   ![Alt text](https://i.postimg.cc/vT1g4wjr/Screenshot-2025-08-25-140716.png)
   ![Alt text](https://i.postimg.cc/C5FZ4fz4/Screenshot-2025-08-25-141610.png)
   
## 📋 Descripción
Sistema completo para la gestión de empleados y registro de asistencias con backend en Django REST Framework y frontend con interfaz web.

## 🛠️ Tecnologías Utilizadas
- **Backend**: Django REST Framework
- **Frontend**: HTML, CSS, JavaScript
- **Base de datos**: SQLite
- **Documentación**: Swagger
- **Message Broker**: RabbitMQ

## 📁 Estructura del Proyecto
```
PruebaTecnica/
├── backend/
│   ├── .venv/
│   ├── manage.py
│   └── ...
├── frontend/
│   ├── index.html
│   └── ...
└── main.py
```

## ⚙️ Instalación y Configuración

### 🔧 Configuración del Backend

1. **Navegar a la carpeta del backend:**
   ```bash
   cd backend
   ```

2. **Activar el entorno virtual:**
   ```bash
   # En Windows
   .venv/Scripts/activate
   
   # En Linux/Mac
   source .venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Ejecutar migraciones o simplemente hacer click en la base de datos creada :**
   ```bash
   python manage.py migrate
   ```
   ![Alt text](https://i.postimg.cc/N0hWV8BB/Screenshot-2025-08-25-141054.png)
5. **Ejecutar el servidor de desarrollo:**
   ```bash
   python manage.py runserver
   ```
   
   El backend estará disponible en: `http://localhost:8000`

### 🎨 Configuración del Frontend

1. **Ejecutar el servidor frontend:**
   ```bash
   python main.py
   ```

### 🐰 Configuración de RabbitMQ

1. **Instalar RabbitMQ** (si no está instalado):
   ```bash
   # Windows (con Chocolatey)
   choco install rabbitmq
   
   # Ubuntu/Debian
   sudo apt-get install rabbitmq-server
   
   # macOS (con Homebrew)
   brew install rabbitmq
   ```

2. **Iniciar el servicio RabbitMQ:**
   ```bash
   # Windows
   rabbitmq-service start
   
   # Linux/Mac
   sudo systemctl start rabbitmq-server
   ```

3. **Verificar estado del servicio:**
   ```bash
   rabbitmq-diagnostics status
   ```

## 🚀 Ejecución del Proyecto

### Orden recomendado de ejecución:

1. **Iniciar RabbitMQ** (debe estar corriendo antes que el backend)
2. **Iniciar Backend:**
   ```bash
   cd backend
   .venv/Scripts/activate
   python manage.py runserver
   ```
3. **Iniciar Frontend:**
   ```bash
   python main.py
   ```

## 📚 Documentación de la API

### Swagger/ReDoc
Una vez que el backend esté corriendo, puedes acceder a la documentación de la API:

- **Swagger UI**: http://localhost:8000/api/redoc/#tag/Asistencias/operation/attendance_create

### Endpoints Principales
Microservicio A:
- **Empleados**: `/api/employees/`
Microservicio B:
- **Asistencias**: `/attendance/`

## 👨‍💻 Autor
Desarrollado como prueba técnica para PENTVIEW
