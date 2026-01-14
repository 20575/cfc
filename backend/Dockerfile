# Cyprus For Christ - Backend Production Dockerfile
FROM python:3.10-slim

# Prevent Python from writing .pyc files and set buffer mode
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8080

WORKDIR /app

# Install system dependencies for MySQL and standard build tools
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Entry point using gunicorn
CMD gunicorn --bind 0.0.0.0:$PORT cyprus_api.wsgi:application
