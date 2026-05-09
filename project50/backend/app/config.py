import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
    ALLOWED_EXTENSIONS = {'cif', 'CIF'}
    COD_API_URL = 'https://www.crystallography.net/cod/search.json'
    COD_DOWNLOAD_URL = 'https://www.crystallography.net/cod/{cod_id}.cif'
