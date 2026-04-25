import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main_flask import app

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
