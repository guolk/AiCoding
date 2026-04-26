import sys
sys.path.insert(0, '.')

print('Python version:', sys.version)
print()

print('Testing imports...')
try:
    from app.schemas import (
        CircuitComponent, Wire, SimulationConfig, SimulationResult,
        TransientConfig, ACConfig, TransientResult, ACResult,
        NodeVoltage, BranchCurrent, ACNodeVoltage,
        ComponentType, SimulationMode, Point, Pin
    )
    print('  - schemas: OK')
except Exception as e:
    print('  - schemas: FAILED -', e)

try:
    from app.netlist_generator import NetlistGenerator, _get_type_str
    print('  - netlist_generator: OK')
except Exception as e:
    print('  - netlist_generator: FAILED -', e)

try:
    from app.simulation_service import SimulationService
    print('  - simulation_service: OK')
except Exception as e:
    print('  - simulation_service: FAILED -', e)

try:
    from app.svg_exporter import SVGExporter
    print('  - svg_exporter: OK')
except Exception as e:
    print('  - svg_exporter: FAILED -', e)

try:
    from app.routers.api import router
    print('  - routers.api: OK')
except Exception as e:
    print('  - routers.api: FAILED -', e)

print()
print('Testing FastAPI app...')
try:
    from app.main import app
    print('  - FastAPI app created successfully')
    print('  - Routes:')
    for route in app.routes:
        if hasattr(route, 'path'):
            print('    -', route.path)
except Exception as e:
    print('  - FAILED -', e)

print()
print('Test completed!')
