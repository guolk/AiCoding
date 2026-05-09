import numpy as np

ATOMIC_WEIGHTS = {
    'H': 1.008, 'He': 4.003, 'Li': 6.941, 'Be': 9.012, 'B': 10.81, 'C': 12.01,
    'N': 14.01, 'O': 16.00, 'F': 19.00, 'Ne': 20.18, 'Na': 22.99, 'Mg': 24.31,
    'Al': 26.98, 'Si': 28.09, 'P': 30.97, 'S': 32.07, 'Cl': 35.45, 'Ar': 39.95,
    'K': 39.10, 'Ca': 40.08, 'Sc': 44.96, 'Ti': 47.87, 'V': 50.94, 'Cr': 52.00,
    'Mn': 54.94, 'Fe': 55.85, 'Co': 58.93, 'Ni': 58.69, 'Cu': 63.55, 'Zn': 65.38,
    'Ga': 69.72, 'Ge': 72.64, 'As': 74.92, 'Se': 78.97, 'Br': 79.90, 'Kr': 83.80,
    'Rb': 85.47, 'Sr': 87.62, 'Y': 88.91, 'Zr': 91.22, 'Nb': 92.91, 'Mo': 95.94,
    'Tc': 98.00, 'Ru': 101.1, 'Rh': 102.9, 'Pd': 106.4, 'Ag': 107.9, 'Cd': 112.4,
    'In': 114.8, 'Sn': 118.7, 'Sb': 121.8, 'Te': 127.6, 'I': 126.9, 'Xe': 131.3,
    'Cs': 132.9, 'Ba': 137.3, 'La': 138.9, 'Ce': 140.1, 'Pr': 140.9, 'Nd': 144.2,
    'Pm': 145.0, 'Sm': 150.4, 'Eu': 152.0, 'Gd': 157.3, 'Tb': 158.9, 'Dy': 162.5,
    'Ho': 164.9, 'Er': 167.3, 'Tm': 168.9, 'Yb': 173.0, 'Lu': 175.0, 'Hf': 178.5,
    'Ta': 180.9, 'W': 183.8, 'Re': 186.2, 'Os': 190.2, 'Ir': 192.2, 'Pt': 195.1,
    'Au': 197.0, 'Hg': 200.6, 'Tl': 204.4, 'Pb': 207.2, 'Bi': 209.0, 'Po': 209.0,
    'At': 210.0, 'Rn': 222.0, 'Fr': 223.0, 'Ra': 226.0, 'Ac': 227.0, 'Th': 232.0,
    'Pa': 231.0, 'U': 238.0
}

AVOGADRO = 6.022e23

