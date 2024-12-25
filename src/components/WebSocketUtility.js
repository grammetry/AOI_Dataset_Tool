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
        this.websocket.onopen = (event) => {
            console.log('websocket opened');
            //this.messageCallback = 'websocket opened';
        };
        this.websocket.onclose = (event) => {
            // setTimeout(function () {
            //     this.websocket.start();
            // }, 1000);

            console.log('websocket closed');
            //this.messageCallback = 'websocket closed';
            //this.start();
            // setTimeout(() => {
            //     this.start();
            // }, 3000);
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

