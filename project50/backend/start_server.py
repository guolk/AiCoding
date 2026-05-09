import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("  Crystal Structure Analysis Platform")
print("  Backend Server Starting...")
print("=" * 60)

try:
    from app import create_app
    
    app = create_app()
    
    print("\n[*] Loading modules...")
    
    from app.cif_parser import CIFParser
    from app.xrd_simulation import XRDSimulation
    from app.physical_properties import PhysicalPropertiesCalculator
    from app.example_structures import list_examples, get_example_cif
    
    parser = CIFParser()
    nacl = get_example_cif('nacl')
    result = parser.parse(nacl)
    print(f"    - CIF Parser: OK (tested with NaCl, {len(result['atoms'])} atoms)")
    
    calc = PhysicalPropertiesCalculator()
    props = calc.compute_all_properties(result['lattice'], result['atoms'])
    print(f"    - Physical Properties: OK (density={props['density']:.3f} g/cm3)")
    
    sim = XRDSimulation()
    xrd = sim.debye_scattering(result['atoms'], result['lattice'], 10, 60, 0.2)
    print(f"    - XRD Simulation: OK ({len(xrd['angles'])} points, {len(xrd['peaks'])} peaks)")
    
    print(f"    - Examples: {len(list_examples())} available")
    
    print("\n[*] All modules loaded successfully!")
    print("\n" + "=" * 60)
    print("  Starting Flask server...")
    print("  API will be available at: http://localhost:5000/api")
    print("  Press Ctrl+C to stop")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    
except Exception as e:
    print(f"\n[ERROR] Failed to start server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
