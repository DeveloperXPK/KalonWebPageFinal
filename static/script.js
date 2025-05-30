// ============ VARIABLES GLOBALES ============
let productoEditandoId = null;
let productosOriginales = [];
let ordenAscendente = true;

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function () {
    cargarProductos();
    configurarValidadores();
});

// ============ GESTIÓN DE PRODUCTOS ============
async function cargarProductos() {
    try {
        mostrarCargando(true);
        const response = await fetch('/productos');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        productosOriginales = productos;
        renderizarTabla(productos);
        actualizarContador(productos.length);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarAlerta('Error al cargar los productos', 'danger');
    } finally {
        mostrarCargando(false);
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tabla-body');

    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-inbox fa-2x mb-2"></i><br>
                    No hay productos para mostrar
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productos.map(producto => `
        <tr data-id="${producto.id}">
            <td>${producto.id}</td>
            <td>${validarTexto(producto.nombre)}</td>
            <td>$${formatearPrecio(producto.precio)}</td>
            <td>${validarTexto(producto.descripcion) || '<em class="text-muted">Sin descripción</em>'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${producto.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============ VALIDACIONES ============
function configurarValidadores() {
    const nombre = document.getElementById('nombre');
    const precio = document.getElementById('precio');
    const descripcion = document.getElementById('descripcion');

    // Validación en tiempo real
    nombre.addEventListener('input', () => validarCampo('nombre', nombre.value));
    precio.addEventListener('input', () => validarCampo('precio', precio.value));
    descripcion.addEventListener('input', () => validarCampo('descripcion', descripcion.value));

    // Prevenir espacios al inicio en nombre
    nombre.addEventListener('keypress', function (e) {
        if (this.value === '' && e.key === ' ') {
            e.preventDefault();
        }
    });

    // Solo números y punto decimal en precio
    precio.addEventListener('keypress', function (e) {
        if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

function validarCampo(campo, valor) {
    const input = document.getElementById(campo);
    const errorDiv = document.getElementById(`error-${campo}`);
    let esValido = true;
    let mensaje = '';

    // Limpiar clases previas
    input.classList.remove('is-valid', 'is-invalid');

    switch (campo) {
        case 'nombre':
            if (!valor.trim()) {
                esValido = false;
                mensaje = 'El nombre es obligatorio';
            } else if (valor.trim().length < 2) {
                esValido = false;
                mensaje = 'El nombre debe tener al menos 2 caracteres';
            } else if (valor.length > 100) {
                esValido = false;
                mensaje = 'El nombre no puede exceder 100 caracteres';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.-]+$/.test(valor)) {
                esValido = false;
                mensaje = 'El nombre contiene caracteres no válidos';
            }
            break;

        case 'precio':
            const precioNum = parseFloat(valor);
            if (!valor || isNaN(precioNum)) {
                esValido = false;
                mensaje = 'El precio es obligatorio y debe ser un número';
            } else if (precioNum <= 0) {
                esValido = false;
                mensaje = 'El precio debe ser mayor a 0';
            } else if (precioNum > 1000000) {
                esValido = false;
                mensaje = 'El precio no puede exceder $1,000,000';
            }
            break;

        case 'descripcion':
            if (valor.length > 500) {
                esValido = false;
                mensaje = 'La descripción no puede exceder 500 caracteres';
            }
            break;
    }

    if (esValido) {
        input.classList.add('is-valid');
        errorDiv.textContent = '';
    } else {
        input.classList.add('is-invalid');
        errorDiv.textContent = mensaje;
    }

    return esValido;
}

function validarFormulario() {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const descripcion = document.getElementById('descripcion').value;

    const nombreValido = validarCampo('nombre', nombre);
    const precioValido = validarCampo('precio', precio);
    const descripcionValida = validarCampo('descripcion', descripcion);

    return nombreValido && precioValido && descripcionValida;
}

// ============ OPERACIONES CRUD ============
async function guardarProducto() {
    if (!validarFormulario()) {
        mostrarAlerta('Por favor, corrige los errores en el formulario', 'warning');
        return;
    }

    const producto = {
        nombre: document.getElementById('nombre').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        descripcion: document.getElementById('descripcion').value.trim()
    };

    const url = productoEditandoId ? `/productos/${productoEditandoId}` : '/productos';
    const method = productoEditandoId ? 'PUT' : 'POST';
    const accion = productoEditandoId ? 'actualizado' : 'creado';

    try {
        mostrarCargando(true);

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        mostrarAlerta(`Producto ${accion} exitosamente`, 'success');
        await cargarProductos();
        cancelarEdicion();

    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarAlerta('Error al guardar el producto', 'danger');
    } finally {
        mostrarCargando(false);
    }
}

async function editarProducto(id) {
    try {
        mostrarCargando(true);

        const response = await fetch(`/productos/${id}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const producto = await response.json();

        productoEditandoId = id;
        document.getElementById('producto-id').value = id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('descripcion').value = producto.descripcion || '';

        // Cambiar títulos y botones
        document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
        document.getElementById('btn-text').textContent = 'Actualizar Producto';

        // Scroll al formulario
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

        // Enfocar primer campo
        document.getElementById('nombre').focus();

    } catch (error) {
        console.error('Error al cargar producto:', error);
        mostrarAlerta('Error al cargar el producto', 'danger');
    } finally {
        mostrarCargando(false);
    }
}

function eliminarProducto(id) {
    // Obtener nombre del producto para confirmación personalizada
    const fila = document.querySelector(`tr[data-id="${id}"]`);
    const nombreProducto = fila.cells[1].textContent;

    // Confirmación personalizada
    const modal = crearModalConfirmacion(
        'Eliminar Producto',
        `¿Estás seguro de que deseas eliminar el producto "${nombreProducto}"?`,
        'Esta acción no se puede deshacer.',
        async () => {
            try {
                mostrarCargando(true);

                const response = await fetch(`/productos/${id}`, { method: 'DELETE' });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                mostrarAlerta('Producto eliminado exitosamente', 'success');
                await cargarProductos();

            } catch (error) {
                console.error('Error al eliminar producto:', error);
                mostrarAlerta('Error al eliminar el producto', 'danger');
            } finally {
                mostrarCargando(false);
            }
        }
    );

    modal.show();
}

function cancelarEdicion() {
    productoEditandoId = null;
    document.getElementById('producto-form').reset();
    document.getElementById('producto-id').value = '';

    // Restaurar títulos
    document.getElementById('form-title').innerHTML = '<i class="fas fa-plus"></i> Agregar Nuevo Producto';
    document.getElementById('btn-text').textContent = 'Guardar Producto';

    // Limpiar validaciones
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });

    document.querySelectorAll('.invalid-feedback').forEach(div => {
        div.textContent = '';
    });
}

