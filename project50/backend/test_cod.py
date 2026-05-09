import requests

API = 'http://localhost:5000/api'

print('=== Test 1: Search "NaCl" ===')
r = requests.post(f'{API}/cod/search', json={'query': 'NaCl'})
print(f'Status: {r.status_code}')
results = r.json()
items = results.get('data', [])
print(f'Found {len(items)} results')
for item in items[:3]:
    print(f'  COD #{item["cod_id"]}: {item["formula"]} - {item.get("title", "")[:40]}')

print()
print('=== Test 2: Search "diamond" ===')
r = requests.post(f'{API}/cod/search', json={'query': 'diamond'})
results = r.json()
items = results.get('data', [])
print(f'Found {len(items)} results')
for item in items[:3]:
    print(f'  COD #{item["cod_id"]}: {item["formula"]} - {item.get("title", "")[:40]}')

print()
print('=== Test 3: Search all (empty query) ===')
r = requests.post(f'{API}/cod/search', json={'query': ''})
results = r.json()
items = results.get('data', [])
print(f'Found {len(items)} results')

print()
print('=== Test 4: Download COD #9008512 ===')
r = requests.get(f'{API}/cod/download/9008512')
result = r.json()
if result.get('success'):
    structure = result['data']['structure']
    lattice = structure['lattice']
    print(f'Lattice: a={lattice["a"]:.3f}, b={lattice["b"]:.3f}, c={lattice["c"]:.3f}')
    print(f'Atoms: {len(structure["atoms"])}')
    if structure['atoms']:
        print(f'First atom: {structure["atoms"][0]["element"]} at ({structure["atoms"][0]["x"]:.3f}, {structure["atoms"][0]["y"]:.3f}, {structure["atoms"][0]["z"]:.3f})')

print()
print('All tests completed!')
