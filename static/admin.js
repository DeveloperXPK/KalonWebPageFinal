// Variables globales
let cuadros = [];
let cuadrosFiltrados = [];
let editandoCuadro = false;
let cuadroIdEliminar = null;

// Cargar cuadros al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarCuadros();
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();

    const alertHtml = `
        <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.insertAdjacentHTML('afterbegin', alertHtml);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Función para cargar cuadros
async function cargarCuadros() {
    try {
        const response = await fetch('/cuadros');
        if (!response.ok) {
            throw new Error('Error al cargar cuadros');
        }

        cuadros = await response.json();
        cuadrosFiltrados = [...cuadros];
        actualizarTabla();
        actualizarContador();

    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los cuadros: ' + error.message, 'danger');
    }
}

// Función para actualizar la tabla
function actualizarTabla() {
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';

    if (cuadrosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-images fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay cuadros para mostrar</p>
                </td>
            </tr>
        `;
        return;
    }

    cuadrosFiltrados.forEach(cuadro => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cuadro.id}</td>
            <td class="imagen-cell">
                ${cuadro.imagen ?
                `<img src="/static/images/${cuadro.imagen}" class="imagen-preview" alt="${cuadro.nombre}" onerror="this.src='/static/images/no-image.png'">` :
                '<i class="fas fa-image fa-2x text-muted"></i>'
            }
            </td>
            <td><strong>${cuadro.nombre}</strong></td>
            <td>$${parseFloat(cuadro.precio).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
            <td>${cuadro.descripcion || '<em class="text-muted">Sin descripción</em>'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarCuadro(${cuadro.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${cuadro.id}, '${cuadro.nombre.replace(/'/g, "\\\'")}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Función para actualizar contador
function actualizarContador() {
    document.getElementById('total-cuadros').textContent = `Total: ${cuadrosFiltrados.length}`;
}

// Función para preview de imagen
function previewImagen(input) {
    const file = input.files[0];
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('preview-imagen');

    if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            mostrarAlerta('Por favor selecciona un archivo de imagen válido', 'danger');
            input.value = '';
            return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            mostrarAlerta('La imagen no puede superar 5MB de tamaño', 'danger');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
    }
}

// Función para eliminar imagen del preview
function eliminarImagen() {
    document.getElementById('imagen').value = '';
    document.getElementById('preview-container').style.display = 'none';
}

// Función para validar formulario
function validarFormulario() {
    let valido = true;
    const errores = {};

    // Validar nombre
    const nombre = document.getElementById('nombre').value.trim();
    if (!nombre) {
        errores.nombre = 'El nombre es obligatorio';
        valido = false;
    } else if (nombre.length < 2) {
        errores.nombre = 'El nombre debe tener al menos 2 caracteres';
        valido = false;
    } else if (nombre.length > 100) {
        errores.nombre = 'El nombre no puede exceder 100 caracteres';
        valido = false;
    }

    // Validar precio
    const precio = parseFloat(document.getElementById('precio').value);
    if (!precio || precio <= 0) {
        errores.precio = 'El precio debe ser mayor a 0';
        valido = false;
    } else if (precio > 1000000) {
        errores.precio = 'El precio no puede exceder $1,000,000';
        valido = false;
    }

    // Validar descripción
    const descripcion = document.getElementById('descripcion').value.trim();
    if (descripcion.length > 500) {
        errores.descripcion = 'La descripción no puede exceder 500 caracteres';
        valido = false;
    }

    // Mostrar errores
    ['nombre', 'precio', 'descripcion'].forEach(campo => {
        const input = document.getElementById(campo);
        const errorDiv = document.getElementById(`error-${campo}`);

        if (errores[campo]) {
            input.classList.add('is-invalid');
            if (errorDiv) errorDiv.textContent = errores[campo];
        } else {
            input.classList.remove('is-invalid');
            if (errorDiv) errorDiv.textContent = '';
        }
    });

    return valido;
}

// Función para guardar cuadro
async function guardarCuadro() {
    if (!validarFormulario()) {
        mostrarAlerta('Por favor corrige los errores en el formulario', 'danger');
        return;
    }

    const formData = new FormData();
    const cuadroId = document.getElementById('cuadro-id').value;

    // Datos del cuadro
    formData.append('nombre', document.getElementById('nombre').value.trim());
    formData.append('precio', document.getElementById('precio').value);
    formData.append('descripcion', document.getElementById('descripcion').value.trim());

    // Imagen
    const imagenFile = document.getElementById('imagen').files[0];
    if (imagenFile) {
        formData.append('imagen', imagenFile);
    }

    try {
        let url = '/cuadros';
        let method = 'POST';

        if (editandoCuadro && cuadroId) {
            url = `/cuadros/${cuadroId}`;
            method = 'PUT';
        }

        // Para PUT, necesitamos enviar JSON en lugar de FormData
        let requestOptions;
        if (method === 'PUT') {
            requestOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: document.getElementById('nombre').value.trim(),
                    precio: parseFloat(document.getElementById('precio').value),
                    descripcion: document.getElementById('descripcion').value.trim(),
                    imagen: imagenFile ? imagenFile.name : ''
                })
            };
        } else {
            // Convertir FormData a JSON para POST
            const cuadroData = {
                nombre: document.getElementById('nombre').value.trim(),
                precio: parseFloat(document.getElementById('precio').value),
                descripcion: document.getElementById('descripcion').value.trim(),
                imagen: imagenFile ? imagenFile.name : ''
            };

            requestOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cuadroData)
            };
        }

        const response = await fetch(url, requestOptions);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al guardar el cuadro');
        }

        mostrarAlerta(editandoCuadro ? 'Cuadro actualizado exitosamente' : 'Cuadro creado exitosamente', 'success');
        limpiarFormulario();
        await cargarCuadros();

    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al guardar: ' + error.message, 'danger');
    }
}

