#!/usr/bin/env python3
import time
import requests
import sys
import os

def wait_for_backend():
    """Ждет пока backend станет доступным"""
    max_attempts = 60  # 5 минут максимум
    attempt = 0
    
    while attempt < max_attempts:
        try:
            response = requests.get('http://backend:8000/api/health/', timeout=5)
            if response.status_code == 200:
                print("Backend is ready!")
                return True
        except requests.exceptions.RequestException:
            pass
        
        attempt += 1
        print(f"Waiting for backend... (attempt {attempt}/{max_attempts})")
        time.sleep(5)
    
    print("Backend did not become ready in time!")
    return False

if __name__ == "__main__":
    if not wait_for_backend():
        sys.exit(1) 