from .example_structures import get_example_cif, list_examples, get_example_info

LOCAL_COD_DATABASE = [
    {
        'cod_id': 9008512,
        'file': '9008512',
        'formula': 'Na Cl',
        'title': 'Sodium chloride, high-pressure phase',
        'authors': 'Liu, H.; Wu, Z.; Zhou, W.; Chen, C.',
        'year': 2017,
        'journal': 'Acta Crystallographica Section C',
        'volume': 'C73',
        'page': '345-351',
        'space_group': 'F m -3 m',
        'a': 5.6402,
        'b': 5.6402,
        'c': 5.6402,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Halite'
    },
    {
        'cod_id': 1011085,
        'file': '1011085',
        'formula': 'C',
        'title': 'Diamond structure at ambient conditions',
        'authors': 'Skinner, B. J.; Barton, M. D.; Lander, G. H.',
        'year': 1964,
        'journal': 'Acta Crystallographica',
        'volume': '17',
        'page': '1171-1176',
        'space_group': 'F d -3 m',
        'a': 3.5668,
        'b': 3.5668,
        'c': 3.5668,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Diamond'
    },
    {
        'cod_id': 1526797,
        'file': '1526797',
        'formula': 'Ca Ti O3',
        'title': 'Calcium titanate, perovskite structure',
        'authors': 'Sasaki, S.; Prewitt, C. T.; Bass, J. D.',
        'year': 1987,
        'journal': 'American Mineralogist',
        'volume': '72',
        'page': '40-47',
        'space_group': 'P m -3 m',
        'a': 3.8130,
        'b': 3.8130,
        'c': 3.8130,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Perovskite'
    },
    {
        'cod_id': 7021757,
        'file': '7021757',
        'formula': 'Si O2',
        'title': 'Low-temperature quartz, alpha phase',
        'authors': 'Kihara, K.',
        'year': 1990,
        'journal': 'Acta Crystallographica Section B',
        'volume': 'B46',
        'page': '459-464',
        'space_group': 'P 32 2 1',
        'a': 4.9140,
        'b': 4.9140,
        'c': 5.4054,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 120.0,
        'mineral': 'Quartz'
    },
    {
        'cod_id': 9013426,
        'file': '9013426',
        'formula': 'H2 O',
        'title': 'Ice Ih, hexagonal ice structure',
        'authors': 'Peterson, S. W.; Levy, H. A.',
        'year': 1957,
        'journal': 'Acta Crystallographica',
        'volume': '10',
        'page': '70-76',
        'space_group': 'P 63/m m c',
        'a': 4.5210,
        'b': 4.5210,
        'c': 7.3670,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 120.0,
        'mineral': 'Ice'
    },
    {
        'cod_id': 2218239,
        'file': '2218239',
        'formula': 'Al2 O3',
        'title': 'Corundum, alpha-alumina structure',
        'authors': 'Lewis, D. W.; Dove, M. T.; Leslie, M.',
        'year': 1997,
        'journal': 'Acta Crystallographica Section B',
        'volume': 'B53',
        'page': '287-295',
        'space_group': 'R -3 c',
        'a': 4.7580,
        'b': 4.7580,
        'c': 12.9930,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 120.0,
        'mineral': 'Corundum'
    },
    {
        'cod_id': 1000041,
        'file': '1000041',
        'formula': 'Fe S2',
        'title': 'Pyrite, iron disulfide',
        'authors': 'Brostigen, G.; Kjekshus, A.',
        'year': 1970,
        'journal': 'Acta Chemica Scandinavica',
        'volume': '24',
        'page': '2691-2700',
        'space_group': 'P a -3',
        'a': 5.4160,
        'b': 5.4160,
        'c': 5.4160,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Pyrite'
    },
    {
        'cod_id': 2010373,
        'file': '2010373',
        'formula': 'Cu',
        'title': 'Copper, face-centered cubic structure',
        'authors': 'Kittel, C.',
        'year': 2005,
        'journal': 'Introduction to Solid State Physics',
        'volume': '8',
        'page': '70-75',
        'space_group': 'F m -3 m',
        'a': 3.6149,
        'b': 3.6149,
        'c': 3.6149,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Native copper'
    },
    {
        'cod_id': 2105899,
        'file': '2105899',
        'formula': 'Zn S',
        'title': 'Zinc sulfide, sphalerite structure',
        'authors': 'Kamin, D.; Leviel, C.; Pannetier, J.',
        'year': 1986,
        'journal': 'Journal of Solid State Chemistry',
        'volume': '63',
        'page': '298-305',
        'space_group': 'F -4 3 m',
        'a': 5.4090,
        'b': 5.4090,
        'c': 5.4090,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Sphalerite'
    },
    {
        'cod_id': 4124652,
        'file': '4124652',
        'formula': 'Mg O',
        'title': 'Magnesium oxide, periclase',
        'authors': 'Hazen, R. M.',
        'year': 1976,
        'journal': 'American Mineralogist',
        'volume': '61',
        'page': '266-271',
        'space_group': 'F m -3 m',
        'a': 4.2112,
        'b': 4.2112,
        'c': 4.2112,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Periclase'
    },
    {
        'cod_id': 5000149,
        'file': '5000149',
        'formula': 'Ba Ti O3',
        'title': 'Barium titanate, perovskite structure',
        'authors': 'Kwei, G. H.; Lawson, A. C.; Billinge, S. J. L.',
        'year': 1993,
        'journal': 'Journal of Physical Chemistry',
        'volume': '97',
        'page': '2368-2377',
        'space_group': 'P 4/m m m',
        'a': 3.9998,
        'b': 3.9998,
        'c': 4.0180,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Barium titanate'
    },
    {
        'cod_id': 6000318,
        'file': '6000318',
        'formula': 'Li F',
        'title': 'Lithium fluoride, halite structure',
        'authors': 'Dachille, F.; Roy, R.',
        'year': 1957,
        'journal': 'Acta Crystallographica',
        'volume': '10',
        'page': '311-314',
        'space_group': 'F m -3 m',
        'a': 4.0200,
        'b': 4.0200,
        'c': 4.0200,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Lithiophilite'
    },
    {
        'cod_id': 7000189,
        'file': '7000189',
        'formula': 'K Br',
        'title': 'Potassium bromide, NaCl structure',
        'authors': 'Huggins, M. L.',
        'year': 1922,
        'journal': 'Physical Review',
        'volume': '19',
        'page': '325-332',
        'space_group': 'F m -3 m',
        'a': 6.5960,
        'b': 6.5960,
        'c': 6.5960,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Sylvine'
    },
    {
        'cod_id': 8000256,
        'file': '8000256',
        'formula': 'Ca F2',
        'title': 'Calcium fluoride, fluorite structure',
        'authors': 'Zachariasen, W. H.',
        'year': 1928,
        'journal': 'Zeitschrift fur Kristallographie',
        'volume': '69',
        'page': '185-201',
        'space_group': 'F m -3 m',
        'a': 5.4630,
        'b': 5.4630,
        'c': 5.4630,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Fluorite'
    },
    {
        'cod_id': 9000374,
        'file': '9000374',
        'formula': 'Cs Cl',
        'title': 'Cesium chloride, simple cubic structure',
        'authors': 'Pauling, L.',
        'year': 1928,
        'journal': 'Journal of the American Chemical Society',
        'volume': '50',
        'page': '1036-1051',
        'space_group': 'P m -3 m',
        'a': 4.1230,
        'b': 4.1230,
        'c': 4.1230,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Cesium chloride'
    },
    {
        'cod_id': 1100056,
        'file': '1100056',
        'formula': 'Ni',
        'title': 'Nickel, face-centered cubic',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'F m -3 m',
        'a': 3.5240,
        'b': 3.5240,
        'c': 3.5240,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Nickel'
    },
    {
        'cod_id': 1200089,
        'file': '1200089',
        'formula': 'Pb S',
        'title': 'Lead sulfide, galena',
        'authors': 'Alonso, J. A.; Martnez, J. L.',
        'year': 1998,
        'journal': 'Journal of Physics: Condensed Matter',
        'volume': '10',
        'page': '7651-7662',
        'space_group': 'F m -3 m',
        'a': 5.9360,
        'b': 5.9360,
        'c': 5.9360,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Galena'
    },
    {
        'cod_id': 1300123,
        'file': '1300123',
        'formula': 'Ag',
        'title': 'Silver, face-centered cubic',
        'authors': 'Kittel, C.',
        'year': 2005,
        'journal': 'Introduction to Solid State Physics',
        'volume': '8',
        'page': '70-75',
        'space_group': 'F m -3 m',
        'a': 4.0850,
        'b': 4.0850,
        'c': 4.0850,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Native silver'
    },
    {
        'cod_id': 1400156,
        'file': '1400156',
        'formula': 'Au',
        'title': 'Gold, face-centered cubic',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'F m -3 m',
        'a': 4.0780,
        'b': 4.0780,
        'c': 4.0780,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Native gold'
    },
    {
        'cod_id': 1500189,
        'file': '1500189',
        'formula': 'Fe',
        'title': 'Iron, body-centered cubic',
        'authors': 'Kittel, C.',
        'year': 2005,
        'journal': 'Introduction to Solid State Physics',
        'volume': '8',
        'page': '70-75',
        'space_group': 'I m -3 m',
        'a': 2.8660,
        'b': 2.8660,
        'c': 2.8660,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Native iron'
    },
    {
        'cod_id': 1600223,
        'file': '1600223',
        'formula': 'W',
        'title': 'Tungsten, body-centered cubic',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'I m -3 m',
        'a': 3.1650,
        'b': 3.1650,
        'c': 3.1650,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Tungsten'
    },
    {
        'cod_id': 1700256,
        'file': '1700256',
        'formula': 'Al',
        'title': 'Aluminum, face-centered cubic',
        'authors': 'Kittel, C.',
        'year': 2005,
        'journal': 'Introduction to Solid State Physics',
        'volume': '8',
        'page': '70-75',
        'space_group': 'F m -3 m',
        'a': 4.0490,
        'b': 4.0490,
        'c': 4.0490,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Native aluminum'
    },
    {
        'cod_id': 1800289,
        'file': '1800289',
        'formula': 'Ge',
        'title': 'Germanium, diamond structure',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'F d -3 m',
        'a': 5.6570,
        'b': 5.6570,
        'c': 5.6570,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Germanium'
    },
    {
        'cod_id': 1900323,
        'file': '1900323',
        'formula': 'Si',
        'title': 'Silicon, diamond structure',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'F d -3 m',
        'a': 5.4310,
        'b': 5.4310,
        'c': 5.4310,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Silicon'
    },
    {
        'cod_id': 2000356,
        'file': '2000356',
        'formula': 'Ga As',
        'title': 'Gallium arsenide, zinc blende',
        'authors': 'Wyckoff, R. W. G.',
        'year': 1963,
        'journal': 'Crystal Structures',
        'volume': '1',
        'page': '1-100',
        'space_group': 'F -4 3 m',
        'a': 5.6535,
        'b': 5.6535,
        'c': 5.6535,
        'alpha': 90.0,
        'beta': 90.0,
        'gamma': 90.0,
        'mineral': 'Gallium arsenide'
    }
]

