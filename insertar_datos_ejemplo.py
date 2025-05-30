import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), 'productos.db')

def insertar_cuadros_ejemplo():
    db = sqlite3.connect(DATABASE)
    
    # Datos de ejemplo para cuadros
    cuadros_ejemplo = [
        ('La Mona Lisa', 1500000.00, 'Obra maestra de Leonardo da Vinci, una de las pinturas más famosas del mundo.', 'KALON.jpg'),
        ('El Grito', 890000.00, 'Icónica obra expresionista de Edvard Munch que representa la ansiedad humana.', 'KALON.jpg'),
        ('La Noche Estrellada', 750000.00, 'Famosa pintura post-impresionista de Vincent van Gogh.', 'KALON.jpg'),
        ('Guernica', 1200000.00, 'Obra anti-guerra de Pablo Picasso, símbolo de la paz.', 'KALON.jpg'),
        ('La Persistencia de la Memoria', 650000.00, 'Surrealista obra de Salvador Dalí con sus famosos relojes derretidos.', 'KALON.jpg'),
        ('La Última Cena', 2000000.00, 'Mural de Leonardo da Vinci que representa la última cena de Jesucristo.', 'KALON.jpg')
    ]
    
    for cuadro in cuadros_ejemplo:
        db.execute('INSERT INTO cuadros (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)', cuadro)
    
    db.commit()
    db.close()
    print("Datos de ejemplo insertados correctamente")

if __name__ == '__main__':
    insertar_cuadros_ejemplo() 