import json
import requests

email = "info@medvastr.com"
password = "Medvastr_@123#"

def test_shiprocket():
    print(f"Testing Shiprocket Login for {email}...")
    try:
        res = requests.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
        
        if res.status_code == 200:
            token = res.json().get("token")
            print("Login SUCCESS!")
            
            # Try to list pickup locations (sanity check)
            print("Fetching pickup locations...")
            headers = {"Authorization": f"Bearer {token}"}
            res_loc = requests.get("https://apiv2.shiprocket.in/v1/external/settings/get/pickup", headers=headers)
            print(f"Loc Status: {res_loc.status_code}")
            print(f"Loc Response: {res_loc.text}")
        else:
            print("Login FAILED. Check credentials.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_shiprocket()
