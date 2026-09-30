import urllib.request
import urllib.error
import json
import sys

BASE = 'http://127.0.0.1:8000/api/v1'

def post(url, data, token=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def get(url, token=None):
    req = urllib.request.Request(url)
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print('1. Health check:', get(f'{BASE}/health'))
print('2. Public club:', get(f'{BASE}/public/club'))
print('3. Public updates:', get(f'{BASE}/public/updates'))
print('4. Public donation:', get(f'{BASE}/public/donation'))

import os
EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@mahaveeryouthclub.org')
PASSWORD = os.environ.get('ADMIN_PASSWORD', 'TestAdminPass123!')

status, login_res = post(f'{BASE}/auth/login', {'email': EMAIL, 'password': PASSWORD})
print('5. Admin Login:', status, 'token received:', bool(login_res.get('access_token')))
token = login_res.get('access_token')

if token:
    print('6. Admin Get Me:', get(f'{BASE}/auth/me', token))
    print('7. Admin Stats:', get(f'{BASE}/admin/stats', token))
    print('ALL LIVE API CHECKS PASSED!')
else:
    print('LOGIN FAILED!')
    sys.exit(1)
