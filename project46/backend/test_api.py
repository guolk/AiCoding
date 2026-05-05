import urllib.request
import json

# 测试API
url = "http://localhost:5000/api/latex-to-natural"
data = {
    "latex": "\\frac{a}{b}"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    print("API测试成功！")
    print(f"输入: {result.get('latex')}")
    print(f"输出: {result.get('natural')}")
except Exception as e:
    print(f"API测试失败: {e}")

# 测试健康检查
try:
    health_url = "http://localhost:5000/api/health"
    req = urllib.request.Request(health_url, method='GET')
    response = urllib.request.urlopen(req)
    result = json.loads(response.read().decode('utf-8'))
    print(f"\n健康检查: {result}")
except Exception as e:
    print(f"\n健康检查失败: {e}")