// ============ BÚSQUEDA Y FILTROS ============
function filtrarProductos() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const filtroPrecio = document.getElementById('filtro-precio').value;

    let productosFiltrados = productosOriginales.filter(producto => {
        // Filtro de búsqueda
        const coincideBusqueda = busqueda === '' ||
            producto.nombre.toLowerCase().includes(busqueda) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda));

        // Filtro de precio
        let coincidePrecio = true;
        if (filtroPrecio) {
            const precio = parseFloat(producto.precio);
            switch (filtroPrecio) {
                case '0-100':
                    coincidePrecio = precio >= 0 && precio <= 100;
                    break;
                case '100-500':
                    coincidePrecio = precio > 100 && precio <= 500;
                    break;
                case '500-1000':
                    coincidePrecio = precio > 500 && precio <= 1000;
                    break;
                case '1000+':
                    coincidePrecio = precio > 1000;
                    break;
            }
        }

        return coincideBusqueda && coincidePrecio;
    });

    renderizarTabla(productosFiltrados);
    actualizarContador(productosFiltrados.length);
}

function limpiarFiltros() {
    document.getElementById('busqueda').value = '';
    document.getElementById('filtro-precio').value = '';
    renderizarTabla(productosOriginales);
    actualizarContador(productosOriginales.length);
}

// ============ ORDENAMIENTO ============
function ordenarTabla(columna) {
    const columnNames = ['id', 'nombre', 'precio', 'descripcion'];
    const campo = columnNames[columna];

    productosOriginales.sort((a, b) => {
        let valorA = a[campo];
        let valorB = b[campo];

        // Conversión para números
        if (campo === 'precio' || campo === 'id') {
            valorA = parseFloat(valorA);
            valorB = parseFloat(valorB);
        } else {
            valorA = (valorA || '').toString().toLowerCase();
            valorB = (valorB || '').toString().toLowerCase();
        }

        if (ordenAscendente) {
            return valorA > valorB ? 1 : -1;
        } else {
            return valorA < valorB ? 1 : -1;
        }
    });

    ordenAscendente = !ordenAscendente;
    filtrarProductos(); // Aplica filtros actuales
}

// ============ UTILIDADES ============
function mostrarAlerta(mensaje, tipo = 'info', duracion = 4000) {
    const alertContainer = document.getElementById('alert-container');

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.innerHTML = `
        <strong>${tipo === 'success' ? '¡Éxito!' : tipo === 'danger' ? '¡Error!' : '¡Atención!'}</strong>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alerta);

    // Auto-ocultar
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, duracion);
}

function crearModalConfirmacion(titulo, mensaje, submensaje, onConfirm) {
    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${titulo}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>${mensaje}</strong></p>
                        <p class="text-muted">${submensaje}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirmarAccion">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal existente
    const existingModal = document.getElementById('confirmModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));

    document.getElementById('confirmarAccion').addEventListener('click', () => {
        modal.hide();
        onConfirm();
    });

    return modal;
}

function mostrarCargando(mostrar) {
    const btn = document.querySelector('.btn-crud');
    if (mostrar) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> ' + document.getElementById('btn-text').textContent;
    }
}

function actualizarContador(total) {
    document.getElementById('total-productos').textContent = `Total: ${total}`;
}

function formatearPrecio(precio) {
    return parseFloat(precio).toFixed(2);
}

function validarTexto(texto) {
    return texto ? texto.toString() : '';
}

// ============ EVENTOS GLOBALES ============
// Cerrar modales al hacer clic fuera
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        const modal = bootstrap.Modal.getInstance(e.target);
        if (modal) modal.hide();
    }
});

// Atajos de teclado
document.addEventListener('keydown', function (e) {
    // Ctrl+S para guardar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        guardarProducto();
    }

    // Escape para cancelar edición
    if (e.key === 'Escape') {
        cancelarEdicion();
    }
});
