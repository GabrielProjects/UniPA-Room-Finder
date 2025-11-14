# Use a minimal Python image (Alpine is smaller but Chrome is problematic)
FROM python:3.11-slim

# Install only essential dependencies for Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    libnss3 \
    libgconf-2-4 \
    libxss1 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxrender1 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install lightweight Chrome (without unnecessary packages)
RUN curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-signing-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

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
ENV PORT=8000
EXPOSE 8000

# Use only 1 worker to minimize memory usage on 512MB limit
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:8000", "--workers", "1", "--timeout", "180", "--max-requests", "100", "--max-requests-jitter", "50", "--preload"]
