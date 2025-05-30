from flask import Flask, request, jsonify, render_template, session, redirect, url_for
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'asdfas234234as/l2432'  # Cambia esto en producción

DATABASE = os.path.join(os.path.dirname(__file__), 'productos.db')

def init_db():
    with app.app_context():
        db = sqlite3.connect(DATABASE)
        db.execute('''CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            descripcion TEXT)''')
        
        db.execute('''CREATE TABLE IF NOT EXISTS cuadros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            descripcion TEXT,
            imagen TEXT)''')
        
        db.execute('''CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            rol TEXT NOT NULL DEFAULT 'usuario',
            contraseña TEXT NOT NULL)''')
        
        db.commit()

def get_db():
    return sqlite3.connect(DATABASE)

@app.context_processor
def inject_user():
    """Hace disponible la información del usuario en todos los templates"""
    return dict(
        usuario_autenticado=session.get('autenticado', False),
        usuario_nombre=session.get('usuario_nombre', ''),
        usuario_email=session.get('usuario_email', ''),
        usuario_rol=session.get('usuario_rol', 'usuario')
    )

@app.route('/admin')
def admin():
    # Verificar que el usuario sea admin
    if not session.get('autenticado') or session.get('usuario_rol') != 'admin':
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/')
def inicio():
    db = get_db()
    cursor = db.execute('SELECT * FROM cuadros')
    cuadros = [dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3], imagen=row[4]) for row in cursor.fetchall()]
    return render_template('inicio.html', cuadros=cuadros)

@app.route('/login', methods=['GET', 'POST'])
def login():
    db = get_db() 
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        cursor = db.execute('SELECT * FROM usuarios WHERE email = ? AND contraseña = ?',
                           [data['email'], data['contraseña']])
        usuario = cursor.fetchone()
        print(usuario)
        if usuario:
            # Guardar información del usuario en la sesión
            session['usuario_id'] = usuario[0]
            session['usuario_nombre'] = usuario[1]
            session['usuario_email'] = usuario[2]
            session['usuario_rol'] = usuario[4]
            session['autenticado'] = True
            
            if request.is_json:
                return jsonify({"mensaje": "Inicio de sesión exitoso", "redirect": url_for('inicio')})
            else:
                return redirect(url_for('inicio'))
        else:
            if request.is_json:
                return jsonify({"mensaje": "Credenciales incorrectas"}), 401
            else:
                return render_template('auth/login.html', error="Credenciales incorrectas")
    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        # Verificar si el email ya existe
        cursor = db.execute('SELECT * FROM usuarios WHERE email = ?', [data['email']])
        if cursor.fetchone():
            if request.is_json:
                return jsonify({"mensaje": "El email ya está registrado"}), 400
            else:
                return render_template('auth/register.html', error="El email ya está registrado")
        
        # Insertar nuevo usuario
        db.execute('INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)',
                   [data['nombre'], data['email'], data['contraseña']])
        db.commit()
        
        if request.is_json:
            return jsonify({"mensaje": "Registro exitoso", "redirect": url_for('login')})
        else:
            return redirect(url_for('login'))
    return render_template('auth/register.html')

@app.route('/logout')
def logout():
    session.clear()  # Limpia toda la sesión
    return redirect(url_for('inicio'))

@app.route('/productos', methods=['GET', 'POST'])
def productos():
    db = get_db()
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validaciones del backend
            errores = []
            
            # Validar nombre
            if not data.get('nombre') or not data['nombre'].strip():
                errores.append("El nombre es obligatorio")
            elif len(data['nombre'].strip()) < 2:
                errores.append("El nombre debe tener al menos 2 caracteres")
            elif len(data['nombre']) > 100:
                errores.append("El nombre no puede exceder 100 caracteres")
            
            # Validar precio
            try:
                precio = float(data.get('precio', 0))
                if precio <= 0:
                    errores.append("El precio debe ser mayor a 0")
                elif precio > 1000000:
                    errores.append("El precio no puede exceder $1,000,000")
            except (ValueError, TypeError):
                errores.append("El precio debe ser un número válido")
                precio = 0
            
            # Validar descripción
            descripcion = data.get('descripcion', '').strip()
            if len(descripcion) > 500:
                errores.append("La descripción no puede exceder 500 caracteres")
            
            if errores:
                return jsonify({"error": "Datos inválidos", "detalles": errores}), 400
            
            # Insertar si todo es válido
            db.execute('INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)',
                       [data['nombre'].strip(), precio, descripcion])
            db.commit()
            return jsonify({"mensaje": "Producto guardado correctamente"})
            
        except Exception as e:
            return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500
    
    # GET request
    try:
        cursor = db.execute('SELECT * FROM productos ORDER BY id DESC')
        productos = [dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3]) for row in cursor.fetchall()]
        return jsonify(productos)
    except Exception as e:
        return jsonify({"error": "Error al obtener productos", "detalle": str(e)}), 500

@app.route('/productos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def producto_id(id):
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute('SELECT * FROM productos WHERE id = ?', [id])
        row = cursor.fetchone()
        if row:
            return jsonify(dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3]))
        else:
            return jsonify({"error": "Producto no encontrado"}), 404

    elif request.method == 'PUT':
        data = request.get_json()
        db.execute('UPDATE productos SET nombre = ?, precio = ?, descripcion = ? WHERE id = ?',
                   [data['nombre'], data['precio'], data['descripcion'], id])
        db.commit()
        return jsonify({"mensaje": "Producto actualizado"})

    elif request.method == 'DELETE':
        db.execute('DELETE FROM productos WHERE id = ?', [id])
        db.commit()
        return jsonify({"mensaje": "Producto eliminado"})

@app.route('/cuadros', methods=['GET', 'POST'])
def cuadros():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json()
        db.execute('INSERT INTO cuadros (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)',
                   [data['nombre'], data['precio'], data['descripcion'], data.get('imagen', '')])
        db.commit()
        return jsonify({"mensaje": "Cuadro guardado correctamente"})
    cursor = db.execute('SELECT * FROM cuadros')
    cuadros = [dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3], imagen=row[4]) for row in cursor.fetchall()]
    return jsonify(cuadros)

@app.route('/cuadros/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def cuadro_id(id):
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute('SELECT * FROM cuadros WHERE id = ?', [id])
        row = cursor.fetchone()
        if row:
            return jsonify(dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3], imagen=row[4]))
        else:
            return jsonify({"error": "Cuadro no encontrado"}), 404

    elif request.method == 'PUT':
        data = request.get_json()
        db.execute('UPDATE cuadros SET nombre = ?, precio = ?, descripcion = ?, imagen = ? WHERE id = ?',
                   [data['nombre'], data['precio'], data['descripcion'], data.get('imagen', ''), id])
        db.commit()
        return jsonify({"mensaje": "Cuadro actualizado"})

    elif request.method == 'DELETE':
        db.execute('DELETE FROM cuadros WHERE id = ?', [id])
        db.commit()
        return jsonify({"mensaje": "Cuadro eliminado"})

@app.route('/usuarios', methods=['GET'])
def usuarios():
    # Solo admins pueden ver usuarios
    if not session.get('autenticado') or session.get('usuario_rol') != 'admin':
        return jsonify({"error": "Acceso denegado"}), 403
    
    db = get_db()
    cursor = db.execute('SELECT id, nombre, email, rol FROM usuarios')
    usuarios = [dict(id=row[0], nombre=row[1], email=row[2], rol=row[3]) for row in cursor.fetchall()]
    return jsonify(usuarios)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)