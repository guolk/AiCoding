import numpy as np
import re

try:
    import spglib
    SPGLIB_AVAILABLE = True
except ImportError:
    SPGLIB_AVAILABLE = False

class SymmetryAnalyzer:
    def __init__(self):
        self.symmetry_operations = []
        self.point_group = None
        self.space_group = None

    def analyze(self, lattice, atoms, symprec=1e-5):
        if not lattice or not atoms:
            return {
                'point_group': None,
                'space_group': None,
                'symmetry_operations': [],
                'wyckoff_positions': []
            }
        
        if not SPGLIB_AVAILABLE:
            return {
                'point_group': None,
                'space_group': None,
                'symmetry_operations': [],
                'wyckoff_positions': [],
                'error': 'spglib library not installed. Install with: pip install spglib'
            }
        
        try:
            cell = self._convert_to_spglib_cell(lattice, atoms)
            
            dataset = spglib.get_symmetry_dataset(cell, symprec=symprec)
            
            if dataset is None:
                return {
                    'point_group': None,
                    'space_group': None,
                    'symmetry_operations': [],
                    'wyckoff_positions': []
                }
            
            self.space_group = {
                'number': int(dataset['number']),
                'international_table': dataset['international'],
                'hall_symbol': dataset['hall'],
                'point_group': dataset['pointgroup']
            }
            
            self.point_group = dataset['pointgroup']
            
            rotations = dataset['rotations']
            translations = dataset['translations']
            self.symmetry_operations = []
            
            for rot, trans in zip(rotations, translations):
                self.symmetry_operations.append({
                    'rotation': rot.tolist(),
                    'translation': trans.tolist()
                })
            
            wyckoff = []
            if 'wyckoffs' in dataset:
                wyckoff_letters = dataset['wyckoffs']
                equivalent_sites = dataset['equivalent_atoms']
                
                for i, (letter, eq) in enumerate(zip(wyckoff_letters, equivalent_sites)):
                    wyckoff.append({
                        'site_index': i,
                        'wyckoff_letter': letter,
                        'equivalent_to': int(eq)
                    })
            
            return {
                'point_group': self.point_group,
                'space_group': self.space_group,
                'symmetry_operations': self.symmetry_operations[:48],
                'wyckoff_positions': wyckoff
            }
            
        except Exception as e:
            print(f"Symmetry analysis error: {e}")
            return {
                'point_group': None,
                'space_group': None,
                'symmetry_operations': [],
                'wyckoff_positions': []
            }

    def _convert_to_spglib_cell(self, lattice, atoms):
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = np.radians(lattice.get('alpha', 90))
        beta = np.radians(lattice.get('beta', 90))
        gamma = np.radians(lattice.get('gamma', 90))
        
        ca, cb, cg = np.cos(alpha), np.cos(beta), np.cos(gamma)
        sg = np.sin(gamma)
        
        lattice_matrix = np.array([
            [a, b * cg, c * cb],
            [0, b * sg, c * (ca - cb * cg) / sg],
            [0, 0, a * b * c * np.sqrt(1 - ca**2 - cb**2 - cg**2 + 2 * ca * cb * cg) / (a * b * sg)]
        ])
        
        atomic_numbers = []
        positions = []
        
        for atom in atoms:
            element = atom['element']
            z = self._atomic_number(element)
            atomic_numbers.append(z)
            positions.append([atom['x'], atom['y'], atom['z']])
        
        return (lattice_matrix, positions, atomic_numbers)

    def _atomic_number(self, element):
        element = re.sub(r'[^a-zA-Z]', '', element).capitalize()
        
        atomic_numbers = {
            'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10,
            'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15, 'S': 16, 'Cl': 17, 'Ar': 18,
            'K': 19, 'Ca': 20, 'Sc': 21, 'Ti': 22, 'V': 23, 'Cr': 24, 'Mn': 25, 'Fe': 26,
            'Co': 27, 'Ni': 28, 'Cu': 29, 'Zn': 30, 'Ga': 31, 'Ge': 32, 'As': 33, 'Se': 34,
            'Br': 35, 'Kr': 36, 'Rb': 37, 'Sr': 38, 'Y': 39, 'Zr': 40, 'Nb': 41, 'Mo': 42,
            'Tc': 43, 'Ru': 44, 'Rh': 45, 'Pd': 46, 'Ag': 47, 'Cd': 48, 'In': 49, 'Sn': 50,
            'Sb': 51, 'Te': 52, 'I': 53, 'Xe': 54, 'Cs': 55, 'Ba': 56, 'La': 57, 'Ce': 58,
            'Pr': 59, 'Nd': 60, 'Pm': 61, 'Sm': 62, 'Eu': 63, 'Gd': 64, 'Tb': 65, 'Dy': 66,
            'Ho': 67, 'Er': 68, 'Tm': 69, 'Yb': 70, 'Lu': 71, 'Hf': 72, 'Ta': 73, 'W': 74,
            'Re': 75, 'Os': 76, 'Ir': 77, 'Pt': 78, 'Au': 79, 'Hg': 80, 'Tl': 81, 'Pb': 82,
            'Bi': 83, 'Po': 84, 'At': 85, 'Rn': 86, 'Fr': 87, 'Ra': 88, 'Ac': 89, 'Th': 90,
            'Pa': 91, 'U': 92
        }
        
        return atomic_numbers.get(element, 6)

    def get_equivalent_positions(self, position, symmetry_ops):
        positions = []
        
        for op in symmetry_ops:
            rot = np.array(op['rotation'])
            trans = np.array(op['translation'])
            new_pos = np.dot(rot, position) + trans
            new_pos = new_pos - np.floor(new_pos)
            positions.append(new_pos.tolist())
        
        unique_positions = []
        for pos in positions:
            if not any(self._pos_almost_equal(pos, up) for up in unique_positions):
                unique_positions.append(pos)
        
        return unique_positions

    def _pos_almost_equal(self, p1, p2, tol=1e-5):
        diff = np.array(p1) - np.array(p2)
        diff = diff - np.round(diff)
        return np.all(np.abs(diff) < tol)

    def identify_symmetry_elements(self, lattice, atoms, symprec=1e-5):
        elements = {
            'rotation_axes': [],
            'mirror_planes': [],
            'inversion_centers': []
        }
        
        if not SPGLIB_AVAILABLE:
            return elements
        
        try:
            cell = self._convert_to_spglib_cell(lattice, atoms)
            sym = spglib.get_symmetry(cell, symprec=symprec)
            
            if sym is None:
                return elements
            
            rotations = sym['rotations']
            translations = sym['translations']
            
            for i, (rot, trans) in enumerate(zip(rotations, translations)):
                trace = np.trace(rot)
                det = np.linalg.det(rot)
                
                if np.allclose(rot, -np.eye(3), atol=1e-5):
                    elements['inversion_centers'].append({
                        'center': (trans / 2).tolist() if not np.allclose(trans, 0) else [0.5, 0.5, 0.5]
                    })
                
                elif det > 0 and not np.allclose(rot, np.eye(3)):
                    order = self._get_rotation_order(rot)
                    if order > 1:
                        axis = self._get_rotation_axis(rot)
                        if axis is not None:
                            elements['rotation_axes'].append({
                                'order': order,
                                'axis': axis.tolist(),
                                'origin': trans.tolist()
                            })
                
                elif det < 0:
                    eigenvalues, eigenvectors = np.linalg.eig(rot)
                    for j, eig in enumerate(eigenvalues):
                        if np.isreal(eig) and np.isclose(eig, 1.0):
                            normal = eigenvectors[:, j].real
                            normal = normal / np.linalg.norm(normal)
                            elements['mirror_planes'].append({
                                'normal': normal.tolist(),
                                'offset': np.dot(normal, trans) / 2 if not np.allclose(trans, 0) else 0
                            })
                            break
            
        except Exception as e:
            print(f"Symmetry element identification error: {e}")
        
        return elements

    def _get_rotation_order(self, rot):
        trace = np.trace(rot)
        if np.isclose(trace, 3.0):
            return 1
        elif np.isclose(trace, 2.0):
            return 6
        elif np.isclose(trace, 1.0):
            return 4
        elif np.isclose(trace, 0.0):
            return 3
        elif np.isclose(trace, -1.0):
            return 2
        return 1

    def _get_rotation_axis(self, rot):
        try:
            eigenvalues, eigenvectors = np.linalg.eig(rot)
            for i, eig in enumerate(eigenvalues):
                if np.isreal(eig) and np.isclose(eig, 1.0):
                    axis = eigenvectors[:, i].real
                    return axis / np.linalg.norm(axis)
        except:
            pass
        return None