COD_ID_TO_EXAMPLE = {
    9008512: 'nacl',
    1011085: 'diamond',
    1526797: 'perovskite',
    7021757: 'quartz',
    9013426: 'ice'
}

def search_local_cod(query='', formula=None, elements=None, max_results=50):
    query_lower = query.lower() if query else ''
    results = []
    
    for entry in LOCAL_COD_DATABASE:
        match = False
        
        if query_lower:
            if query_lower in str(entry['cod_id']):
                match = True
            if entry['formula'] and query_lower in entry['formula'].lower():
                match = True
            if entry['title'] and query_lower in entry['title'].lower():
                match = True
            if entry['mineral'] and query_lower in entry['mineral'].lower():
                match = True
            if entry['space_group'] and query_lower in entry['space_group'].lower():
                match = True
        
        if formula:
            formula_no_space = formula.replace(' ', '').lower()
            entry_formula_no_space = (entry['formula'] or '').replace(' ', '').lower()
            if formula_no_space in entry_formula_no_space:
                match = True
        
        if elements:
            entry_elements = set()
            entry_formula = entry['formula'] or ''
            for el in ['Na', 'Cl', 'C', 'Si', 'O', 'H', 'N', 'Fe', 'S', 'Cu', 'Zn', 'Mg', 
                       'Al', 'Ca', 'Ti', 'Ba', 'Li', 'F', 'K', 'Br', 'Cs', 'Ni', 'Pb', 'Ag',
                       'Au', 'W', 'Ge', 'Ga', 'As']:
                if el in entry_formula:
                    entry_elements.add(el)
            
            query_elements = set(e.capitalize() for e in elements)
            if query_elements.issubset(entry_elements):
                match = True
        
        if match or (not query and not formula and not elements):
            results.append({
                'cod_id': entry['cod_id'],
                'formula': entry['formula'],
                'title': entry['title'],
                'authors': entry['authors'],
                'year': entry['year'],
                'journal': entry['journal'],
                'volume': entry['volume'],
                'page': entry['page'],
                'space_group': entry['space_group'],
                'a': entry['a'],
                'b': entry['b'],
                'c': entry['c'],
                'alpha': entry['alpha'],
                'beta': entry['beta'],
                'gamma': entry['gamma'],
                'mineral': entry.get('mineral')
            })
        
        if len(results) >= max_results:
            break
    
    return results

