const http = require('http');
const net = require('net');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const UUID_RAW = (process.env.UUID || '7bd180e8-1142-4387-93f5-03e8d750a896').replace(/-/g, '');
const UUID_BUF = Buffer.from(UUID_RAW, 'hex');
const WSPATH = process.env.WSPATH || '/ws';

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoEarth Initiative - Green & Low Carbon Movement</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0fdf4; color: #166534; margin: 0; padding: 0; }
        header { background: linear-gradient(135deg, #15803d, #166534); color: #fff; padding: 3rem 1rem; text-align: center; }
        .container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .card { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); margin-bottom: 1.5rem; }
        h1 { margin: 0 0 .5rem 0; font-size: 2.2rem; }
        p { line-height: 1.7; color: #374151; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem; text-align: center; }
        .num { font-size: 1.8rem; font-weight: 700; color: #16a34a; }
        .lbl { font-size: .9rem; color: #6b7280; }
        footer { text-align: center; padding: 2rem; color: #6b7280; font-size: .85rem; }
    </style>
</head>
<body>
    <header>
        <h1>🌱 EcoEarth - Low Carbon Environmental Action</h1>
        <p>Building a Sustainable Future Together</p>
    </header>
    <div class="container">
        <div class="card">
            <h2>About EcoEarth Initiative</h2>
            <p>EcoEarth is dedicated to promoting low-carbon lifestyles, reducing single-use plastics, and advancing global reforestation. Every small action contributes to protecting our planet.</p>
            <div class="grid">
                <div><div class="num">128,400+</div><div class="lbl">Trees Planted</div></div>
                <div><div class="num">45.2 Tons</div><div class="lbl">CO2 Reduced</div></div>
                <div><div class="num">8,900+</div><div class="lbl">Volunteers</div></div>
            </div>
        </div>
        <div class="card">
            <h2>🌱 Daily Eco Guidelines</h2>
            <p>1. Opt for public transport, cycling, or walking.<br>2. Conserve electricity by turning off unused lights.<br>3. Reduce single-use cutlery and support sustainable products.</p>
        </div>
    </div>
    <footer>&copy; 2026 EcoEarth Initiative. All rights reserved.</footer>
</body>
</html>`;

const server = http.createServer((req, res) => {
    if (req.url === '/' || !req.url.startsWith(WSPATH)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_PAGE);
        return;
    }
    res.writeHead(404);
    res.end();
});

const wss = new WebSocketServer({ server });

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
