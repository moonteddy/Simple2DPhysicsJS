# Local dev server for public/ (ES modules don't load from file://).
# Sends no-store so edited JS modules are never served stale from the browser cache.
import functools
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=ROOT)
server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
print(f"Serving {ROOT} at http://localhost:{PORT}/  (close this window to stop)")
server.serve_forever()
