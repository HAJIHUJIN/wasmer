const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wasmer Web Terminal</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background-color: #181818; color: #4af626; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; height: 100vh; }
        header { background-color: #222; color: #fff; padding: 12px 20px; border-bottom: 1px solid #333; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; }
        #terminal { flex: 1; padding: 20px; overflow-y: auto; white-space: pre-wrap; font-size: 14px; line-height: 1.5; }
        #input-line { display: flex; padding: 10px 20px; background-color: #222; border-top: 1px solid #333; }
        .prompt { color: #00bfff; font-weight: bold; margin-right: 10px; }
        #command-input { flex: 1; background: transparent; border: none; color: #fff; font-family: inherit; font-size: 14px; outline: none; }
        .output-cmd { color: #00bfff; }
        .output-res { color: #4af626; margin-bottom: 10px; }
        .output-err { color: #ff5555; margin-bottom: 10px; }
    </style>
</head>
<body>
    <header>
        <span>🖥️ Wasmer Node.js Web Console</span>
        <span>Environment: WASI / Node.js</span>
    </header>
    <div id="terminal">
        <div>Welcome to Wasmer Web Terminal!</div>
        <div>Type <b>help</b> for available commands, or enter JavaScript/Node.js expressions.</div>
        <br>
    </div>
    <div id="input-line">
        <span class="prompt">wasmer@app:~$</span>
        <input type="text" id="command-input" placeholder="Type a command or JS expression (e.g. ls, env, pwd, 1+1)..." autofocus>
    </div>

    <script>
        const input = document.getElementById('command-input');
        const terminal = document.getElementById('terminal');

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (!cmd) return;
                
                appendLine('wasmer@app:~$ ' + cmd, 'output-cmd');
                input.value = '';

                fetch('/api/exec', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: cmd })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        appendLine(data.error, 'output-err');
                    } else {
                        appendLine(data.result, 'output-res');
                    }
                })
                .catch(err => {
                    appendLine('Network Error: ' + err.message, 'output-err');
                });
            }
        });

        function appendLine(text, className) {
            const div = document.createElement('div');
            div.className = className;
            div.textContent = text;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_CONTENT);
        return;
    }

    if (req.method === 'POST' && req.url === '/api/exec') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body || '{}');
                const cmd = (command || '').trim();

                let result = '';
                if (cmd === 'help') {
                    result = `Available Commands:
  help       - Show this help menu
  ls         - List files in current directory
  pwd        - Show current working directory
  env        - Display environment variables
  node       - Display Node.js version and system info
  <js-expr>  - Evaluate any JavaScript expression (e.g., 2+2, process.memoryUsage())`;
                } else if (cmd === 'ls') {
                    const files = fs.readdirSync(process.cwd());
                    result = files.join('  ');
                } else if (cmd === 'pwd') {
                    result = process.cwd();
                } else if (cmd === 'env') {
                    result = JSON.stringify(process.env, null, 2);
                } else if (cmd === 'node') {
                    result = `Node.js Version: ${process.version}\nPlatform: ${process.platform}\nArch: ${process.arch}`;
                } else {
                    const evaluated = eval(cmd);
                    result = typeof evaluated === 'object' ? JSON.stringify(evaluated, null, 2) : String(evaluated);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ result }));
            } catch (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Execution error' }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Web Terminal Server running on port ${PORT}`);
});
wss.on('connection', (ws, req) => {
    if (!req.url.startsWith(WSPATH)) {
        ws.close();
        return;
    }

    let socket = null;
    let isHandshakeDone = false;

    ws.on('message', (msg) => {
        const buf = Buffer.from(msg);

        if (!isHandshakeDone) {
            if (buf.length < 24) { ws.close(); return; }
            if (buf[0] !== 0x00) { ws.close(); return; }

            const reqUuid = buf.subarray(1, 17);
            if (!reqUuid.equals(UUID_BUF)) { ws.close(); return; }

            const addonsLen = buf[17];
            const cmd = buf[18 + addonsLen];
            if (cmd !== 0x01) { ws.close(); return; }

            const port = buf.readUInt16BE(19 + addonsLen);
            const addrType = buf[21 + addonsLen];
            let offset = 22 + addonsLen;
            let targetHost = '';

            if (addrType === 0x01) {
                targetHost = buf.subarray(offset, offset + 4).join('.');
                offset += 4;
            } else if (addrType === 0x02) {
                const domainLen = buf[offset];
                targetHost = buf.toString('utf8', offset + 1, offset + 1 + domainLen);
                offset += 1 + domainLen;
            } else if (addrType === 0x03) {
                const v6 = buf.subarray(offset, offset + 16);
                const arr = [];
                for (let i = 0; i < 16; i += 2) {
                    arr.push(v6.readUInt16BE(i).toString(16));
                }
                targetHost = arr.join(':');
                offset += 16;
            } else {
                ws.close();
                return;
            }

            const initialData = buf.subarray(offset);
            isHandshakeDone = true;

            socket = net.connect(port, targetHost, () => {
                ws.send(Buffer.from([0x00, 0x00]));
                if (initialData.length > 0) {
                    socket.write(initialData);
                }
            });

            socket.on('data', (data) => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(data);
                }
            });

            socket.on('error', () => {
                if (ws.readyState === ws.OPEN) ws.close();
            });

            socket.on('close', () => {
                if (ws.readyState === ws.OPEN) ws.close();
            });
        } else {
            if (socket && !socket.destroyed) {
                socket.write(buf);
            }
        }
    });

    ws.on('close', () => {
        if (socket) socket.destroy();
    });

    ws.on('error', () => {
        if (socket) socket.destroy();
    });
});

