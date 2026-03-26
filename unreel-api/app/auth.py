import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Header, HTTPException, status
import logging
import os
import json

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
# You should provide the path to your service account key file in the .env file
# or provide the service account JSON as a string in the FIREBASE_SERVICE_ACCOUNT_JSON setting.
from app.core.config import settings

def initialize_firebase():
    """Helper to initialize firebase if not already done."""
    try:
        if not firebase_admin._apps:
            from app.core.config import settings
            service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
            service_account_json = settings.FIREBASE_SERVICE_ACCOUNT_JSON
            
            # Option 1: Initialize using raw JSON string from environment secret
            if service_account_json:
                try:
                    cred_dict = json.loads(service_account_json)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin initialized with raw JSON string from environment")
                    return
                except json.JSONDecodeError as je:
                    logger.error(f"Error parsing service account JSON string: {je}")
                except Exception as e:
                    logger.error(f"Error initializing with JSON string: {e}")

            # Option 2: Fallback to file path
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized with service account certificate file")
            else:
                firebase_admin.initialize_app()
                logger.info("Firebase Admin initialized with default credentials")
    except Exception as e:
        logger.error(f"Error initializing Firebase Admin: {e}")

async def get_current_user(authorization: str = Header(None)):
    initialize_firebase()
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use 'Bearer <token>'",
        )
    
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )
