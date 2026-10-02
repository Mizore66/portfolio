"""Local server for the design prototypes: the repo root on http://127.0.0.1:4173, with caching off so edits always show."""
import http.server, functools, os
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".m4a": "audio/mp4", ".webm": "video/webm", ".woff2": "font/woff2"}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
http.server.ThreadingHTTPServer(("127.0.0.1", 4173), functools.partial(NoCache, directory=root)).serve_forever()
