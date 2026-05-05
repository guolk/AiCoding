import json
import base64
import sys
import os
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc3ODA3MDU0OH0.PcArP8J5RaM1bA2yO5qv41w0Jj2P88erqhrI9FbqWv8'

parts = token.split('.')
payload_b64 = parts[1]
padding_needed = 4 - len(payload_b64) % 4
if padding_needed != 4:
    payload_b64 += '=' * padding_needed

payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8'))
print('Payload:', payload)
print('sub:', payload.get('sub'))
print('role:', payload.get('role'))
print('exp:', payload.get('exp'))
print('exp datetime:', datetime.utcfromtimestamp(payload.get('exp')))
print('now datetime:', datetime.utcnow())
print('now timestamp:', datetime.utcnow().timestamp())

print()
print('='*50)
print('Testing JWT decode...')

from jose import jwt, JWTError
from app.config import settings

print('SECRET_KEY:', settings.SECRET_KEY)
print('ALGORITHM:', settings.ALGORITHM)

try:
    result = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    print('Decode result:', result)
except JWTError as e:
    print('JWTError:', str(e))
    import traceback
    traceback.print_exc()
except Exception as e:
    print('Other error:', str(e))
    import traceback
    traceback.print_exc()
