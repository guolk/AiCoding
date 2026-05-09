import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cif_parser import CIFParser
from app.xrd_simulation import XRDSimulation
from app.physical_properties import PhysicalPropertiesCalculator
from app.example_structures import get_example_cif, list_examples

def test_cif_parser():
    print("=" * 50)
    print("Test CIF Parser")
    print("=" * 50)
    
    examples = list_examples()
    print(f"Available examples: {[e['key'] for e in examples]}")
    
    nacl_cif = get_example_cif('nacl')
    parser = CIFParser()
    result = parser.parse(nacl_cif)
    
    print(f"\nLattice parameters:")
    print(f"  a = {result['lattice']['a']:.4f}")
    print(f"  b = {result['lattice']['b']:.4f}")
    print(f"  c = {result['lattice']['c']:.4f}")
    print(f"  alpha = {result['lattice']['alpha']:.2f}")
    print(f"  beta = {result['lattice']['beta']:.2f}")
    print(f"  gamma = {result['lattice']['gamma']:.2f}")
    
    print(f"\nAtom list:")
    for atom in result['atoms']:
        print(f"  {atom['label']} ({atom['element']}): ({atom['x']:.4f}, {atom['y']:.4f}, {atom['z']:.4f})")
    
    print(f"\nSpace group: {result['space_group']}")
    return result

def test_physical_properties(crystal_data):
    print("\n" + "=" * 50)
    print("Test Physical Properties Calculation")
    print("=" * 50)
    
    calculator = PhysicalPropertiesCalculator()
    props = calculator.compute_all_properties(
        crystal_data['lattice'], 
        crystal_data['atoms']
    )
    
    print(f"Volume: {props['volume']:.4f}")
    print(f"Density: {props['density']:.4f} g/cm3")
    print(f"Formula: {props['formula']['formula']}")
    print(f"Formula mass: {props['formula']['mass']:.4f} g/mol")
    print(f"Packing density: {props['packing_density']:.4f}")
    print(f"Crystal system: {props['anisotropy']['crystal_system']}")
    print(f"Anisotropy index: {props['anisotropy']['anisotropy_index']:.4f}")

def test_xrd_simulation(crystal_data):
    print("\n" + "=" * 50)
    print("Test XRD Simulation")
    print("=" * 50)
    
    simulator = XRDSimulation(wavelength=1.5406)
    result = simulator.debye_scattering(
        crystal_data['atoms'],
        crystal_data['lattice'],
        min_angle=10,
        max_angle=80,
        step=0.1
    )
    
    print(f"Data points: {len(result['angles'])}")
    print(f"Detected peaks: {len(result['peaks'])}")
    
    if result['peaks']:
        print("\nFirst 10 peaks:")
        for i, peak in enumerate(result['peaks'][:10]):
            print(f"  {i+1}. 2theta = {peak['angle']:.2f}, I = {peak['intensity']:.4f}")

def test_symmetry_analysis(crystal_data):
    print("\n" + "=" * 50)
    print("Test Symmetry Analysis")
    print("=" * 50)
    
    try:
        from app.symmetry_analysis import SymmetryAnalyzer
        analyzer = SymmetryAnalyzer()
        result = analyzer.analyze(
            crystal_data['lattice'],
            crystal_data['atoms']
        )
        
        print(f"Point group: {result['point_group']}")
        if result.get('space_group'):
            sg = result['space_group']
            print(f"Space group: {sg.get('international_table')} (#{sg.get('number')})")
            print(f"Hall symbol: {sg.get('hall_symbol')}")
        print(f"Number of symmetry operations: {len(result['symmetry_operations'])}")
        
        if result.get('wyckoff_positions'):
            print(f"Number of Wyckoff positions: {len(result['wyckoff_positions'])}")
        
        if result.get('error'):
            print(f"Warning: {result['error']}")
            
    except ImportError as e:
        print(f"Symmetry analysis requires spglib library")
        print(f"Tip: pip install spglib")
    except Exception as e:
        print(f"Symmetry analysis error: {e}")

def test_all_examples():
    print("\n" + "=" * 50)
    print("Test All Example Crystals")
    print("=" * 50)
    
    examples = list_examples()
    
    for example in examples:
        print(f"\n--- {example['name']} ---")
        cif = get_example_cif(example['key'])
        if not cif:
            print(f"  Error: Cannot load {example['key']}")
            continue
        
        parser = CIFParser()
        calculator = PhysicalPropertiesCalculator()
        result = parser.parse(cif)
        if result.get('lattice'):
            props = calculator.compute_all_properties(result['lattice'], result['atoms'])
            print(f"  Formula: {props['formula']['formula']}")
            print(f"  Density: {props['density']:.4f} g/cm3")
            print(f"  Crystal system: {props['anisotropy']['crystal_system']}")

if __name__ == '__main__':
    print("\nStarting backend module tests...\n")
    
    crystal_data = test_cif_parser()
    test_physical_properties(crystal_data)
    test_xrd_simulation(crystal_data)
    test_symmetry_analysis(crystal_data)
    test_all_examples()
    
    print("\n" + "=" * 50)
    print("All tests completed!")
    print("=" * 50)
