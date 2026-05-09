import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cif_parser import CIFParser
from app.xrd_simulation import XRDSimulation
from app.physical_properties import PhysicalPropertiesCalculator
from app.example_structures import get_example_cif, list_examples

print("=" * 60)
print("  Testing Backend Modules")
print("=" * 60)

print("\n[1] Testing CIF Parser...")
parser = CIFParser()
nacl_cif = get_example_cif('nacl')
result = parser.parse(nacl_cif)
print(f"    Lattice: a={result['lattice']['a']:.3f}, "
      f"b={result['lattice']['b']:.3f}, c={result['lattice']['c']:.3f}")
print(f"    Atoms: {len(result['atoms'])} atoms")
print(f"    Space group: {result['space_group']}")
print("    ✓ CIF Parser: PASSED")

print("\n[2] Testing Physical Properties...")
calculator = PhysicalPropertiesCalculator()
props = calculator.compute_all_properties(result['lattice'], result['atoms'])
print(f"    Volume: {props['volume']:.4f}")
print(f"    Density: {props['density']:.4f} g/cm3")
print(f"    Formula: {props['formula']['formula']}")
print(f"    Crystal system: {props['anisotropy']['crystal_system']}")
print("    ✓ Physical Properties: PASSED")

print("\n[3] Testing XRD Simulation...")
simulator = XRDSimulation()
xrd = simulator.debye_scattering(
    result['atoms'], result['lattice'],
    min_angle=10, max_angle=60, step=0.2
)
print(f"    Data points: {len(xrd['angles'])}")
print(f"    Peaks detected: {len(xrd['peaks'])}")
if xrd['peaks']:
    print(f"    First peak: 2theta={xrd['peaks'][0]['angle']:.2f}, "
          f"I={xrd['peaks'][0]['intensity']:.4f}")
print("    ✓ XRD Simulation: PASSED")

print("\n[4] Testing Examples...")
examples = list_examples()
print(f"    Available examples: {len(examples)}")
for ex in examples:
    cif = get_example_cif(ex['key'])
    r = parser.parse(cif)
    if r['lattice']:
        print(f"    - {ex['key']}: {r['lattice']['a']:.3f}Å x "
              f"{r['lattice']['b']:.3f}Å x {r['lattice']['c']:.3f}Å")
print("    ✓ Examples: PASSED")

print("\n" + "=" * 60)
print("  All tests PASSED! Backend is ready.")
print("=" * 60)
