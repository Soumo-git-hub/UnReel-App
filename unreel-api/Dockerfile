# Use Python 3.10 slim image as base
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Force port 7860 for Hugging Face Spaces compatibility
ENV PORT=7860

# Install system dependencies efficiently
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip for cleaner management
# requirements.txt already contains yt-dlp, so it will be installed later

# Copy requirements file first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user (Hugging Face expects user with ID 1000)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app

# Copy project files
COPY . .
RUN chown -R user:user /app

# Switch to non-root user
USER user

# Warm-up: Pre-download the Whisper 'base' model during build to reduce first-request latency
RUN python -c "import whisper; whisper.load_model('base')"

# Expose port (HF uses 7860)
EXPOSE 7860

# Run the application using uvicorn correctly
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]