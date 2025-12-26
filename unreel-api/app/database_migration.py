import logging
from sqlalchemy import text
from app.database import engine

# Configure logging
logger = logging.getLogger(__name__)

def add_detected_language_column():
    """
    Add the detectedLanguage column to the analyses table if it doesn't exist.
    """
    try:
        # Check if the column exists
        check_column_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='analyses' AND column_name='detectedLanguage';
        """
        
        with engine.connect() as connection:
            result = connection.execute(text(check_column_sql))
            column_exists = result.fetchone()
            
            if not column_exists:
                # Add the column if it doesn't exist
                add_column_sql = """
                ALTER TABLE analyses 
                ADD COLUMN "detectedLanguage" VARCHAR;
                """
                connection.execute(text(add_column_sql))
                connection.commit()
                logger.info("Successfully added detectedLanguage column to analyses table")
            else:
                logger.info("detectedLanguage column already exists in analyses table")
                
    except Exception as e:
        logger.error(f"Error adding detectedLanguage column: {e}")
        raise

if __name__ == "__main__":
    add_detected_language_column()