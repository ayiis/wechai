(function() {
    let my_ws = {
        init: function(ws_url) {
            let self = this;
            self.ws = new WebSocket(ws_url);
            self.ws.onopen = function(){ self.onopen() };
            self.ws.onmessage = function(event){ self.onmessage(event) };
        },
        onopen: function() {
            console.log("init");
        },
        onmessage: function(event) {
            console.log("onmessage:", event);
        },
        send: function(data) {
            self.ws.send(data);
        }
    };

    window.my_ws = my_ws;
})();
