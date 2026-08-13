# Step 1 - Base Image
FROM python:3.12-slim

# Step 2 - Working Directory
WORKDIR /app

# Step 3 - Copy dependency list
COPY requirements.txt .

# Step 4 - Install Python packages
RUN pip install --no-cache-dir --default-timeout=120 --retries=10 -r requirements.txt

# Step 5 - Copy application code
COPY . .

# Step 6 - Expose application port
EXPOSE 8000

# Step 7 - Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]