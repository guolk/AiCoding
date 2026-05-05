import json
import base64
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc3ODA3MDU0OH0.PcArP8J5RaM1bA2yO5qv41w0Jj2P88erqhrI9FbqWv8'

parts = token.split('.')
payload_b64 = parts[1]
padding_needed = 4 - len(payload_b64) % 4
if padding_needed != 4:
    payload_b64 += '=' * padding_needed

payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8'))
print('Payload:', payload)
print('sub type:', type(payload.get('sub')))
print('sub value:', payload.get('sub'))

print()
print('Testing app.auth...')
from app.auth import decode_token, get_user_by_id

result = decode_token(token)
print('decode_token result:', result)
if result:
    print('sub:', result.get('sub'), 'type:', type(result.get('sub')))
    
    user_id = result.get('sub')
    print('Calling get_user_by_id with int(user_id):')
    
    try:
        user = get_user_by_id(int(user_id))
        print('User:', user)
    except Exception as e:
        print('Error:', e)
        import traceback
        traceback.print_exc()
