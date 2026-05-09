import requests

API = 'http://localhost:5000/api'

print('Testing COD search with empty query...')
r = requests.post(f'{API}/cod/search', json={'query': ''})
print(f'Status: {r.status_code}')
if r.status_code == 200:
    data = r.json()
    print(f'Success: {data.get("success")}')
    if data.get('success'):
        results = data.get('data', [])
        print(f'Found {len(results)} results')
        for item in results[:5]:
            print(f'  #{item["cod_id"]}: {item["formula"]} - {item["title"][:50]}')
else:
    print(f'Error: {r.text}')

print()
print('Testing COD search with "diamond"...')
r = requests.post(f'{API}/cod/search', json={'query': 'diamond'})
print(f'Status: {r.status_code}')
if r.status_code == 200:
    data = r.json()
    print(f'Success: {data.get("success")}')
    if data.get('success'):
        results = data.get('data', [])
        print(f'Found {len(results)} results')
        for item in results[:3]:
            print(f'  #{item["cod_id"]}: {item["formula"]} - {item["title"][:50]}')
