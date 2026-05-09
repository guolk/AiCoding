import re
import numpy as np
from collections import defaultdict

class CIFParser:
    def __init__(self):
        self.data = defaultdict(dict)
        self.lattice = None
        self.atoms = []
        self.space_group = None

    def parse(self, cif_content):
        lines = cif_content.strip().split('\n')
        current_block = None
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line or line.startswith('#'):
                i += 1
                continue
            
            if line.startswith('data_'):
                current_block = line[5:]
                self.data[current_block] = defaultdict(list)
                i += 1
                continue
            
            if line.startswith('loop_'):
                columns = []
                i += 1
                while i < len(lines) and lines[i].strip().startswith('_'):
                    col = lines[i].strip()[1:]
                    columns.append(col)
                    i += 1
                
                loop_data = []
                while i < len(lines):
                    current_line = lines[i].strip()
                    if not current_line or current_line.startswith('_') or \
                       current_line.startswith('loop_') or current_line.startswith('data_'):
                        break
                    
                    parts = self._parse_line(current_line)
                    loop_data.extend(parts)
                    i += 1
                
                for j in range(0, len(loop_data), len(columns)):
                    row = {}
                    for k, col in enumerate(columns):
                        if j + k < len(loop_data):
                            row[col] = loop_data[j + k]
                    if current_block:
                        self.data[current_block]['_loop'].append(row)
                continue
            
            if line.startswith('_'):
                parts = line.split(None, 1)
                if len(parts) == 2:
                    key = parts[0][1:]
                    value = parts[1].strip().strip("'\"")
                    if current_block:
                        self.data[current_block][key] = value
                i += 1
                continue
            
            i += 1
        
        self._extract_lattice()
        self._extract_atoms()
        self._extract_space_group()
        
        return {
            'lattice': self.lattice,
            'atoms': self.atoms,
            'space_group': self.space_group,
            'metadata': dict(self.data.get(current_block or '', {}))
        }

    def _parse_line(self, line):
        tokens = []
        current = ''
        in_quotes = False
        quote_char = None
        
        for char in line:
            if char in "'\"":
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char:
                    in_quotes = False
                    quote_char = None
                else:
                    current += char
            elif char.isspace() and not in_quotes:
                if current:
                    tokens.append(current.strip())
                    current = ''
            else:
                current += char
        
        if current:
            tokens.append(current.strip())
        
        return tokens

    def _extract_lattice(self):
        lattice = {}
        for block_name, block in self.data.items():
            if 'cell_length_a' in block:
                lattice['a'] = float(block['cell_length_a'])
            if 'cell_length_b' in block:
                lattice['b'] = float(block['cell_length_b'])
            if 'cell_length_c' in block:
                lattice['c'] = float(block['cell_length_c'])
            if 'cell_angle_alpha' in block:
                lattice['alpha'] = float(block['cell_angle_alpha'])
            if 'cell_angle_beta' in block:
                lattice['beta'] = float(block['cell_angle_beta'])
            if 'cell_angle_gamma' in block:
                lattice['gamma'] = float(block['cell_angle_gamma'])
        
        self.lattice = lattice if lattice else None

    def _extract_atoms(self):
        self.atoms = []
        for block_name, block in self.data.items():
            if '_loop' in block:
                for row in block['_loop']:
                    if 'atom_site_label' in row or 'atom_site_type_symbol' in row:
                        atom = {
                            'label': row.get('atom_site_label', row.get('atom_site_type_symbol', '')),
                            'element': row.get('atom_site_type_symbol', 
                                re.sub(r'[^a-zA-Z]', '', row.get('atom_site_label', ''))),
                            'x': float(row.get('atom_site_fract_x', row.get('atom_site_Cartn_x', 0))),
                            'y': float(row.get('atom_site_fract_y', row.get('atom_site_Cartn_y', 0))),
                            'z': float(row.get('atom_site_fract_z', row.get('atom_site_Cartn_z', 0))),
                            'occupancy': float(row.get('atom_site_occupancy', 1.0)),
                            'thermal_iso': float(row.get('atom_site_thermal_displace_type', 
                                row.get('atom_site_U_iso_or_equiv', 0.0)) or 0.0)
                        }
                        self.atoms.append(atom)

    def _extract_space_group(self):
        for block_name, block in self.data.items():
            sg = {
                'number': block.get('space_group_IT_number'),
                'name': block.get('space_group_name_H-M_alt', 
                               block.get('symmetry_space_group_name_H-M')),
                'hall_symbol': block.get('space_group_name_Hall',
                                       block.get('symmetry_space_group_name_Hall'))
            }
            if sg['number'] or sg['name']:
                if sg['number']:
                    sg['number'] = int(sg['number'])
                self.space_group = sg
                return
        self.space_group = None

    @staticmethod
    def lattice_to_matrix(lattice):
        if not lattice:
            return None
        
        a, b, c = lattice['a'], lattice['b'], lattice['c']
        alpha = np.radians(lattice.get('alpha', 90))
        beta = np.radians(lattice.get('beta', 90))
        gamma = np.radians(lattice.get('gamma', 90))
        
        ca, cb, cg = np.cos(alpha), np.cos(beta), np.cos(gamma)
        sg = np.sin(gamma)
        
        vol = a * b * c * np.sqrt(1 - ca**2 - cb**2 - cg**2 + 2 * ca * cb * cg)
        
        matrix = np.array([
            [a, b * cg, c * cb],
            [0, b * sg, c * (ca - cb * cg) / sg],
            [0, 0, vol / (a * b * sg)]
        ])
        
        return matrix

    @staticmethod
    def fractional_to_cartesian(xyz, lattice_matrix):
        return np.dot(np.array(xyz), lattice_matrix)

    @staticmethod
    def cartesian_to_fractional(xyz, lattice_matrix):
        return np.dot(np.array(xyz), np.linalg.inv(lattice_matrix))
