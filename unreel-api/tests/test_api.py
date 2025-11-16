import requests
import json

def test_api():
    """Test the UnReel API with an Instagram Reel URL"""
    url = "http://127.0.0.1:3000/api/v1/analyze/"
    payload = {
        "url": "https://www.instagram.com/reel/DQ6sUBGEks8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Sending request to {url}")
        print(f"Payload: {payload}")
        
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        return response
    except Exception as e:
        print(f"Error calling API: {str(e)}")
        return None

if __name__ == "__main__":
    test_api()