class PhysicalPropertiesCalculator:
    def __init__(self):
        pass

    def calculate_volume(self, lattice):
        if not lattice:
            return 0.0
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = np.radians(lattice.get('alpha', 90))
        beta = np.radians(lattice.get('beta', 90))
        gamma = np.radians(lattice.get('gamma', 90))
        
        V = a * b * c * np.sqrt(
            1 - np.cos(alpha)**2 - np.cos(beta)**2 - np.cos(gamma)**2 +
            2 * np.cos(alpha) * np.cos(beta) * np.cos(gamma)
        )
        
        return V

    def calculate_density(self, lattice, atoms):
        volume = self.calculate_volume(lattice)
        if volume <= 0:
            return 0.0
        
        total_mass = 0.0
        for atom in atoms:
            element = re.sub(r'[^a-zA-Z]', '', atom['element']).capitalize()
            weight = ATOMIC_WEIGHTS.get(element, 12.0)
            occupancy = atom.get('occupancy', 1.0)
            total_mass += weight * occupancy
        
        volume_cm3 = volume * 1e-24
        mass_g = total_mass / AVOGADRO
        
        density = mass_g / volume_cm3
        
        return density

    def calculate_formula_mass(self, atoms):
        formula_units = {}
        for atom in atoms:
            element = re.sub(r'[^a-zA-Z]', '', atom['element']).capitalize()
            occupancy = atom.get('occupancy', 1.0)
            if element in formula_units:
                formula_units[element] += occupancy
            else:
                formula_units[element] = occupancy
        
        total_mass = 0.0
        formula = []
        for element, count in formula_units.items():
            weight = ATOMIC_WEIGHTS.get(element, 12.0)
            total_mass += weight * count
            if count == 1:
                formula.append(element)
            else:
                formula.append(f"{element}{count}")
        
        return {
            'formula': ''.join(formula),
            'mass': total_mass,
            'formula_units': formula_units
        }

    def calculate_lattice_parameters(self, lattice):
        if not lattice:
            return None
        
        return {
            'a': lattice['a'],
            'b': lattice['b'],
            'c': lattice['c'],
            'alpha': lattice.get('alpha', 90),
            'beta': lattice.get('beta', 90),
            'gamma': lattice.get('gamma', 90)
        }

    def calculate_ionic_radii(self, atoms, lattice):
        if not lattice or len(atoms) < 2:
            return []
        
        lattice_matrix = self._lattice_to_matrix(lattice)
        if lattice_matrix is None:
            return []
        
        radii_estimates = []
        for i in range(len(atoms)):
            for j in range(i + 1, len(atoms)):
                pos_i = np.array([atoms[i]['x'], atoms[i]['y'], atoms[i]['z']])
                pos_j = np.array([atoms[j]['x'], atoms[j]['y'], atoms[j]['z']])
                
                cart_i = np.dot(pos_i, lattice_matrix)
                cart_j = np.dot(pos_j, lattice_matrix)
                
                distance = np.linalg.norm(cart_i - cart_j)
                
                radii_estimates.append({
                    'atom1': atoms[i]['label'],
                    'atom2': atoms[j]['label'],
                    'distance': distance,
                    'sum_of_radii_estimate': distance / 2
                })
        
        return radii_estimates

    def calculate_packing_density(self, lattice, atoms, radii=None):
        if not lattice:
            return 0.0
        
        volume = self.calculate_volume(lattice)
        if volume <= 0:
            return 0.0
        
        atomic_radii = radii or self._default_radii()
        total_atomic_volume = 0.0
        
        for atom in atoms:
            element = re.sub(r'[^a-zA-Z]', '', atom['element']).capitalize()
            r = atomic_radii.get(element, 1.0)
            occupancy = atom.get('occupancy', 1.0)
            total_atomic_volume += (4/3) * np.pi * (r ** 3) * occupancy
        
        packing_density = total_atomic_volume / volume
        return packing_density

    def _default_radii(self):
        return {
            'H': 0.25, 'C': 0.77, 'N': 0.75, 'O': 0.73, 'F': 0.72,
            'Na': 1.86, 'Mg': 1.60, 'Al': 1.43, 'Si': 1.17, 'P': 1.10,
            'S': 1.04, 'Cl': 0.99, 'K': 2.27, 'Ca': 1.97, 'Fe': 1.26,
            'Cu': 1.28, 'Zn': 1.34
        }

    def calculate_anisotropy(self, lattice):
        if not lattice:
            return None
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        
        ratios = {
            'a/b': a / b if b > 0 else 0,
            'a/c': a / c if c > 0 else 0,
            'b/c': b / c if c > 0 else 0
        }
        
        lengths = [a, b, c]
        max_len = max(lengths)
        min_len = min(lengths)
        
        anisotropy_index = (max_len - min_len) / max_len if max_len > 0 else 0
        
        angles = [
            lattice.get('alpha', 90),
            lattice.get('beta', 90),
            lattice.get('gamma', 90)
        ]
        
        crystal_system = self._identify_crystal_system(lattice)
        
        return {
            'ratios': ratios,
            'anisotropy_index': anisotropy_index,
            'crystal_system': crystal_system,
            'is_orthogonal': all(abs(a - 90) < 0.1 for a in angles),
            'is_isotropic': abs(a - b) < 0.001 and abs(b - c) < 0.001 and all(abs(a - 90) < 0.1 for a in angles)
        }

    def _identify_crystal_system(self, lattice):
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = lattice.get('alpha', 90)
        beta = lattice.get('beta', 90)
        gamma = lattice.get('gamma', 90)
        
        tol = 0.01
        angle_tol = 0.5
        
        if (abs(a - b) < tol and abs(b - c) < tol and
            abs(alpha - 90) < angle_tol and abs(beta - 90) < angle_tol and
            abs(gamma - 90) < angle_tol):
            return 'cubic'
        
        if (abs(a - b) < tol and
            abs(alpha - 90) < angle_tol and abs(beta - 90) < angle_tol and
            abs(gamma - 90) < angle_tol):
            return 'tetragonal'
        
        if (abs(alpha - 90) < angle_tol and abs(beta - 90) < angle_tol and
            abs(gamma - 90) < angle_tol):
            return 'orthorhombic'
        
        if (abs(alpha - 90) < angle_tol and abs(gamma - 90) < angle_tol and
            not abs(beta - 90) < angle_tol):
            return 'monoclinic'
        
        if (abs(a - b) < tol and abs(alpha - beta) < angle_tol and
            abs(beta - gamma) < angle_tol and not abs(alpha - 90) < angle_tol):
            return 'trigonal'
        
        if (abs(a - b) < tol and
            abs(alpha - 90) < angle_tol and abs(beta - 90) < angle_tol and
            abs(gamma - 120) < angle_tol):
            return 'hexagonal'
        
        return 'triclinic'

    def calculate_miller_plane_spacing(self, h, k, l, lattice):
        if not lattice:
            return 0.0
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = np.radians(lattice.get('alpha', 90))
        beta = np.radians(lattice.get('beta', 90))
        gamma = np.radians(lattice.get('gamma', 90))
        
        V = self.calculate_volume(lattice)
        if V <= 0:
            return 0.0
        
        ca, cb, cg = np.cos(alpha), np.cos(beta), np.cos(gamma)
        sa, sb, sg = np.sin(alpha), np.sin(beta), np.sin(gamma)
        
        s11 = (b**2 * c**2 * sa**2)
        s22 = (a**2 * c**2 * sb**2)
        s33 = (a**2 * b**2 * sg**2)
        s12 = (a * b * c**2 * (ca * cb - cg))
        s23 = (a**2 * b * c * (cb * cg - ca))
        s13 = (a * b**2 * c * (cg * ca - cb))
        
        d_sq = (V**2) / (
            s11 * h**2 + s22 * k**2 + s33 * l**2 +
            2 * s12 * h * k + 2 * s23 * k * l + 2 * s13 * h * l
        )
        
        return np.sqrt(d_sq) if d_sq > 0 else 0.0

    def _lattice_to_matrix(self, lattice):
        if not lattice:
            return None
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = np.radians(lattice.get('alpha', 90))
        beta = np.radians(lattice.get('beta', 90))
        gamma = np.radians(lattice.get('gamma', 90))
        
        ca, cb, cg = np.cos(alpha), np.cos(beta), np.cos(gamma)
        sg = np.sin(gamma)
        V = self.calculate_volume(lattice)
        
        matrix = np.array([
            [a, b * cg, c * cb],
            [0, b * sg, c * (ca - cb * cg) / sg],
            [0, 0, V / (a * b * sg)]
        ])
        
        return matrix

    def compute_all_properties(self, lattice, atoms):
        return {
            'volume': self.calculate_volume(lattice),
            'density': self.calculate_density(lattice, atoms),
            'formula': self.calculate_formula_mass(atoms),
            'lattice_parameters': self.calculate_lattice_parameters(lattice),
            'packing_density': self.calculate_packing_density(lattice, atoms),
            'anisotropy': self.calculate_anisotropy(lattice),
            'atomic_distances': self.calculate_ionic_radii(atoms, lattice)
        }

import re
