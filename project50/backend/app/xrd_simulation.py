import numpy as np
import re
from collections import defaultdict
from .cif_parser import CIFParser

ATOMIC_FORM_FACTORS = {
    'H': [0.493, 0.3229, 0.1401, 0.0408, 10.5109, 26.1257, 3.1424, 57.7997, 0.003],
    'C': [2.31, 1.02, 1.5886, 0.865, 20.8439, 10.2075, 0.5687, 51.6512, 0.2156],
    'N': [12.2126, 3.1322, 2.0125, 1.1663, 0.0057, 9.8933, 28.9975, 0.5826, -11.529],
    'O': [3.0485, 2.2868, 1.5463, 0.867, 13.2771, 5.7011, 0.3239, 32.9089, 0.2508],
    'F': [3.5392, 2.6412, 1.517, 1.0243, 10.2825, 4.2944, 0.2615, 26.1476, 0.2776],
    'Na': [4.7626, 3.1736, 1.2674, 1.1128, 3.285, 8.8422, 0.3136, 129.424, 0.676],
    'Mg': [5.4204, 2.1735, 1.2269, 1.0491, 2.8275, 7.1997, 0.3808, 93.7417, 1.1263],
    'Al': [6.4202, 1.9002, 1.5936, 1.9646, 3.0387, 0.7426, 31.5472, 1.1742, 0.1175],
    'Si': [6.2915, 3.0353, 1.9891, 1.541, 2.4386, 32.3337, 0.6785, 1.2854, 1.1407],
    'P': [6.4345, 4.1791, 1.78, 1.4908, 1.9067, 27.157, 0.526, 0.8504, 1.1149],
    'S': [6.9053, 5.2034, 1.4379, 1.5863, 1.4679, 22.2151, 0.2536, 56.6126, 0.8669],
    'Cl': [11.4604, 7.1964, 6.2556, 1.6455, 0.0105, 1.1662, 18.5194, 47.7784, 0.3951],
    'K': [8.2186, 7.4398, 1.0519, 0.8663, 12.7949, 0.7748, 213.187, 41.6841, 1.4248],
    'Ca': [8.8574, 7.1812, 2.2979, 1.0226, 10.4411, 0.349, 74.7514, 178.434, 1.6319],
    'Fe': [11.1994, 7.3467, 3.3948, 0.0614, 4.5926, 0.6016, 26.3036, 0.1016, 0.3517],
    'Cu': [14.0141, 4.7091, 1.4737, 0.5294, 3.0223, 13.4968, 0.617, 39.7138, 1.1786],
    'Zn': [14.1902, 4.7364, 1.5088, 0.5907, 2.8198, 12.8952, 0.5899, 36.5584, 1.9677],
}

