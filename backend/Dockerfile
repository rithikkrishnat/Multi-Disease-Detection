# 1. Use a base image that has Python (we need it for TensorFlow)
FROM python:3.9-slim

# 2. Install system dependencies (including Node.js for your server)
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the server
WORKDIR /app

# 4. Copy your backend code to the server
COPY . .

# 5. Install Python dependencies
RUN pip install --no-cache-dir tensorflow pillow numpy

# 6. Install Node.js dependencies
RUN npm install

# 7. DOWNLOAD THE MODELS (Replace these URLs with yours!)
# We use wget to pull them from Dropbox directly into the server
RUN wget -O tb_detection_model.h5 "https://www.dropbox.com/scl/fi/wq7xjhlp22zzrdmt34178/tb_detection_model.h5?rlkey=3abjtz0kj01iuyej5dfp5eflh&st=puivhb1w&dl=1"
RUN wget -O diabetic_retinopathy_model.keras "https://www.dropbox.com/scl/fi/63trsd2k08i0cqinpz4nv/diabetic_retinopathy_model.keras?rlkey=618wno4arb15rscues5p9dv2n&st=5yh3icwe&dl=1"

# 8. Expose the port the app runs on
EXPOSE 5000

# 9. Start the application
CMD ["node", "server.js"]