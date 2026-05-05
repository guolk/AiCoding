import urllib.request
import json

print('='*60)
print('Check what backend returns for exams list')
print('='*60)

data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request(
    'http://localhost:8000/api/auth/login',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
token = result.get('access_token')
print('Login SUCCESS!')

print()
print('Step 1: Get exams list')
print('-'*60)

req = urllib.request.Request(
    'http://localhost:8000/api/exams?page=1&pageSize=10',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Backend returns:')
print(json.dumps(result, indent=2, ensure_ascii=False))

print()
print('='*60)
print('Step 2: Get papers list (for comparison)')
print('='*60)

req = urllib.request.Request(
    'http://localhost:8000/api/papers?page=1&pageSize=10',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Backend returns papers:')
print(json.dumps(result, indent=2, ensure_ascii=False))

print()
print('='*60)
print('Summary')
print('='*60)
print('''
Notice: Backend returns snake_case keys, but frontend expects camelCase.
For example:
- paper_id (backend) -> paperId (frontend)
- start_time (backend) -> startTime (frontend)
- max_tab_switch_count (backend) -> maxTabSwitchCount (frontend)
''')
