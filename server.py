#!/usr/bin/env python3
"""
Simple local development server for The Daily Roast
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching-friendly headers & correct MIME types
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    global PORT
    for attempt_port in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", attempt_port), Handler) as httpd:
                print("\n" + "=" * 60)
                print(f"  ☕ THE DAILY ROAST — Web Server Running")
                print(f"  Local URL: http://localhost:{attempt_port}")
                print("=" * 60)
                print("  Press Ctrl+C to stop the server.\n")
                
                # Open browser automatically if running interactively
                if "--no-browser" not in sys.argv:
                    try:
                        webbrowser.open(f"http://localhost:{attempt_port}")
                    except Exception:
                        pass
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nServer gracefully stopped.")
