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
print('Step 2: Get questions')
print('='*60)

req = urllib.request.Request(
    'http://localhost:8000/api/questions',
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)

resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Questions count:', result.get('total'))

question_ids = [q['id'] for q in result.get('items', [])]
print('Question IDs:', question_ids)

print()
print('='*60)
print('Step 3: Create Paper with snake_case keys (as expected by backend)')
print('='*60)

paper_data = {
    'title': '测试试卷 - 完整流程',
    'description': '这是一个测试试卷',
    'mode': 'manual',
    'tags': ['测试'],
    'questions': []
}

if question_ids:
    paper_data['questions'] = [
        {'question_id': question_ids[0], 'score': 1.0}
    ]
    if len(question_ids) > 1:
        paper_data['questions'].append({'question_id': question_ids[1], 'score': 2.0})

print('Sending:', json.dumps(paper_data, indent=2, ensure_ascii=False))

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
    print('Paper:', json.dumps(result, indent=2, ensure_ascii=False))
    paper_id = result.get('id')
except urllib.error.HTTPError as e:
    print(f'Error: {e.code} - {e.reason}')
    try:
        error_body = e.read().decode()
        print('Error body:', error_body)
    except:
        pass
    paper_id = None

if paper_id:
    print()
    print('='*60)
    print('Step 4: Create Exam with snake_case keys')
    print('='*60)
    
    now = datetime.now()
    start_time = now + timedelta(hours=1)
    end_time = now + timedelta(hours=3)
    
    exam_data = {
        'title': '测试考试 - 完整流程',
        'paper_id': paper_id,
        'start_time': start_time.isoformat(),
        'end_time': end_time.isoformat(),
        'duration': 120,
        'shuffle_questions': False,
        'shuffle_options': False,
        'allow_late_submit': False,
        'auto_submit': True,
        'anti_cheat_enabled': True,
        'max_tab_switch_count': 3,
        'allowed_roles': ['student']
    }
    
    print('Sending:', json.dumps(exam_data, indent=2, ensure_ascii=False))
    
    req = urllib.request.Request(
        'http://localhost:8000/api/exams',
        data=json.dumps(exam_data, ensure_ascii=False).encode('utf-8'),
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
        print('Exam:', json.dumps(result, indent=2, ensure_ascii=False))
    except urllib.error.HTTPError as e:
        print(f'Error: {e.code} - {e.reason}')
        try:
            error_body = e.read().decode()
            print('Error body:', error_body)
        except:
            pass

print()
print('='*60)
print('All tests completed!')
print('='*60)
