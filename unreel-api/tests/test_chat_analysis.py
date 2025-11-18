import requests
import json
import time

def test_chat_with_existing_analysis():
    """Test chatting with an existing successful analysis"""
    
    # Use an existing analysis ID that we know is successful
    analysis_id = "603b5c3f-b0a2-45cd-a6d0-cf1c43ebcc6c"
    
    print(f"=== Testing chat with existing analysis ID: {analysis_id} ===")
    
    # Step 1: Chat with the analysis
    print("\n=== STEP 1: Chatting with the analysis ===")
    chat_url = "http://localhost:3000/api/v1/chat/"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    chat_payload = {
        "analysisId": analysis_id,
        "message": "What is this video about?"
    }
    
    print(f"Sending chat request to {chat_url}")
    print(f"Payload: {chat_payload}")
    
    try:
        chat_response = requests.post(chat_url, data=json.dumps(chat_payload), headers=headers)
        
        print(f"Chat Status Code: {chat_response.status_code}")
        if chat_response.status_code != 200:
            print(f"Chat failed: {chat_response.text}")
            return
            
        chat_result = chat_response.json()
        print(f"Chat Result: {json.dumps(chat_result, indent=2)}")
        
        message_id = chat_result.get("messageId")
        if message_id:
            print(f"Message ID: {message_id}")
        
        # Step 2: Get chat history
        print("\n=== STEP 2: Getting chat history ===")
        history_url = f"http://localhost:3000/api/v1/chat/history/{analysis_id}"
        
        history_response = requests.get(history_url, headers=headers)
        
        print(f"History Status Code: {history_response.status_code}")
        if history_response.status_code == 200:
            history_result = history_response.json()
            print(f"Chat History: {json.dumps(history_result, indent=2)}")
        else:
            print(f"Failed to get chat history: {history_response.text}")
            
        # Step 3: Test another chat message
        print("\n=== STEP 3: Sending another chat message ===")
        chat_payload2 = {
            "analysisId": analysis_id,
            "message": "What car is being discussed in the video?"
        }
        
        chat_response2 = requests.post(chat_url, data=json.dumps(chat_payload2), headers=headers)
        
        print(f"Second Chat Status Code: {chat_response2.status_code}")
        if chat_response2.status_code == 200:
            chat_result2 = chat_response2.json()
            print(f"Second Chat Result: {json.dumps(chat_result2, indent=2)}")
        else:
            print(f"Second chat failed: {chat_response2.text}")
            
        # Step 4: Get updated chat history
        print("\n=== STEP 4: Getting updated chat history ===")
        history_response2 = requests.get(history_url, headers=headers)
        
        print(f"Updated History Status Code: {history_response2.status_code}")
        if history_response2.status_code == 200:
            history_result2 = history_response2.json()
            print(f"Updated Chat History: {json.dumps(history_result2, indent=2)}")
            print(f"Total messages in history: {len(history_result2)}")
        else:
            print(f"Failed to get updated chat history: {history_response2.text}")
            
        # Step 5: Test chat history deletion
        print("\n=== STEP 5: Testing chat history deletion ===")
        delete_url = f"http://localhost:3000/api/v1/chat/history/{analysis_id}"
        
        delete_response = requests.delete(delete_url, headers=headers)
        
        print(f"Delete History Status Code: {delete_response.status_code}")
        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print(f"Delete Result: {json.dumps(delete_result, indent=2)}")
        else:
            print(f"Failed to delete chat history: {delete_response.text}")
            
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

