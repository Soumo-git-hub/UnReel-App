import requests
import json
import time

def test_api_multi_lens():
    """Test the UnReel API with the new Multi-Lens toggles"""
    url = "http://localhost:8000/api/v1/analyze/"
    
    # Testing with all lenses enabled to verify schema richness
    payload = {
        "url": "https://www.instagram.com/reel/DQ6sUBGEks8/",
        "focusEducational": True,
        "focusShopping": True,
        "focusLocation": True,
        "focusFactCheck": True,
        "focusResource": True
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"=== Testing Multi-Lens Analysis API ===")
        print(f"Sending request to {url}")
        print(f"Payload: {payload}")
        
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("Analysis Started Successfully!")
            print(f"Analysis ID: {result.get('analysisId')}")
            print(f"Initial Status: {result.get('status')}")
            
            # Since analysis is async, we'd normally poll here, 
            # but for a quick API test, we just verify the start.
            return result
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error calling API: {str(e)}")
        return None

if __name__ == "__main__":
    test_api_multi_lens()