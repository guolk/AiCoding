EXAMPLE_CIFS = {
    'nacl': """
data_NaCl
_cell_length_a 5.640
_cell_length_b 5.640
_cell_length_c 5.640
_cell_angle_alpha 90.0
_cell_angle_beta 90.0
_cell_angle_gamma 90.0
_symmetry_space_group_name_H-M 'F m -3 m'
_space_group_IT_number 225

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
Na Na 0.0 0.0 0.0 1.0
Cl Cl 0.5 0.5 0.5 1.0
""",

    'diamond': """
data_Diamond
_cell_length_a 3.567
_cell_length_b 3.567
_cell_length_c 3.567
_cell_angle_alpha 90.0
_cell_angle_beta 90.0
_cell_angle_gamma 90.0
_symmetry_space_group_name_H-M 'F d -3 m'
_space_group_IT_number 227

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
C1 C 0.0 0.0 0.0 1.0
C2 C 0.25 0.25 0.25 1.0
""",

    'perovskite': """
data_CaTiO3
_cell_length_a 3.795
_cell_length_b 3.795
_cell_length_c 3.795
_cell_angle_alpha 90.0
_cell_angle_beta 90.0
_cell_angle_gamma 90.0
_symmetry_space_group_name_H-M 'P m -3 m'
_space_group_IT_number 221

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
Ca Ca 0.0 0.0 0.0 1.0
Ti Ti 0.5 0.5 0.5 1.0
O O 0.5 0.5 0.0 1.0
""",

    'quartz': """
data_Quartz
_cell_length_a 4.916
_cell_length_b 4.916
_cell_length_c 5.405
_cell_angle_alpha 90.0
_cell_angle_beta 90.0
_cell_angle_gamma 120.0
_symmetry_space_group_name_H-M 'P 32 2 1'
_space_group_IT_number 154

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
Si Si 0.470 0.0 0.0 1.0
O O 0.415 0.268 0.118 1.0
""",

    'ice': """
data_Ice
_cell_length_a 4.521
_cell_length_b 4.521
_cell_length_c 7.367
_cell_angle_alpha 90.0
_cell_angle_beta 90.0
_cell_angle_gamma 120.0
_symmetry_space_group_name_H-M 'P 63/mmc'
_space_group_IT_number 194

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
O O 0.0 0.0 0.062 1.0
H H 0.0 0.0 0.197 1.0
H H 0.0 0.0 -0.073 1.0
"""
}

EXAMPLE_INFO = {
    'nacl': {
        'name': '氯化钠 (NaCl)',
        'description': '面心立方结构，空间群 Fm-3m (225)，离子晶体的典型代表',
        'structure_type': '岩盐结构',
        'crystal_system': '立方晶系'
    },
    'diamond': {
        'name': '金刚石 (Diamond)',
        'description': '面心立方晶格，每个原子四面体配位，空间群 Fd-3m (227)',
        'structure_type': '金刚石结构',
        'crystal_system': '立方晶系'
    },
    'perovskite': {
        'name': '钙钛矿 (CaTiO3)',
        'description': 'ABO3型钙钛矿结构，空间群 Pm-3m (221)',
        'structure_type': '钙钛矿结构',
        'crystal_system': '立方晶系'
    },
    'quartz': {
        'name': '石英 (SiO2)',
        'description': '六方晶系的α-石英结构，空间群 P3121 (152)',
        'structure_type': '架状硅酸盐',
        'crystal_system': '六方晶系'
    },
    'ice': {
        'name': '冰 (H2O)',
        'description': '冰Ih相，六方晶系，空间群 P63/mmc (194)',
        'structure_type': '氢键晶体',
        'crystal_system': '六方晶系'
    }
}

def get_example_cif(name):
    return EXAMPLE_CIFS.get(name.lower())

def get_example_info(name):
    return EXAMPLE_INFO.get(name.lower())

def list_examples():
    return [{'key': k, **v} for k, v in EXAMPLE_INFO.items()]
