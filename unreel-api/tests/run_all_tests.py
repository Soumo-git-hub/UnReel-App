#!/usr/bin/env python3
"""
Test Runner for UnReel API
Runs all tests and provides a summary of results.
"""

import sys
import os
import importlib.util
import traceback
from typing import Dict, List, Tuple

# Add the project root to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def load_and_run_test(test_file: str) -> Tuple[bool, str]:
    """
    Load and run a test file.
    
    Args:
        test_file: Path to the test file
        
    Returns:
        Tuple of (success, message)
    """
    try:
        # Load the test module
        spec = importlib.util.spec_from_file_location("test_module", test_file)
        if spec is None:
            return False, f"Failed to load spec for {test_file}"
            
        test_module = importlib.util.module_from_spec(spec)
        if spec.loader is None:
            return False, f"Failed to get loader for {test_file}"
            
        spec.loader.exec_module(test_module)
        
        # Run the test if it has a main function
        if hasattr(test_module, 'test_api'):
            test_module.test_api()
        elif hasattr(test_module, 'test_full_analysis'):
            import asyncio
            asyncio.run(test_module.test_full_analysis())
        elif hasattr(test_module, 'test_media_service'):
            import asyncio
            asyncio.run(test_module.test_media_service())
        elif hasattr(test_module, 'test_speech_service'):
            test_module.test_speech_service()
        else:
            print(f"No test function found in {test_file}")
            return False, f"No test function found in {test_file}"
            
        return True, "Test completed successfully"
    except Exception as e:
        error_msg = f"Error running {test_file}: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return False, error_msg

def main():
    """Run all tests and provide a summary."""
    print("=" * 60)
    print("UnReel API Test Runner")
    print("=" * 60)
    
    # Get all test files
    test_dir = os.path.dirname(__file__)
    test_files = [
        "test_api.py",
        "test_full_analysis.py",
        "test_media_service.py",
        "test_speech.py"
    ]
    
    results: Dict[str, Tuple[bool, str]] = {}
    
    # Run each test
    for test_file in test_files:
        full_path = os.path.join(test_dir, test_file)
        if os.path.exists(full_path):
            print(f"\nRunning {test_file}...")
            print("-" * 40)
            success, message = load_and_run_test(full_path)
            results[test_file] = (success, message)
        else:
            error_msg = f"Test file {test_file} not found"
            print(error_msg)
            results[test_file] = (False, error_msg)
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_file, (success, message) in results.items():
        status = "PASS" if success else "FAIL"
        print(f"{test_file:25} : {status}")
        if not success:
            print(f"  Error: {message}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print("-" * 60)
    print(f"Total Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n❌ {failed} test(s) failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())