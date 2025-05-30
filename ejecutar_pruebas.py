#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para ejecutar todas las pruebas del sistema
"""

import os
import sys
import subprocess

def ejecutar_pruebas():
    """Ejecutar el suite completo de pruebas"""
    
    print("🚀 INICIANDO EJECUCIÓN DE PRUEBAS AUTOMÁTICAS")
    print("="*50)
    
    try:
        # Cambiar al directorio de pruebas
        test_dir = os.path.join(os.path.dirname(__file__), 'tests')
        if not os.path.exists(test_dir):
            os.makedirs(test_dir)
        
        # Ejecutar las pruebas
        test_file = os.path.join(test_dir, 'test_sistema.py')
        
        if os.path.exists(test_file):
            print(f"📁 Ejecutando pruebas desde: {test_file}")
            result = subprocess.run([sys.executable, test_file], 
                                  capture_output=True, 
                                  text=True, 
                                  cwd=os.path.dirname(__file__))
            
            print("📊 SALIDA DE LAS PRUEBAS:")
            print("-" * 50)
            print(result.stdout)
            
            if result.stderr:
                print("\n⚠️ ERRORES/ADVERTENCIAS:")
                print("-" * 50)
                print(result.stderr)
            
            print(f"\n🏁 CÓDIGO DE SALIDA: {result.returncode}")
            
            if result.returncode == 0:
                print("✅ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
            else:
                print("❌ ALGUNAS PRUEBAS FALLARON")
                
        else:
            print(f"❌ No se encontró el archivo de pruebas: {test_file}")
            return False
            
    except Exception as e:
        print(f"❌ Error al ejecutar las pruebas: {e}")
        return False
    
    return True

def generar_reporte_coverage():
    """Generar reporte de cobertura de código (si está disponible)"""
    try:
        print("\n📈 GENERANDO REPORTE DE COBERTURA...")
        # Intentar usar coverage si está instalado
        result = subprocess.run(['coverage', '--version'], 
                              capture_output=True, 
                              text=True)
        
        if result.returncode == 0:
            print("✅ Coverage disponible, generando reporte...")
            # Ejecutar con coverage
            subprocess.run(['coverage', 'run', 'tests/test_sistema.py'])
            subprocess.run(['coverage', 'report'])
            subprocess.run(['coverage', 'html'])
            print("✅ Reporte HTML generado en htmlcov/")
        else:
            print("⚠️ Coverage no disponible. Para instalar: pip install coverage")
            
    except FileNotFoundError:
        print("⚠️ Coverage no instalado. Para instalar: pip install coverage")

def main():
    """Función principal"""
    print("""
    🧪 SISTEMA DE PRUEBAS AUTOMATIZADAS
    ===================================
    
    Este script ejecutará todas las pruebas del sistema:
    • Pruebas de humo
    • Pruebas unitarias  
    • Pruebas de caja blanca
    • Pruebas de caja negra
    • Pruebas de caja gris
    • Pruebas de estabilidad
    • Reporte de pruebas UI/UX
    
    """)
    
    input("Presiona ENTER para continuar...")
    
    # Ejecutar pruebas
    exito = ejecutar_pruebas()
    
    # Generar reporte de cobertura si es posible
    if exito:
        generar_reporte_coverage()
    
    print("\n🎯 RESUMEN FINAL:")
    print("="*50)
    
    if exito:
        print("✅ Suite de pruebas ejecutado correctamente")
        print("📋 Archivos generados:")
        print("   • reporte_ui_ux.txt - Reporte de pruebas UI/UX")
        
        if os.path.exists('htmlcov'):
            print("   • htmlcov/ - Reporte de cobertura HTML")
    else:
        print("❌ Hubo problemas al ejecutar las pruebas")
    
    print("\n📚 Para más información, revisa los archivos de reporte generados.")

if __name__ == '__main__':
    main() 