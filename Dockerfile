# Use a minimal Python image
FROM python:3.11-slim

# Install essential dependencies for Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libxss1 \
    libgbm1 \
    libasound2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy dependencies first (better layer caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Environment for Chrome path in Selenium
ENV CHROME_BIN=/usr/bin/google-chrome

# Memory optimization environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port for Render/containers
EXPOSE 10000

# Use only 1 worker to minimize memory usage on 512MB limit
# Bind to 0.0.0.0:$PORT (Render sets PORT env var)
CMD gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 1 --timeout 180 --max-requests 100 --max-requests-jitter 50 --preload
