import os
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from .config import Config
from .cif_parser import CIFParser
from .xrd_simulation import XRDSimulation
from .symmetry_analysis import SymmetryAnalyzer
from .physical_properties import PhysicalPropertiesCalculator
from .cod_client import CODClient
from .example_structures import get_example_cif, get_example_info, list_examples

try:
    from .pdf_report import PDFReportGenerator
    pdf_generator = PDFReportGenerator()
    REPORTLAB_AVAILABLE = True
except ImportError:
    PDFReportGenerator = None
    pdf_generator = None
    REPORTLAB_AVAILABLE = False

api = Blueprint('api', __name__)

cif_parser = CIFParser()
xrd_simulator = XRDSimulation()
symmetry_analyzer = SymmetryAnalyzer()
prop_calculator = PhysicalPropertiesCalculator()
cod_client = CODClient()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@api.route('/upload', methods=['POST'])
def upload_cif():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only CIF files allowed.'}), 400
    
    try:
        cif_content = file.read().decode('utf-8', errors='ignore')
        result = cif_parser.parse(cif_content)
        return jsonify({
            'success': True,
            'data': result,
            'filename': secure_filename(file.filename)
        })
    except Exception as e:
        return jsonify({'error': f'Failed to parse CIF: {str(e)}'}), 500

@api.route('/parse', methods=['POST'])
def parse_cif_content():
    data = request.get_json()
    if not data or 'cif_content' not in data:
        return jsonify({'error': 'No CIF content provided'}), 400
    
    try:
        result = cif_parser.parse(data['cif_content'])
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({'error': f'Failed to parse CIF: {str(e)}'}), 500

@api.route('/analyze', methods=['POST'])
def analyze_structure():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    lattice = data.get('lattice')
    atoms = data.get('atoms')
    
    if not lattice or not atoms:
        return jsonify({'error': 'Missing lattice or atoms data'}), 400
    
    try:
        symmetry = symmetry_analyzer.analyze(lattice, atoms)
        physical = prop_calculator.compute_all_properties(lattice, atoms)
        
        return jsonify({
            'success': True,
            'data': {
                'symmetry': symmetry,
                'physical_properties': physical
            }
        })
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@api.route('/xrd/simulate', methods=['POST'])
def simulate_xrd():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    lattice = data.get('lattice')
    atoms = data.get('atoms')
    wavelength = data.get('wavelength', 1.5406)
    min_angle = data.get('min_angle', 0.0)
    max_angle = data.get('max_angle', 90.0)
    step = data.get('step', 0.05)
    
    if not lattice or not atoms:
        return jsonify({'error': 'Missing lattice or atoms data'}), 400
    
    try:
        simulator = XRDSimulation(wavelength=wavelength)
        result = simulator.debye_scattering(
            atoms, lattice,
            min_angle=min_angle,
            max_angle=max_angle,
            step=step
        )
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({'error': f'XRD simulation failed: {str(e)}'}), 500

@api.route('/symmetry/elements', methods=['POST'])
def get_symmetry_elements():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    lattice = data.get('lattice')
    atoms = data.get('atoms')
    
    if not lattice or not atoms:
        return jsonify({'error': 'Missing lattice or atoms data'}), 400
    
    try:
        elements = symmetry_analyzer.identify_symmetry_elements(lattice, atoms)
        return jsonify({
            'success': True,
            'data': elements
        })
    except Exception as e:
        return jsonify({'error': f'Symmetry analysis failed: {str(e)}'}), 500

@api.route('/equivalent-positions', methods=['POST'])
def get_equivalent_positions():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    position = data.get('position')
    symmetry_ops = data.get('symmetry_operations', [])
    
    if not position or not symmetry_ops:
        return jsonify({'error': 'Missing position or symmetry operations'}), 400
    
    try:
        positions = symmetry_analyzer.get_equivalent_positions(position, symmetry_ops)
        return jsonify({
            'success': True,
            'data': {
                'equivalent_positions': positions,
                'count': len(positions)
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get equivalent positions: {str(e)}'}), 500

@api.route('/miller/spacing', methods=['POST'])
def calculate_miller_spacing():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    lattice = data.get('lattice')
    h = data.get('h', 0)
    k = data.get('k', 0)
    l = data.get('l', 0)
    
    if not lattice:
        return jsonify({'error': 'Missing lattice data'}), 400
    
    try:
        spacing = prop_calculator.calculate_miller_plane_spacing(h, k, l, lattice)
        return jsonify({
            'success': True,
            'data': {
                'hkl': [h, k, l],
                'spacing': spacing,
                'unit': 'Å'
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to calculate spacing: {str(e)}'}), 500

@api.route('/examples', methods=['GET'])
def get_examples():
    try:
        examples = list_examples()
        return jsonify({
            'success': True,
            'data': examples
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get examples: {str(e)}'}), 500

@api.route('/examples/<name>', methods=['GET'])
def get_example(name):
    try:
        cif_content = get_example_cif(name)
        info = get_example_info(name)
        
        if not cif_content:
            return jsonify({'error': 'Example not found'}), 404
        
        result = cif_parser.parse(cif_content)
        
        return jsonify({
            'success': True,
            'data': {
                'info': info,
                'structure': result,
                'cif_content': cif_content
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to load example: {str(e)}'}), 500

@api.route('/cod/search', methods=['POST'])
def cod_search():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    query = data.get('query', '')
    formula = data.get('formula')
    elements = data.get('elements')
    max_results = data.get('max_results', 50)
    
    try:
        if formula:
            results = cod_client.search_by_formula(formula, max_results)
        elif elements:
            results = cod_client.search_by_elements(elements, max_results)
        else:
            results = cod_client.search(query, max_results=max_results)
        
        return jsonify({
            'success': True,
            'data': results
        })
    except Exception as e:
        return jsonify({'error': f'COD search failed: {str(e)}'}), 500

@api.route('/cod/download/<cod_id>', methods=['GET'])
def cod_download(cod_id):
    try:
        cif_content = cod_client.download_cif(cod_id)
        
        if not cif_content:
            return jsonify({'error': 'Failed to download from COD'}), 500
        
        result = cif_parser.parse(cif_content)
        
        return jsonify({
            'success': True,
            'data': {
                'structure': result,
                'cif_content': cif_content
            }
        })
    except Exception as e:
        return jsonify({'error': f'COD download failed: {str(e)}'}), 500

@api.route('/report/generate', methods=['POST'])
def generate_report():
    if not REPORTLAB_AVAILABLE:
        return jsonify({
            'error': 'PDF report generation requires reportlab library. Please install it with: pip install reportlab'
        }), 503
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    crystal_data = data.get('crystal_data', {})
    analysis_results = data.get('analysis_results', {})
    xrd_data = data.get('xrd_data')
    
    try:
        pdf_buffer = pdf_generator.generate(crystal_data, analysis_results, xrd_data)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='crystal_analysis_report.pdf'
        )
    except Exception as e:
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'Crystal Analysis Platform API',
        'version': '1.0.0'
    })
