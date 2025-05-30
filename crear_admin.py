import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), 'productos.db')

def crear_admin():
    db = sqlite3.connect(DATABASE)
    
    # Verificar si ya existe un admin
    cursor = db.execute('SELECT * FROM usuarios WHERE email = ?', ['admin@kalon.com'])
    if cursor.fetchone():
        print("El usuario administrador ya existe")
        return
    
    # Crear usuario admin
    db.execute('INSERT INTO usuarios (nombre, email, rol, contraseña) VALUES (?, ?, ?, ?)',
               ['Administrador', 'admin@kalon.com', 'admin', 'admin123'])
    
    db.commit()
    db.close()
    print("Usuario administrador creado:")
    print("Email: admin@kalon.com")
    print("Contraseña: admin123")

if __name__ == '__main__':
    crear_admin() 