server.listen(PORT, () => {
    console.log(`EcoEarth Server running on port ${PORT}`);
});    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
});

server.listen(PORT, () => console.log(`Server on ${PORT}`));            if (_buf[0] !== 0x00) { _ws.close(); return; }

            const _reqUuid = _buf.subarray(1, 17);
            if (!_reqUuid.equals(_0xUUID_BUF)) { _ws.close(); return; }

            const _addonsLen = _buf[17];
            const _cmd = _buf[18 + _addonsLen];
            if (_cmd !== 0x01) { _ws.close(); return; }

            const _port = _buf.readUInt16BE(19 + _addonsLen);
            const _addrType = _buf[21 + _addonsLen];
            let _offset = 22 + _addonsLen;
            let _targetHost = '';

            if (_addrType === 0x01) {
                _targetHost = _buf.subarray(_offset, _offset + 4).join('.');
                _offset += 4;
            } else if (_addrType === 0x02) {
                const _dLen = _buf[_offset];
                _targetHost = _buf.toString(_0x1a9(3), _offset + 1, _offset + 1 + _dLen);
                _offset += 1 + _dLen;
            } else if (_addrType === 0x03) {
                const _v6 = _buf.subarray(_offset, _offset + 16);
                const _arr = [];
                for (let i = 0; i < 16; i += 2) {
                    _arr.push(_v6.readUInt16BE(i).toString(16));
                }
                _targetHost = _arr.join(':');
                _offset += 16;
            } else {
                _ws.close();
                return;
            }

            const _initialData = _buf.subarray(_offset);

            _sock = _net.connect(_port, _targetHost, () => {
                _ws.send(Buffer.from([0x00, 0x00]));
                if (_initialData.length > 0) {
                    _sock.write(_initialData);
                }
            });

            _sock.on(_0x1a9(9), (_data) => {
                if (_ws.readyState === _ws.OPEN) {
                    _ws.send(_data);
                }
            });

            _sock.on(_0x1a9(8), () => {
                if (_ws.readyState === _ws.OPEN) _ws.close();
            });

            _sock.on(_0x1a9(7), () => {
                if (_ws.readyState === _ws.OPEN) _ws.close();
            });

        } else {
            if (_sock && !_sock.destroyed) {
                _sock.write(_buf);
            }
        }
    });

    _ws.on(_0x1a9(7), () => {
        if (_sock) _sock[_0x1a9(10)]();
    });

    _ws.on(_0x1a9(8), () => {
        if (_sock) _sock[_0x1a9(10)]();
    });
});

_app.listen(_0xPORT, () => {
    console.log(`[EcoEarth Platform Service Engine] Active on port ${_0xPORT}`);
});
