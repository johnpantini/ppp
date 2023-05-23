#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._handle()

    def do_POST(self):
        self._handle()

    def _handle(self):
        try:
            if self.path == '/reload_nginx':
                subprocess.run(
                    "/usr/sbin/nginx -s reload",
                    shell=True
                )
        finally:
            self.send_response(200)
            self.send_header("content-type", "application/json")
            self.end_headers()
            self.wfile.write('{"ok": true}\r\n'.encode())

if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 24422), Handler).serve_forever()
