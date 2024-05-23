export default class WebSocketUtility {
    constructor(url) {
        this.url = url;
        this.websocket = null;
        this.messageCallback = null;
    }

    start() {
        this.websocket = new WebSocket(this.url);
        this.websocket.onmessage = (event) => {
            if (this.messageCallback) {
                this.messageCallback(event.data);
            }
        };
    }

    stop() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    setMessageCallback(callback) {
        this.messageCallback = callback;
    }
}

