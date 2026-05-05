import urllib.request
import json

print('='*60)
print('Step 1: Login to get new token')
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
print('Token:', token[:80] + '...')

import base64
parts = token.split('.')
payload_b64 = parts[1]
padding_needed = 4 - len(payload_b64) % 4
if padding_needed != 4:
    payload_b64 += '=' * padding_needed

payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8'))
print('Token payload:', payload)
print('sub type:', type(payload.get('sub')))

print()
print('='*60)
print('Step 2: Get questions with token (GET)')
print('='*60)

req = urllib.request.Request(
    'http://localhost:8000/api/questions',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Get questions SUCCESS!')
    print('Result keys:', list(result.keys()))
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        try:
            print('Error body:', e.read().decode())
        except:
            pass

print()
print('='*60)
print('Step 3: Create a question (POST with auth)')
print('='*60)

question_data = {
    'title': '测试题目 - 2 + 2 = ?',
    'type': 'single_choice',
    'difficulty': 'easy',
    'score': 1.0,
    'tags': ['数学', '测试'],
    'explanation': '简单的加法运算',
    'knowledge_points': ['基础数学'],
    'question_data': {
        'options': [
            {'label': 'A', 'content': '1'},
            {'label': 'B', 'content': '2'},
            {'label': 'C', 'content': '3'},
            {'label': 'D', 'content': '4'}
        ],
        'correct_answer': 'D'
    }
}

req = urllib.request.Request(
    'http://localhost:8000/api/questions',
    data=json.dumps(question_data, ensure_ascii=False).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    method='POST'
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Create question SUCCESS!')
    print('Created question ID:', result.get('id'))
    print('Created question title:', result.get('title'))
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        try:
            error_body = e.read().decode()
            print('Error body:', error_body)
        except:
            pass

print()
print('='*60)
print('All tests completed!')
print('='*60)
