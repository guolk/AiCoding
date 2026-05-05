import urllib.request
import json
from datetime import datetime, timedelta

print('='*60)
print('Test: Simulating frontend camelCase to backend snake_case')
print('='*60)

print()
print('Step 1: Login')
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

print()
print('Step 2: Get a paper ID')
print('-'*60)

req = urllib.request.Request(
    'http://localhost:8000/api/papers',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
papers = result.get('items', [])
print('Papers found:', len(papers))

paper_id = None
if papers:
    paper_id = papers[0]['id']
    print('Using paper ID:', paper_id)

if paper_id:
    print()
    print('Step 3: Test with camelCase (simulating frontend)')
    print('-'*60)
    
    now = datetime.now()
    start_time = now + timedelta(hours=1)
    end_time = now + timedelta(hours=3)
    
    exam_data_camel = {
        'title': '测试考试 - camelCase',
        'paperId': paper_id,
        'startTime': start_time.isoformat(),
        'endTime': end_time.isoformat(),
        'duration': 120,
        'shuffleQuestions': False,
        'shuffleOptions': False,
        'allowLateSubmit': False,
        'autoSubmit': True,
        'antiCheatEnabled': True,
        'maxTabSwitchCount': 3,
        'allowedRoles': ['student']
    }
    
    print('Frontend sends (camelCase):')
    print(json.dumps(exam_data_camel, indent=2, ensure_ascii=False))
    
    def camel_to_snake(s):
        return ''.join(['_' + c.lower() if c.isupper() else c for c in s]).lstrip('_')
    
    def convert_keys(obj):
        if isinstance(obj, dict):
            return {camel_to_snake(k): convert_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_keys(item) for item in obj]
        else:
            return obj
    
    exam_data_snake = convert_keys(exam_data_camel)
    print()
    print('Converted to snake_case (what frontend should send now):')
    print(json.dumps(exam_data_snake, indent=2, ensure_ascii=False))
    
    print()
    print('Step 4: Send snake_case data to backend')
    print('-'*60)
    
    req = urllib.request.Request(
        'http://localhost:8000/api/exams',
        data=json.dumps(exam_data_snake, ensure_ascii=False).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        method='POST'
    )
    
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read().decode())
        print('Create exam SUCCESS!')
        print('Exam ID:', result.get('id'))
        print('Exam title:', result.get('title'))
    except urllib.error.HTTPError as e:
        print(f'Error: {e.code} - {e.reason}')
        try:
            error_body = e.read().decode()
            print('Error body:', error_body)
        except:
            pass

print()
print('='*60)
print('Summary')
print('='*60)
print('''
Problem:
- Frontend was sending camelCase field names like: questionId, paperId, startTime
- Backend expects snake_case field names like: question_id, paper_id, start_time

Fix:
- Added convertKeysToSnake() function in src/services/api.ts
- This function automatically converts all camelCase keys to snake_case before sending
- It works recursively on nested objects and arrays

Key conversions:
- questionId     -> question_id
- paperId        -> paper_id
- startTime      -> start_time
- endTime        -> end_time
- allowedRoles   -> allowed_roles
- shuffleQuestions -> shuffle_questions
- scorePerQuestion -> score_per_question
''')
