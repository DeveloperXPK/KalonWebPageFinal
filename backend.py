from flask import Flask, request, jsonify, render_template
import sqlite3
import os

app = Flask(__name__)

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
            contraseña TEXT NOT NULL)''')
        db.commit()

def get_db():
    return sqlite3.connect(DATABASE)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/inicio')
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
        # Aquí implementarías la lógica de autenticación
        cursor = db.execute('SELECT * FROM usuarios WHERE email = ? AND contraseña = ?',
                           [data['email'], data['contraseña']])
        usuario = cursor.fetchone()
        if usuario:
            return jsonify({"mensaje": "Inicio de sesión exitoso", "usuario": usuario})
        else:
            return jsonify({"mensaje": "Credenciales incorrectas"}), 401
    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        # Aquí implementarías la lógica de registro
        db.execute('INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)',
                   [data['nombre'], data['email'], data['contraseña']])
        db.commit()
        # Por ahora solo retornamos un mensaje
        return jsonify({"mensaje": "Registro procesado", "nombre": data.get('nombre')})
    return render_template('auth/register.html')

@app.route('/productos', methods=['GET', 'POST'])
def productos():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json()
        db.execute('INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)',
                   [data['nombre'], data['precio'], data['descripcion']])
        db.commit()
        return jsonify({"mensaje": "Producto guardado correctamente"})
    cursor = db.execute('SELECT * FROM productos')
    productos = [dict(id=row[0], nombre=row[1], precio=row[2], descripcion=row[3]) for row in cursor.fetchall()]
    return jsonify(productos)

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

if __name__ == '__main__':
    init_db()
    app.run(debug=True)