# 🎨 Kalon Art Gallery - Sistema CRUD con Autenticación

## 📋 Descripción

**Kalon Art Gallery** es una aplicación web completa desarrollada en Flask que permite la gestión y visualización de una galería de arte digital. El sistema cuenta con autenticación de usuarios, roles diferenciados y un panel de administración robusto para el manejo de cuadros y productos.

## 🎯 Objetivo del Ejercicio

Este proyecto fue desarrollado con un **enfoque especial en pruebas automatizadas**, implementando una suite completa de testing que incluye:

- ✅ Pruebas unitarias
- ✅ Pruebas de integración
- ✅ Pruebas de endpoints API
- ✅ Validación de formularios
- ✅ Pruebas de autenticación y autorización
- ✅ Cobertura de código del 95%+

## 🛠️ Herramientas y Tecnologías

### Backend
- **Flask** - Framework web de Python
- **SQLite** - Base de datos
- **Flask Sessions** - Manejo de sesiones de usuario

### Frontend
- **HTML5** - Estructura semántica
- **CSS3 + Bootstrap 5** - Diseño responsive y moderno
- **JavaScript (Vanilla)** - Interactividad y validaciones
- **Font Awesome** - Iconografía

### Testing
- **unittest** - Framework de pruebas de Python
- **Coverage.py** - Análisis de cobertura de código

### Herramientas de Desarrollo
- **Git** - Control de versiones
- **PowerShell** - Terminal de comandos

## ✨ Mejoras Aplicadas

### 🔒 Sistema de Autenticación
- Registro y login de usuarios
- Roles diferenciados (usuario/admin)
- Sesiones seguras
- Protección de rutas administrativas

### 🎨 Interfaz de Usuario
- Diseño responsive con Bootstrap 5
- Navegación dinámica según estado de autenticación
- Alertas y confirmaciones interactivas
- Interfaz moderna y profesional

### 📊 Panel de Administración
- CRUD completo para productos y cuadros
- Validaciones frontend y backend
- Filtros y búsqueda en tiempo real
- Ordenamiento de tablas
- Confirmaciones antes de eliminar

### 🖼️ Gestión de Galería
- Subida y manejo de imágenes
- Visualización de cuadros en página principal
- Gestión completa desde panel admin

### 🧪 Testing Robusto
- Suite completa de 25+ pruebas
- Cobertura de código superior al 95%
- Pruebas automatizadas de todos los endpoints
- Validación de casos edge

### 🔧 Optimizaciones Técnicas
- Validaciones robustas en frontend y backend
- Manejo de errores mejorado
- Código modularizado y mantenible
- Base de datos normalizada

## 🚀 Cómo Clonar y Ejecutar el Proyecto

### Prerrequisitos
- Python 3.8 o superior
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/DeveloperXPK/KalonWebPageFinal.git
```

2. **Crear entorno virtual**
```bash
python -m venv venv
```

3. **Activar entorno virtual**
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Instalar dependencias**
```bash
pip install flask
```

5. **Inicializar base de datos**
```bash
python backend.py
```

6. **Crear usuario administrador (opcional)**
```bash
python crear_admin.py
```

7. **Insertar datos de ejemplo (opcional)**
```bash
python insertar_datos_ejemplo.py
```

### Ejecución

```bash
python backend.py
```

La aplicación estará disponible en: `http://localhost:5000`

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
python ejecutar_pruebas.py

# Ver reporte de cobertura
python -m http.server 8000 -d htmlcov
# Luego ir a: http://localhost:8000
```

## 📁 Estructura del Proyecto

```
KalonWebPageFinal/
├── backend.py              # Aplicación principal Flask
├── productos.db            # Base de datos SQLite
├── crear_admin.py          # Script para crear usuario admin
├── insertar_datos_ejemplo.py # Datos de prueba
├── ejecutar_pruebas.py     # Suite de testing
├── static/
│   ├── style.css          # Estilos personalizados
│   ├── script.js          # JavaScript para productos
│   ├── admin.js           # JavaScript para cuadros
│   └── images/            # Imágenes estáticas
├── templates/
│   ├── base.html          # Template base
│   ├── index.html         # Panel administración
│   ├── inicio.html        # Página principal
│   ├── Estructura/
│   │   └── header.html    # Navegación
│   └── auth/
│       ├── login.html     # Formulario login
│       └── register.html  # Formulario registro
├── tests/                 # Suite de pruebas
├── htmlcov/              # Reportes de cobertura
└── venv/                 # Entorno virtual
```

## 👥 Usuarios de Prueba

### Administrador
- **Email:** admin@kalon.com
- **Contraseña:** admin123
- **Permisos:** Acceso completo al panel de administración

### Usuario Regular
- **Email:** usuario@kalon.com
- **Contraseña:** user123
- **Permisos:** Navegación básica

## 🎯 Funcionalidades Principales

### Para Visitantes
- ✅ Ver galería de cuadros
- ✅ Registro de nueva cuenta
- ✅ Inicio de sesión

### Para Usuarios Registrados
- ✅ Perfil de usuario
- ✅ Navegación personalizada
- ✅ Cerrar sesión

### Para Administradores
- ✅ Gestión completa de productos
- ✅ Gestión completa de cuadros
- ✅ Subida de imágenes
- ✅ Panel de administración completo
- ✅ Gestión de usuarios

## 📈 Cobertura de Pruebas

El proyecto cuenta con una cobertura de testing superior al **95%**, incluyendo:

- Pruebas de endpoints API
- Validaciones de formularios
- Autenticación y autorización
- Manejo de errores
- Casos edge y límite

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/modificacion`)
3. Commit tus cambios (`git commit -m 'Detalles de las modificaciones'`)
4. Push a la rama (`git push origin feature/modificacion`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Créditos del Autor

**Desarrollado por:** [Andres Giraldo]  
**Email:** [andresgiraldo05a@gmail.com]  
**GitHub:** [https://github.com/DeveloperXPK] 
**LinkedIn:** [https://www.linkedin.com/in/andres-giraldo-760b2522b]  

### Agradecimientos

- A la comunidad de Flask por la excelente documentación
- A Bootstrap por el framework CSS
- A Font Awesome por los iconos

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!** ⭐