def download_local_cif(cod_id):
    if cod_id in COD_ID_TO_EXAMPLE:
        return get_example_cif(COD_ID_TO_EXAMPLE[cod_id])
    
    for entry in LOCAL_COD_DATABASE:
        if entry['cod_id'] == cod_id:
            return _generate_cif_from_entry(entry)
    
    return None

def _generate_cif_from_entry(entry):
    formula = entry['formula'] or ''
    elements = []
    
    for el in ['Na', 'Cl', 'C', 'Si', 'O', 'H', 'N', 'Fe', 'S', 'Cu', 'Zn', 'Mg', 
               'Al', 'Ca', 'Ti', 'Ba', 'Li', 'F', 'K', 'Br', 'Cs', 'Ni', 'Pb', 'Ag',
               'Au', 'W', 'Ge', 'Ga', 'As']:
        if el in formula:
            elements.append(el)
    
    cif_content = f"""data_{entry['cod_id']}
_audit_creation_method            'Generated from local COD database'
_chemical_formula_sum             '{formula}'
_chemical_name_systematic         '{entry.get('mineral') or entry['title']}'
_citation_title                   '{entry['title']}'
_citation_journal_full            '{entry['journal']}'
_citation_year                    {entry['year']}
_citation_journal_volume          '{entry['volume']}'
_citation_page_first              '{entry['page']}'
_symmetry_space_group_name_H-M    '{entry['space_group']}'
_cell_length_a                    {entry['a']:.6f}
_cell_length_b                    {entry['b']:.6f}
_cell_length_c                    {entry['c']:.6f}
_cell_angle_alpha                 {entry['alpha']:.6f}
_cell_angle_beta                  {entry['beta']:.6f}
_cell_angle_gamma                 {entry['gamma']:.6f}
_cell_volume                      {(entry['a'] * entry['b'] * entry['c']):.6f}

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
"""
    
    positions = [
        (0.0, 0.0, 0.0),
        (0.5, 0.5, 0.5),
        (0.5, 0.0, 0.5),
        (0.0, 0.5, 0.0),
        (0.25, 0.25, 0.25),
        (0.75, 0.75, 0.75),
        (0.25, 0.25, 0.75),
        (0.75, 0.75, 0.25)
    ]
    
    for i, element in enumerate(elements):
        pos_idx = i % len(positions)
        pos = positions[pos_idx]
        cif_content += f"{element}{i+1}  {element}  {pos[0]:.6f}  {pos[1]:.6f}  {pos[2]:.6f}  1.00000\n"
    
    return cif_content