// Función para editar cuadro
async function editarCuadro(id) {
    try {
        const response = await fetch(`/cuadros/${id}`);
        if (!response.ok) {
            throw new Error('Error al cargar el cuadro');
        }

        const cuadro = await response.json();

        // Llenar formulario
        document.getElementById('cuadro-id').value = cuadro.id;
        document.getElementById('nombre').value = cuadro.nombre;
        document.getElementById('precio').value = cuadro.precio;
        document.getElementById('descripcion').value = cuadro.descripcion || '';

        // Mostrar imagen actual si existe
        if (cuadro.imagen) {
            const previewImg = document.getElementById('preview-imagen');
            const previewContainer = document.getElementById('preview-container');
            previewImg.src = `/static/images/${cuadro.imagen}`;
            previewContainer.style.display = 'block';
        }

        // Actualizar UI
        editandoCuadro = true;
        document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Cuadro';
        document.getElementById('btn-text').textContent = 'Actualizar Cuadro';

        // Scroll al formulario
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

        mostrarAlerta('Cuadro cargado para edición', 'info');

    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar el cuadro: ' + error.message, 'danger');
    }
}

// Función para confirmar eliminación
function confirmarEliminar(id, nombre) {
    cuadroIdEliminar = id;
    document.getElementById('nombreCuadroEliminar').textContent = nombre;

    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
    modal.show();

    // Configurar evento del botón confirmar
    document.getElementById('btnConfirmarEliminar').onclick = function () {
        eliminarCuadro(id);
        modal.hide();
    };
}

// Función para eliminar cuadro
async function eliminarCuadro(id) {
    try {
        const response = await fetch(`/cuadros/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al eliminar el cuadro');
        }

        mostrarAlerta('Cuadro eliminado exitosamente', 'success');
        await cargarCuadros();

    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar: ' + error.message, 'danger');
    }
}

// Función para cancelar edición
function cancelarEdicion() {
    limpiarFormulario();
    mostrarAlerta('Edición cancelada', 'info');
}

// Función para limpiar formulario
function limpiarFormulario() {
    document.getElementById('cuadro-form').reset();
    document.getElementById('cuadro-id').value = '';
    document.getElementById('preview-container').style.display = 'none';

    // Limpiar clases de validación
    ['nombre', 'precio', 'descripcion'].forEach(campo => {
        const input = document.getElementById(campo);
        input.classList.remove('is-invalid', 'is-valid');
        const errorDiv = document.getElementById(`error-${campo}`);
        if (errorDiv) errorDiv.textContent = '';
    });

    // Resetear UI
    editandoCuadro = false;
    document.getElementById('form-title').innerHTML = '<i class="fas fa-plus"></i> Agregar Nuevo Cuadro';
    document.getElementById('btn-text').textContent = 'Guardar Cuadro';
}

// Función para filtrar cuadros
function filtrarCuadros() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const filtroPrecio = document.getElementById('filtro-precio').value;

    cuadrosFiltrados = cuadros.filter(cuadro => {
        // Filtro por texto
        const coincideTexto = !busqueda ||
            cuadro.nombre.toLowerCase().includes(busqueda) ||
            (cuadro.descripcion && cuadro.descripcion.toLowerCase().includes(busqueda));

        // Filtro por precio
        let coincidePrecio = true;
        if (filtroPrecio) {
            const precio = parseFloat(cuadro.precio);
            switch (filtroPrecio) {
                case '0-500':
                    coincidePrecio = precio >= 0 && precio <= 500;
                    break;
                case '500-1000':
                    coincidePrecio = precio > 500 && precio <= 1000;
                    break;
                case '1000-2000':
                    coincidePrecio = precio > 1000 && precio <= 2000;
                    break;
                case '2000+':
                    coincidePrecio = precio > 2000;
                    break;
            }
        }

        return coincideTexto && coincidePrecio;
    });

    actualizarTabla();
    actualizarContador();
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('busqueda').value = '';
    document.getElementById('filtro-precio').value = '';
    cuadrosFiltrados = [...cuadros];
    actualizarTabla();
    actualizarContador();
    mostrarAlerta('Filtros limpiados', 'info');
}

// Función para ordenar tabla
let ordenActual = { columna: null, direccion: 'asc' };

function ordenarTabla(columnaIndex) {
    const columnas = ['id', 'imagen', 'nombre', 'precio', 'descripcion'];
    const columna = columnas[columnaIndex];

    if (columna === 'imagen') return; // No ordenar por imagen

    // Cambiar dirección si es la misma columna
    if (ordenActual.columna === columna) {
        ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        ordenActual.columna = columna;
        ordenActual.direccion = 'asc';
    }

    cuadrosFiltrados.sort((a, b) => {
        let valorA = a[columna];
        let valorB = b[columna];

        // Convertir a número si es precio
        if (columna === 'precio') {
            valorA = parseFloat(valorA);
            valorB = parseFloat(valorB);
        } else if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }

        if (valorA < valorB) {
            return ordenActual.direccion === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
            return ordenActual.direccion === 'asc' ? 1 : -1;
        }
        return 0;
    });

    actualizarTabla();

    // Actualizar iconos de ordenamiento
    document.querySelectorAll('th i.fas').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const thActivo = document.querySelector(`th:nth-child(${columnaIndex + 1}) i`);
    if (thActivo) {
        thActivo.className = `fas fa-sort-${ordenActual.direccion === 'asc' ? 'up' : 'down'}`;
    }
} 