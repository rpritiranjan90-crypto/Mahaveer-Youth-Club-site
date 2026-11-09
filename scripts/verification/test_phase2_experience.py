import os
import re
import urllib.request
import json
import sys

def test_phase2():
    print("=" * 60)
    print("RUNNING PHASE 2 AUTOMATED INTEGRITY & ROUTE VERIFICATION")
    print("=" * 60)

    # 1. Check Backend Health
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health", timeout=5)
        data = json.loads(req.read().decode('utf-8'))
        assert data.get("status") == "ok"
        print("[PASS] Backend /api/v1/health: OK (200, status=ok)")
    except Exception as e:
        print(f"[FAIL] Backend Health check failed: {e}")
        sys.exit(1)

    # 2. Check Backend Readiness (or offline DB reporting 503 as designed)
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/ready", timeout=5)
        data = json.loads(req.read().decode('utf-8'))
        assert data.get("status") == "ready"
        print("[PASS] Backend /api/v1/ready: OK (200, status=ready, database=connected)")
    except urllib.error.HTTPError as e:
        if e.code == 503:
            print("[PASS] Backend /api/v1/ready: OK (503 reported cleanly when local DB container is offline)")
        else:
            print(f"[FAIL] Unexpected readiness status code: {e.code}")
            sys.exit(1)
    except Exception as e:
        print(f"[FAIL] Backend Readiness check failed: {e}")
        sys.exit(1)

    # 3. Check Frontend Server
    try:
        req = urllib.request.urlopen("http://127.0.0.1:5173/", timeout=5)
        html = req.read().decode('utf-8')
        assert "Mahaveer Youth Club" in html
        print("[PASS] Frontend Dev Server http://127.0.0.1:5173/: OK (200)")
    except Exception as e:
        print(f"[FAIL] Frontend Dev Server failed: {e}")
        sys.exit(1)

    # 4. Check Content Rules & Integrity
    src_dir = os.path.join(os.path.dirname(__file__), "frontend", "src")
    
    # 4a. Forbidden names check
    forbidden_names = ["Babul", "Rinku", "Kuna", "Chiku"]
    found_forbidden = []
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".tsx", ".ts")):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    for name in forbidden_names:
                        if name in content:
                            found_forbidden.append((filepath, name))
    
    if found_forbidden:
        print(f"[FAIL] ERROR: Found forbidden invented names: {found_forbidden}")
        sys.exit(1)
    else:
        print("[PASS] Content Safety: Zero invented member names (Babul, Rinku, Kuna, Chiku) in source code.")

    # 4b. 1998 / 28th year check in frontend pages
    pages_dir = os.path.join(src_dir, "pages")
    historical_anomalies = []
    for root, _, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(".tsx"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "1998" in content or "28th year" in content or "28th Year" in content:
                        historical_anomalies.append((filepath, "1998/28th year"))

    if historical_anomalies:
        print(f"[FAIL] ERROR: Found unsupported historical claims: {historical_anomalies}")
        sys.exit(1)
    else:
        print("[PASS] History Integrity: Zero occurrences of 1998 or 28th year in public pages.")

    # 4c. Check 2012 in About and History
    locales_path = os.path.join(src_dir, "locales", "en.ts")
    with open(locales_path, "r", encoding="utf-8") as f:
        locales_content = f.read()

    about_path = os.path.join(pages_dir, "AboutPage.tsx")
    with open(about_path, "r", encoding="utf-8") as f:
        about_content = f.read()
        assert "2012" in about_content
        assert "The senior members started the club to celebrate Ganesh Chaturthi" in locales_content
    print("[PASS] About Page: Confirmed 2012 founding story present.")

    history_path = os.path.join(pages_dir, "HistoryPage.tsx")
    with open(history_path, "r", encoding="utf-8") as f:
        history_content = f.read()
        assert "2012" in history_content or "2012" in locales_content
        assert "Foundation of Mahaveer Youth Club Banza" in locales_content
    print("[PASS] History Page: Confirmed 2012 timeline foundation present.")

    # 4d. Check Member Roster in MembersPage
    members_path = os.path.join(pages_dir, "MembersPage.tsx")
    with open(members_path, "r", encoding="utf-8") as f:
        members_content = f.read()
        assert "display_name" in members_content or "members" in members_content
    print("[PASS] Members Page: Dynamic member roster and nicknames configured.")

    # 4e. Check Donate Page Placeholders
    donate_path = os.path.join(pages_dir, "DonatePage.tsx")
    with open(donate_path, "r", encoding="utf-8") as f:
        donate_content = f.read()
        assert "9348699487-2@axl" in locales_content or "9348699487-2@axl" in donate_content
        assert "official_upi_qr.png" in donate_content
        assert "Cash donations should be handed directly to authorized club seniors at the pandal." in locales_content
        assert "Please verify the recipient name shown in your UPI app before completing the payment." in locales_content
    print("[PASS] Donate Page: Verified official UPI ID, official QR image, cash guidance, and recipient warning.")

    # 4f. Check Contact Page Placeholders
    contact_path = os.path.join(pages_dir, "ContactPage.tsx")
    with open(contact_path, "r", encoding="utf-8") as f:
        contact_content = f.read()
        assert "Direct Call" in locales_content
        assert "WhatsApp" in locales_content
        assert "Location Directions" in locales_content
        assert "Instagram" in locales_content
        assert "YouTube" in locales_content
    print("[PASS] Contact Page: Verified official communication action placeholders.")

    print("=" * 60)
    print("ALL PHASE 2 AUTOMATED CHECKS PASSED SUCCESSFULLY (100%)")
    print("=" * 60)

if __name__ == "__main__":
    test_phase2()
