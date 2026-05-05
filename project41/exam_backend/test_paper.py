import urllib.request
import json
from datetime import datetime, timedelta

print('='*60)
print('Step 1: Login')
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
print('='*60)
print('Step 2: Get questions to get a valid question ID')
print('='*60)

req = urllib.request.Request(
    'http://localhost:8000/api/questions',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Questions:', result)

question_id = None
if result.get('items'):
    question_id = result['items'][0]['id']
    print('First question ID:', question_id)

print()
print('='*60)
print('Step 3: Create Paper (manual mode)')
print('='*60)

paper_data = {
    'title': '测试试卷',
    'description': '这是一个测试试卷',
    'mode': 'manual',
    'tags': ['测试'],
    'questions': []
}

if question_id:
    paper_data['questions'] = [
        {'question_id': question_id, 'score': 1.0}
    ]

print('Sending paper data:', json.dumps(paper_data, indent=2, ensure_ascii=False))

req = urllib.request.Request(
    'http://localhost:8000/api/papers',
    data=json.dumps(paper_data, ensure_ascii=False).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    method='POST'
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Create paper SUCCESS!')
    print('Paper ID:', result.get('id'))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass

print()
print('='*60)
print('Step 4: Get papers to see if any exist')
print('='*60)

req = urllib.request.Request(
    'http://localhost:8000/api/papers',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Papers:', result)
