const WebSocket            = require("ws")                 ;
const          express     = require     ("express")       ;
const                 http = require               ("http");

const app    = express()                                                    ;
const server =        http.createServer(app)                                ;
const wss    =                              new WebSocket.Server({ server });

app.get("/", async (req, res) => {
    res.send("e2ee websocket server".toUpperCase());
});

let clients = [];
wss.on("connection", (ws) => {
    clients.push(ws);
    if (clients.length === 2) {
        clients[0].send(JSON.stringify({ type: "user-02-connected" }));
        clients[1].send(JSON.stringify({ type: "user-01-connected" }));
    }
    ws.onmessage = async (e) => {
        const obj = JSON.parse(e.data);
        if (clients.length !== 2) {
            console.log(`Server: not enough 02 users`);
            ws.send(JSON.stringify({ type: "another-user-not-connected" }));
            return;
        }
        if (obj.type === "sending-message") {
            console.log(`Server received: ${JSON.stringify(obj)}`);
            obj.type = "receive-message";
            clients.filter((client) => client !== ws)[0].send(JSON.stringify(obj));
            return;
        }
        if (obj.type === "exchange-key") {
            clients.filter((client) => client !== ws)[0].send(JSON.stringify(obj));
            return;
        }
        if (obj.type === "exchange-key-back") {
            clients.filter((client) => client !== ws)[0].send(JSON.stringify(obj));
            return;
        }
    };
    ws.onclose = async (e) => {
        clients = clients.filter((client) => client !== ws);
    }
});

const         PORT = 8080;
server.listen(PORT, () => {
    console.log(`✅ server running on port ${PORT} ✅`.toUpperCase());
});
