import urllib.request
import json
import base64

print('='*60)
print('Full JWT Authentication Test')
print('='*60)

print()
print('Step 1: Login to get token')
print('-'*60)

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
print('Token:', token[:50] + '...' if len(token) > 50 else token)

print()
print('Step 2: Decode token to see payload')
print('-'*60)

parts = token.split('.')
print('Token parts:', len(parts))

if len(parts) == 3:
    payload_b64 = parts[1]
    padding_needed = 4 - len(payload_b64) % 4
    if padding_needed != 4:
        payload_b64 += '=' * padding_needed
    
    payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8'))
    print('Token payload:', payload)
    print('sub value:', payload.get('sub'))
    print('sub type:', type(payload.get('sub')))

print()
print('Step 3: Try to get questions with token')
print('-'*60)

req = urllib.request.Request(
    'http://localhost:8000/api/questions?page=1&pageSize=10',
    headers={
        'Authorization': f'Bearer {token}'
    },
    method='GET'
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Get questions SUCCESS!')
    print('Total questions:', result.get('total'))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass

print()
print('Step 4: Try to create a question with token')
print('-'*60)

question_data = {
    'title': '测试题目 - JWT 验证',
    'type': 'single_choice',
    'difficulty': 'easy',
    'score': 1.0,
    'tags': ['测试'],
    'explanation': 'JWT 验证测试',
    'knowledge_points': ['测试'],
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
    print('Question ID:', result.get('id'))
    print('Question title:', result.get('title'))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass

print()
print('='*60)
print('Test completed!')
print('='*60)
