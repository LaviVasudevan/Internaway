from flask import Flask, request, jsonify
import requests
import string
from flask_cors import CORS
from datetime import datetime
import tempfile
import re

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def preprocess_text(text):
    """Clean and normalize text for comparison."""
    if not text:
        return ""
    translator = str.maketrans('', '', string.punctuation)
    return text.translate(translator).lower().strip()
import os  # Add this import for os.path
import requests
import tempfile
def convert_drive_url(file_url):
    """Convert any Google Drive share URL to a direct download URL."""
    # Match pattern 1: /d/FILE_ID
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', file_url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    # Match pattern 2: id=FILE_ID
    match = re.search(r'id=([a-zA-Z0-9_-]+)', file_url)
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    # No valid Google Drive pattern found
    return file_url
 # Return original if not a Drive link
import os
import requests

def download_file(file_url):
    """Download a file from the given URL (supports Google Drive view links)."""
    try:
        file_url = convert_drive_url(file_url)
        session = requests.Session()
        
        response = session.get(file_url, stream=True)
        response.raise_for_status()

        # Get filename from content-disposition or fallback
        cd = response.headers.get('content-disposition', '')
        filename_match = re.findall('filename="(.+)"', cd)
        filename = filename_match[0] if filename_match else "downloaded_file.pdf"

        # Define destination folder (Downloads)
        downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
        os.makedirs(downloads_dir, exist_ok=True)
        file_path = os.path.join(downloads_dir, filename)

        # Save file stream
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print(f"✅ File downloaded to: {file_path}")
        return file_path

    except requests.exceptions.RequestException as e:
        raise ValueError(f"Download failed: {str(e)}")

def ocr_extract_text(file_path):
    """Extract text from downloaded file using OCR.space API."""
    try:
        api_key = "K88161420488957"
        with open(file_path, 'rb') as file:
            response = requests.post(
                "https://api.ocr.space/parse/image",
                files={'file': file},
                data={
                    "apikey": api_key,
                    "language": "eng",
                    "isOverlayRequired": False
                },
                timeout=120
            )
            response.raise_for_status()
            result = response.json()
            if result.get("IsErroredOnProcessing"):
                raise ValueError(result.get("ErrorMessage", "OCR processing error"))
            return result["ParsedResults"][0]["ParsedText"]
    except requests.exceptions.RequestException as e:
        raise ValueError(f"OCR API request failed: {str(e)}")

def print_verification_log(data, matches, result):
    """Print the detailed verification log in the terminal."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("\n" + "="*50)
    print(f"📄 VERIFICATION LOG - {timestamp}")
    print("="*50)
    print(f"👤 Name: {data.get('name')}")
    print(f"🏢 Company: {data.get('company')}")
    print(f"💼 Internship: {data.get('internship')}")
    print(f"📅 Duration: {data.get('startDate')} to {data.get('endDate')}")
    print(f"🔗 File URL: {data.get('fileUrl')}")
    print("\n🔍 Match Results:")
    for field, matched in matches.items():
        print(f"  - {field}: {'✅' if matched else '❌'}")
    print(f"\n🎯 Final Result: {'VERIFIED' if result else 'NOT VERIFIED'}")
    print("="*50 + "\n")

@app.route("/api/verify", methods=["POST"])
def verify_letter():
    """Endpoint to verify internship document details."""
    try:
        # Receive JSON data from the request
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400

        # ✅ Print the URL and the text from OCR first
        print(f"\n🔗 Received URL: {data.get('fileUrl')}")

        # Download the file and extract text
        file_path = download_file(data["fileUrl"])
        extracted_text = ocr_extract_text(file_path)
        
        # Print the extracted text from the image
        print("\n📄 Extracted Text from Image:")
        print(extracted_text)

        # Clean and preprocess the extracted text
        extracted_clean = preprocess_text(extracted_text)

        required_fields = ["fileUrl", "name", "internship", "company", "startDate", "endDate"]
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing
            }), 400

        # Prepare duration for matching
        duration = f"{data['startDate']} to {data['endDate']}"

        # Check for matches in the OCR text
        matches = {
            "Name": preprocess_text(data["name"]) in extracted_clean,
            "Company": preprocess_text(data["company"]) in extracted_clean,
            "Internship": preprocess_text(data["internship"]) in extracted_clean,
            "Duration": preprocess_text(duration) in extracted_clean,
        }

        # Determine final verification result
        result = all(matches.values())

        # Print the verification log
        print_verification_log(data, matches, result)

        # Return the result in JSON response
        return jsonify({
            "success": True,
            "result": result,
            "matches": matches,
            "extractedText": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text
        }), 200

    except Exception as e:
        error_msg = f"Verification failed: {str(e)}"
        print(f"❌ ERROR: {error_msg}")
        return jsonify({"success": False, "error": error_msg}), 500

@app.route("/", methods=["GET"])
def home():
    """Simple home route to check server is running."""
    return "✅ Flask backend is running!", 200

if __name__ == "__main__":
    print("🔥 Verification service running on http://localhost:8000")
    print("🔍 Ready to verify internship documents...\n")
    app.run(debug=True, port=8000)
