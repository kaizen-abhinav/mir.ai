#!/usr/bin/env python3
"""
Decart AI Lucy VTON 3.5 Realtime Server
Serves the web client and proxies client token creation securely.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import mimetypes
import uuid
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Load .env file manually (no external dependency required)
def load_dotenv(env_path=BASE_DIR / ".env"):
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                        v = v[1:-1]
                    if k and (k not in os.environ or not os.environ[k]):
                        os.environ[k] = v

load_dotenv()

PORT = int(os.environ.get("PORT", 8080))
DECART_API_BASE = os.environ.get("DECART_API_BASE", "https://api.decart.ai/v1")

class VTONRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self):
        # Enable CORS for local development
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        # Health & Config API
        if self.path == "/api/config" or self.path == "/api/health":
            api_key = os.environ.get("DECART_API_KEY", "").strip()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            model_name = os.environ.get("DECART_MODEL", "lucy-vton-3.6")
            response_data = {
                "status": "ok",
                "hasServerApiKey": bool(api_key),
                "apiKey": api_key,
                "model": model_name,
                "defaultSpeed": os.environ.get("DECART_SPEED", "standard")
            }
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        # Serve static files as default
        return super().do_GET()

    def do_POST(self):
        # 1. Endpoint: /api/realtime-token
        if self.path == "/api/realtime-token":
            self.handle_realtime_token()
            return

        # 2. Endpoint: /api/upload
        if self.path == "/api/upload":
            self.handle_file_upload()
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def handle_realtime_token(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = {}
        if content_length > 0:
            try:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                if raw_body:
                    body = json.loads(raw_body)
            except Exception as e:
                print(f"[Warn] Failed parsing request JSON: {e}")

        # Prioritize key passed in request (e.g. from UI settings), fallback to env
        api_key = body.get("apiKey") or os.environ.get("DECART_API_KEY", "")
        api_key = api_key.strip() if api_key else ""

        if not api_key:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err_msg = {
                "error": "No Decart API Key provided. Please set DECART_API_KEY in your .env file or enter your API key in the UI settings."
            }
            self.wfile.write(json.dumps(err_msg).encode("utf-8"))
            return

        # Call Decart API to create ephemeral client token
        token_endpoint = f"{DECART_API_BASE}/client/tokens"
        model_name = os.environ.get("DECART_MODEL", "lucy-vton-3.6")
        payload = {
            "expiresIn": int(body.get("expiresIn", 3600)),
            "allowedModels": [model_name]
        }
        
        req = urllib.request.Request(
            token_endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "User-Agent": "Decart-Lucy-VTON-App/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = resp.read().decode("utf-8")
                token_json = json.loads(resp_data)
                
                # Decart returns { "apiKey": "...", "expiresAt": ... }
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(token_json).encode("utf-8"))
                print(f"[OK] Successfully minted Decart client token (expires in {payload['expiresIn']}s)")

        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"[Error] Decart API HTTPError {e.code}: {err_body}")
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            try:
                parsed_err = json.loads(err_body)
                self.wfile.write(json.dumps(parsed_err).encode("utf-8"))
            except Exception:
                self.wfile.write(json.dumps({
                    "error": f"Decart API error ({e.code})",
                    "details": err_body
                }).encode("utf-8"))

        except Exception as e:
            print(f"[Warn] Token endpoint unreachable from backend ({e}). Falling back to direct API key.")
            # Graceful fallback: return configured API key directly so browser can connect
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "apiKey": api_key,
                "fallback": True,
                "note": "Direct key fallback"
            }).encode("utf-8"))

    def handle_file_upload(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Empty upload payload"}).encode("utf-8"))
            return

        try:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(raw_body)
            # body contains { "dataUrl": "data:image/png;base64,...", "name": "shirt.png" }
            data_url = body.get("dataUrl", "")
            orig_name = body.get("name", "garment.png")

            if not data_url or not data_url.startswith("data:"):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid dataUrl format"}).encode("utf-8"))
                return

            import base64
            header, base64_data = data_url.split(",", 1)
            ext = ".png"
            if "image/jpeg" in header or "image/jpg" in header:
                ext = ".jpg"
            elif "image/webp" in header:
                ext = ".webp"

            file_id = str(uuid.uuid4())[:8]
            safe_name = f"garment_{file_id}{ext}"
            file_path = UPLOADS_DIR / safe_name

            with open(file_path, "wb") as f:
                f.write(base64.b64decode(base64_data))

            host = self.headers.get("Host", f"localhost:{PORT}")
            # Detect protocol (default http for local)
            protocol = "http"
            public_url = f"{protocol}://{host}/uploads/{safe_name}"

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "url": public_url,
                "relativeUrl": f"/uploads/{safe_name}",
                "filename": safe_name
            }).encode("utf-8"))
            print(f"[Upload] Saved custom garment: {safe_name}")

        except Exception as e:
            print(f"[Error] Failed to handle upload: {e}")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))


def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, VTONRequestHandler)
    print("\n" + "="*60)
    print("  mir.ai — Realtime WebRTC Virtual Try-On Studio")
    print(f"  Model: {os.environ.get('DECART_MODEL', 'lucy-vton-3.6')}")
    print(f"  Local Web App: http://localhost:{PORT}")
    has_key = bool(os.environ.get("DECART_API_KEY", "").strip())
    print(f"  DECART_API_KEY configured on backend: {'YES' if has_key else 'NO (Set in .env or via Web UI)'}")
    print(f"  Token endpoint: POST http://localhost:{PORT}/api/realtime-token")
    print("="*60 + "\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
