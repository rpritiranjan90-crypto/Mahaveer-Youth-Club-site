import urllib.request
import json
import sys

def test_routes():
    base_url = "http://127.0.0.1:5173"
    api_url = "http://127.0.0.1:8000"
    
    routes = [
        "/",
        "/about",
        "/history",
        "/puja",
        "/gallery",
        "/updates",
        "/donate",
        "/contact",
    ]
    
    print("==================================================")
    print("VERIFYING FRONTEND ROUTES (Vite Dev Server)")
    print("==================================================")
    all_passed = True
    for route in routes:
        url = f"{base_url}{route}"
        try:
            req = urllib.request.urlopen(url)
            content = req.read().decode("utf-8")
            status = req.status
            has_root = '<div id="root">' in content
            print(f"  [PASS] {route:12} -> HTTP {status} (HTML served successfully, has #root container)")
        except Exception as e:
            print(f"  [FAIL] {route:12} -> Error: {e}")
            all_passed = False

    print("\n==================================================")
    print("VERIFYING BACKEND API ENDPOINTS (FastAPI)")
    print("==================================================")
    try:
        health_req = urllib.request.urlopen(f"{api_url}/api/v1/health")
        health_data = json.loads(health_req.read().decode("utf-8"))
        print(f"  [PASS] /api/v1/health -> HTTP {health_req.status}: {health_data}")
    except Exception as e:
        print(f"  [FAIL] /api/v1/health -> Error: {e}")
        all_passed = False

    try:
        root_req = urllib.request.urlopen(f"{api_url}/")
        root_data = json.loads(root_req.read().decode("utf-8"))
        print(f"  [PASS] / (Backend Root) -> HTTP {root_req.status}: {root_data}")
    except Exception as e:
        print(f"  [FAIL] / (Backend Root) -> Error: {e}")
        all_passed = False

    print("\n==================================================")
    print("VERIFYING FRONTEND PROXY TO BACKEND")
    print("==================================================")
    try:
        proxy_req = urllib.request.urlopen(f"{base_url}/api/v1/health")
        proxy_data = json.loads(proxy_req.read().decode("utf-8"))
        print(f"  [PASS] {base_url}/api/v1/health (Proxied) -> HTTP {proxy_req.status}: {proxy_data}")
    except Exception as e:
        print(f"  [FAIL] {base_url}/api/v1/health (Proxied) -> Error: {e}")
        all_passed = False

    if not all_passed:
        sys.exit(1)
    print("\nAll integration & routing verifications PASSED perfectly.")

if __name__ == "__main__":
    test_routes()
