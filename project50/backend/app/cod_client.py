import requests
from .config import Config
from .local_cod_database import search_local_cod, download_local_cif

class CODClient:
    def __init__(self, use_local=True):
        self.base_url = Config.COD_API_URL
        self.download_url = Config.COD_DOWNLOAD_URL
        self.use_local = use_local

    def search(self, query, formula=None, element=None, max_results=50):
        if self.use_local:
            elements = element.split(',') if element else None
            return search_local_cod(
                query=query,
                formula=formula,
                elements=elements,
                max_results=max_results
            )
        
        params = {
            'q': query,
            'format': 'json',
            'limit': max_results
        }
        
        if formula:
            params['formula'] = formula
        if element:
            params['element'] = element
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return self._parse_search_results(data)
        except Exception as e:
            print(f"COD search error: {e}")
            return []

    def _parse_search_results(self, data):
        results = []
        if not isinstance(data, list):
            return results
        
        for entry in data:
            result = {
                'cod_id': entry.get('id') or entry.get('cod'),
                'formula': entry.get('formula'),
                'title': entry.get('title') or entry.get('mineral'),
                'authors': entry.get('authors'),
                'year': entry.get('year'),
                'journal': entry.get('journal'),
                'volume': entry.get('volume'),
                'page': entry.get('page'),
                'space_group': entry.get('sg'),
                'a': entry.get('a'),
                'b': entry.get('b'),
                'c': entry.get('c'),
                'alpha': entry.get('alpha'),
                'beta': entry.get('beta'),
                'gamma': entry.get('gamma')
            }
            if result['cod_id']:
                results.append(result)
        
        return results

    def download_cif(self, cod_id):
        if self.use_local:
            cif = download_local_cif(int(cod_id))
            if cif:
                return cif
        
        try:
            url = self.download_url.format(cod_id=cod_id)
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"COD download error for {cod_id}: {e}")
            if self.use_local:
                return download_local_cif(int(cod_id))
            return None

    def search_by_formula(self, formula, max_results=50):
        return self.search(query='', formula=formula, max_results=max_results)

    def search_by_elements(self, elements, max_results=50):
        element_str = ','.join(elements)
        return self.search(query='', element=element_str, max_results=max_results)