class XRDSimulation:
    def __init__(self, wavelength=1.5406):
        self.wavelength = wavelength
        self.max_2theta = 90.0
        self.step = 0.02

    def atomic_form_factor(self, element, sin_theta_over_lambda):
        if element not in ATOMIC_FORM_FACTORS:
            element = re.sub(r'[^a-zA-Z]', '', element)
            if element not in ATOMIC_FORM_FACTORS:
                return 6.0
        
        params = ATOMIC_FORM_FACTORS[element]
        s2 = sin_theta_over_lambda ** 2
        
        f = 0.0
        for i in range(4):
            f += params[i] * np.exp(-params[i + 4] * s2)
        f += params[8]
        
        return f

    def compute_structure_factor(self, hkl, atoms, lattice):
        if not lattice:
            return 0.0
        
        lattice_matrix = CIFParser.lattice_to_matrix(lattice)
        if lattice_matrix is None:
            return 0.0
        
        inv_matrix = np.linalg.inv(lattice_matrix.T)
        hkl_vec = np.array(hkl)
        
        g = np.dot(hkl_vec, inv_matrix)
        d = 1.0 / np.linalg.norm(g) if np.linalg.norm(g) > 0 else float('inf')
        
        sin_theta = self.wavelength / (2 * d) if d > 0 else 0
        sin_theta_over_lambda = sin_theta / self.wavelength if d > 0 else 0
        
        f_total = 0.0
        phase_total = 0.0
        
        for atom in atoms:
            f = self.atomic_form_factor(atom['element'], sin_theta_over_lambda)
            occ = atom.get('occupancy', 1.0)
            
            frac = np.array([atom['x'], atom['y'], atom['z']])
            phase = 2 * np.pi * np.dot(hkl_vec, frac)
            
            f_total += f * occ * np.cos(phase)
            phase_total += f * occ * np.sin(phase)
        
        F = np.sqrt(f_total**2 + phase_total**2)
        return F

    def generate_hkl_list(self, lattice):
        if not lattice:
            return []
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        min_d = self.wavelength / 2.0
        
        max_h = int(np.ceil(a / min_d))
        max_k = int(np.ceil(b / min_d))
        max_l = int(np.ceil(c / min_d))
        
        hkl_list = []
        lattice_matrix = CIFParser.lattice_to_matrix(lattice)
        if lattice_matrix is None:
            return []
        
        inv_matrix = np.linalg.inv(lattice_matrix.T)
        
        for h in range(-max_h, max_h + 1):
            for k in range(-max_k, max_k + 1):
                for l in range(-max_l, max_l + 1):
                    if h == 0 and k == 0 and l == 0:
                        continue
                    
                    hkl_vec = np.array([h, k, l])
                    g = np.dot(hkl_vec, inv_matrix)
                    d = 1.0 / np.linalg.norm(g) if np.linalg.norm(g) > 0 else 0
                    
                    if d >= min_d:
                        hkl_list.append((h, k, l, d))
        
        return hkl_list

    def debye_scattering(self, atoms, lattice, min_angle=0.0, max_angle=90.0, step=0.05):
        angles = np.arange(min_angle, max_angle, step)
        intensities = np.zeros_like(angles)
        
        if not lattice or len(atoms) < 2:
            return {
                'angles': angles.tolist(),
                'intensities': intensities.tolist(),
                'peaks': []
            }
        
        lattice_matrix = CIFParser.lattice_to_matrix(lattice)
        if lattice_matrix is None:
            return {
                'angles': angles.tolist(),
                'intensities': intensities.tolist(),
                'peaks': []
            }
        
        cart_atoms = []
        for atom in atoms:
            frac = np.array([atom['x'], atom['y'], atom['z']])
            cart = CIFParser.fractional_to_cartesian(frac, lattice_matrix)
            cart_atoms.append({
                'element': atom['element'],
                'position': cart,
                'occupancy': atom.get('occupancy', 1.0)
            })
        
        for idx, angle in enumerate(angles):
            theta = np.radians(angle / 2.0)
            sin_theta = np.sin(theta)
            sin_theta_over_lambda = sin_theta / self.wavelength
            s = 4 * np.pi * sin_theta / self.wavelength
            
            intensity = 0.0
            
            for i, atom_i in enumerate(cart_atoms):
                f_i = self.atomic_form_factor(atom_i['element'], sin_theta_over_lambda)
                f_i *= atom_i['occupancy']
                
                intensity += f_i ** 2
                
                for j in range(i + 1, len(cart_atoms)):
                    atom_j = cart_atoms[j]
                    f_j = self.atomic_form_factor(atom_j['element'], sin_theta_over_lambda)
                    f_j *= atom_j['occupancy']
                    
                    r_ij = np.linalg.norm(atom_i['position'] - atom_j['position'])
                    if r_ij > 0:
                        sin_sr = np.sin(s * r_ij) / (s * r_ij) if s * r_ij > 0 else 1.0
                        intensity += 2 * f_i * f_j * sin_sr
            
            intensities[idx] = intensity
        
        if np.max(intensities) > 0:
            intensities = intensities / np.max(intensities)
        
        peaks = self._find_peaks(angles, intensities)
        
        return {
            'angles': angles.tolist(),
            'intensities': intensities.tolist(),
            'peaks': peaks
        }

    def _find_peaks(self, angles, intensities, threshold=0.05, min_distance=1.0):
        peaks = []
        n = len(angles)
        
        for i in range(1, n - 1):
            if intensities[i] > threshold and \
               intensities[i] > intensities[i-1] and \
               intensities[i] > intensities[i+1]:
                
                if not peaks or (angles[i] - peaks[-1]['angle'] > min_distance):
                    peaks.append({
                        'angle': float(angles[i]),
                        'intensity': float(intensities[i])
                    })
        
        return peaks
