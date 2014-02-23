from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
from threading import Thread

class WebSocketHandler(WebSocket):
    event = None
    connections = []
    def handleConnected(self):
        print self.address, 'connected'
        WebSocketHandler.connections.append(self)

    def handleClose(self):
        print self.address, 'closed'
        WebSocketHandler.connections.remove(self)

class WebSocketServer(Thread):
    __dict__ = ["port", "server"]
    def __init__(self, addr, port):
        super(WebSocketServer, self).__init__()
        self.server = SimpleWebSocketServer(addr, port, WebSocketHandler)
    def run(self):
        self.server.running = True

        self.server.serveforever()
    def stop(self):
        self.server.running = False
        self.server.close()