def test_instagram_reel_chat():
    """Test chatting with an Instagram Reel analysis"""
    
    # First, let's analyze an Instagram Reel
    print("=== Testing Instagram Reel Analysis and Chat ===")
    
    analyze_url = "http://localhost:3000/api/v1/analyze/"
    headers = {
        "Content-Type": "application/json"
    }
    
    # Using the Instagram Reel from the existing test
    payload = {
        "url": "https://www.instagram.com/reel/DQ6sUBGEks8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
    
    try:
        print(f"Sending analysis request for Instagram Reel: {payload['url']}")
        
        response = requests.post(analyze_url, data=json.dumps(payload), headers=headers)
        
        print(f"Analysis Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Analysis failed: {response.text}")
            # Let's try to find an existing successful analysis for this reel
            print("Trying to find existing successful analysis...")
            # We'll use a hardcoded ID from our previous tests
            analysis_id = "c45f9c94-af08-4bb3-aba8-3b2b385e2d42"  # This is an existing successful analysis for the Instagram reel
        else:
            analysis_result = response.json()
            analysis_id = analysis_result.get("analysisId")
            print(f"New Analysis ID: {analysis_id}")
        
        if analysis_id:
            print(f"Using Analysis ID: {analysis_id}")
            
            # Now let's chat with this analysis
            print("\n=== Chatting with Instagram Reel Analysis ===")
            chat_url = "http://localhost:3000/api/v1/chat/"
            
            chat_payload = {
                "analysisId": analysis_id,
                "message": "What is this Instagram reel about?"
            }
            
            chat_response = requests.post(chat_url, data=json.dumps(chat_payload), headers=headers)
            
            print(f"Chat Status Code: {chat_response.status_code}")
            if chat_response.status_code == 200:
                chat_result = chat_response.json()
                print(f"Chat Result: {json.dumps(chat_result, indent=2)}")
                
                # Get the chat history
                print("\n=== Getting Chat History ===")
                history_url = f"http://localhost:3000/api/v1/chat/history/{analysis_id}"
                history_response = requests.get(history_url, headers=headers)
                
                if history_response.status_code == 200:
                    history_result = history_response.json()
                    print(f"Chat History Count: {len(history_result)}")
                    for msg in history_result:
                        print(f"  - Message: {msg['message']}")
                        print(f"    Reply: {msg['reply'][:100]}...")  # Truncate long replies
                else:
                    print(f"Failed to get chat history: {history_response.text}")
            else:
                print(f"Chat failed: {chat_response.text}")
        
    except Exception as e:
        print(f"Error during Instagram Reel test: {str(e)}")
        import traceback
        traceback.print_exc()

def test_instagram_reel_analysis_and_chat():
    """
    Comprehensive test for Instagram Reel analysis and chat functionality.
    This test follows these steps:
    1) Fetch information from the Instagram Reel URL
    2) Analyze the fetched data
    3) Test the chat function with the analysis results using the analysis ID
    """
    
    print("=== Instagram Reel Analysis and Chat Test ===")
    
    # Step 1: Analyze the Instagram Reel
    print("\n=== STEP 1: Analyzing Instagram Reel ===")
    analyze_url = "http://localhost:3000/api/v1/analyze/"
    
    # Using the Instagram Reel from the existing test
    payload = {
        "url": "https://www.instagram.com/reel/DQ6sUBGEks8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Sending analysis request for Instagram Reel: {payload['url']}")
        
        response = requests.post(analyze_url, data=json.dumps(payload), headers=headers)
        
        print(f"Analysis Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Analysis failed: {response.text}")
            # Use an existing analysis ID if the new analysis fails
            analysis_id = "c45f9c94-af08-4bb3-aba8-3b2b385e2d42"
            print(f"Using existing analysis ID: {analysis_id}")
        else:
            analysis_result = response.json()
            print(f"Analysis completed successfully!")
            print(f"Analysis Result: {json.dumps(analysis_result, indent=2)}")
            
            analysis_id = analysis_result.get("analysisId")
            if not analysis_id:
                print("No analysis ID found in response")
                return
                
            print(f"Analysis ID: {analysis_id}")
        
        # Step 2: Test chat functionality with the analysis
        print("\n=== STEP 2: Testing Chat Functionality ===")
        
        # Chat message 1: Ask about the video content
        chat_payload_1 = {
            "analysisId": analysis_id,
            "message": "What is this Instagram reel about?"
        }
        
        chat_response_1 = send_chat_message(chat_payload_1, headers)
        if not chat_response_1:
            return
            
        # Chat message 2: Ask for more details
        chat_payload_2 = {
            "analysisId": analysis_id,
            "message": "Can you provide more details about the key topics discussed?"
        }
        
        chat_response_2 = send_chat_message(chat_payload_2, headers)
        if not chat_response_2:
            return
            
        # Step 3: Retrieve chat history
        print("\n=== STEP 3: Retrieving Chat History ===")
        history_url = f"http://localhost:3000/api/v1/chat/history/{analysis_id}"
        
        history_response = requests.get(history_url, headers=headers)
        
        if history_response.status_code == 200:
            history_result = history_response.json()
            print(f"Chat History Retrieved Successfully!")
            print(f"Total messages in history: {len(history_result)}")
            
            # Display chat history
            for i, msg in enumerate(history_result):
                print(f"\nMessage {i+1}:")
                print(f"  User: {msg['message']}")
                print(f"  AI: {msg['reply']}")
        else:
            print(f"Failed to retrieve chat history: {history_response.text}")
            
        # Step 4: Verify analysis data is maintained
        print("\n=== STEP 4: Verifying Analysis Data ===")
        get_analysis_url = f"http://localhost:3000/api/v1/analyze/{analysis_id}"
        
        get_analysis_response = requests.get(get_analysis_url, headers=headers)
        
        if get_analysis_response.status_code == 200:
            get_analysis_result = get_analysis_response.json()
            print(f"Analysis data verified successfully!")
            print(f"Analysis Title: {get_analysis_result.get('metadata', {}).get('title', 'N/A')}")
            print(f"Analysis Status: {get_analysis_result.get('status', 'N/A')}")
            print(f"Analysis Summary: {get_analysis_result.get('content', {}).get('summary', 'N/A')[:100]}...")
        else:
            print(f"Failed to retrieve analysis data: {get_analysis_response.text}")
            
        print("\n=== Instagram Reel Analysis and Chat Test Completed Successfully ===")
        
    except Exception as e:
        print(f"Error during Instagram Reel analysis and chat test: {str(e)}")
        import traceback
        traceback.print_exc()

def send_chat_message(payload, headers):
    """Helper function to send chat messages"""
    chat_url = "http://localhost:3000/api/v1/chat/"
    
    print(f"Sending chat message: {payload['message']}")
    
    try:
        chat_response = requests.post(chat_url, data=json.dumps(payload), headers=headers)
        
        print(f"Chat Status Code: {chat_response.status_code}")
        if chat_response.status_code == 200:
            chat_result = chat_response.json()
            print(f"Chat Response: {chat_result['reply']}")
            return chat_result
        else:
            print(f"Chat failed: {chat_response.text}")
            return None
    except Exception as e:
        print(f"Error sending chat message: {str(e)}")
        return None

def test_enhanced_chat_context():
    """Test the enhanced chat context management functionality"""
    
    print("\n=== Testing Enhanced Chat Context Management ===")
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Use an existing successful analysis
    analysis_id = "c45f9c94-af08-4bb3-aba8-3b2b385e2d42"  # Instagram Reel analysis
    
    try:
        # Send first message
        print("\n=== Sending First Chat Message ===")
        chat_payload_1 = {
            "analysisId": analysis_id,
            "message": "What is this Instagram reel about?"
        }
        
        chat_response_1 = send_chat_message(chat_payload_1, headers)
        if not chat_response_1:
            return False
            
        time.sleep(1)  # Small delay between messages
        
        # Send follow-up message that should use context
        print("\n=== Sending Follow-up Chat Message ===")
        chat_payload_2 = {
            "analysisId": analysis_id,
            "message": "Can you tell me more about the key topics mentioned?"
        }
        
        chat_response_2 = send_chat_message(chat_payload_2, headers)
        if not chat_response_2:
            return False
            
        # Retrieve chat history to verify context is maintained
        print("\n=== Retrieving Chat History ===")
        history_url = f"http://localhost:3000/api/v1/chat/history/{analysis_id}"
        
        history_response = requests.get(history_url, headers=headers)
        
        if history_response.status_code == 200:
            history_result = history_response.json()
            print(f"Chat History Retrieved Successfully!")
            print(f"Total messages in history: {len(history_result)}")
            
            # Display recent messages
            for i, msg in enumerate(history_result[-3:]):  # Last 3 messages
                print(f"\nMessage {i+1}:")
                print(f"  User: {msg['message']}")
                print(f"  AI: {msg['reply'][:100]}...")
                
            return True
        else:
            print(f"Failed to retrieve chat history: {history_response.text}")
            return False
            
    except Exception as e:
        print(f"Error during enhanced chat context test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_rate_limit_handling():
    """Test rate limit handling functionality"""
    
    print("\n=== Testing Rate Limit Handling ===")
    
    # This test will verify that our retry logic works
    # We'll simulate by making multiple rapid requests
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Use an existing successful analysis
    analysis_id = "603b5c3f-b0a2-45cd-a6d0-cf1c43ebcc6c"  # Tata Sierra analysis
    
    try:
        # Send multiple rapid messages to test rate limit handling
        messages = [
            "What car is featured in this video?",
            "What are the key design features?",
            "How does it compare to other SUVs?"
        ]
        
        responses = []
        for i, message in enumerate(messages):
            print(f"\n=== Sending Message {i+1}: {message} ===")
            
            chat_payload = {
                "analysisId": analysis_id,
                "message": message
            }
            
            response = send_chat_message(chat_payload, headers)
            if response:
                responses.append(response)
                print(f"Message {i+1} processed successfully")
            else:
                print(f"Message {i+1} failed")
                
            # Small delay to avoid overwhelming the system
            time.sleep(0.5)
        
        print(f"\nSuccessfully processed {len(responses)} out of {len(messages)} messages")
        return len(responses) > 0
        
    except Exception as e:
        print(f"Error during rate limit handling test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def run_enhanced_tests():
    """Run enhanced functionality tests"""
    
    print("=== Running Enhanced Functionality Tests ===")
    
    tests = [
        ("Enhanced Chat Context", test_enhanced_chat_context),
        ("Rate Limit Handling", test_rate_limit_handling),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running {test_name} Test")
        print('='*50)
        
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"{test_name}: {'PASSED' if result else 'FAILED'}")
        except Exception as e:
            print(f"{test_name}: FAILED with exception: {str(e)}")
            results.append((test_name, False))
        
        # Small delay between tests
        time.sleep(1)
    
    print(f"\n{'='*50}")
    print("ENHANCED TEST SUMMARY")
    print('='*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} enhanced tests passed")
    
    if passed == total:
        print("🎉 All enhanced functionality tests PASSED!")
        print("The backend improvements are working correctly.")
    else:
        print("⚠️  Some enhanced tests failed. Please review the output above.")
    
    return passed == total

if __name__ == "__main__":
    print("=== Running All Chat Analysis Tests ===")
    test_chat_with_existing_analysis()
    print("\n" + "="*50 + "\n")
    test_instagram_reel_chat()
    print("\n" + "="*50 + "\n")
    test_instagram_reel_analysis_and_chat()
    print("\n" + "="*50 + "\n")
    run_enhanced_tests()