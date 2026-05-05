import urllib.request
import json

print('='*60)
print('Test: Verify exams list works after fix')
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

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Get exams SUCCESS!')
    print('Total:', result.get('total'))
    print('Items:', len(result.get('items', [])))
    if result.get('items'):
        print()
        print('First exam:')
        print(json.dumps(result['items'][0], indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass

print()
print('Step 2: Get papers list (for comparison)')
print('-'*60)

req = urllib.request.Request(
    'http://localhost:8000/api/papers?page=1&pageSize=10',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('Get papers SUCCESS!')
    print('Total:', result.get('total'))
    print('Items:', len(result.get('items', [])))
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass

print()
print('='*60)
print('Summary of key conversions:')
print('='*60)
print('''
When SENDING data (frontend -> backend):
- questionId     -> question_id
- paperId        -> paper_id
- startTime      -> start_time
- endTime        -> end_time
- scorePerQuestion -> score_per_question
- shuffleQuestions -> shuffle_questions
- allowedRoles   -> allowed_roles

When RECEIVING data (backend -> frontend):
- question_id    -> questionId
- paper_id       -> paperId
- start_time     -> startTime
- end_time       -> endTime
- score_per_question -> scorePerQuestion
- shuffle_questions  -> shuffleQuestions
- allowed_roles      -> allowedRoles
''')
