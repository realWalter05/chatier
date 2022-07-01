from flask import Flask, request, render_template
from flask_socketio import SocketIO, send, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = "WalterIsCull"
socketio = SocketIO(app, cors_allowed_origins="*")
clients = {}

def set_get_msg(content, sender, receiver):
    return {
        "content" : content,
        "sender" : sender,
        "receiver" : receiver
    }

@app.route('/')
def index():
    print("Indexing")
    return render_template('index.html')

@socketio.on("client_registration")
def register_client(username):
    print(f"{username} wants to register with an id {request.sid}")
    client_id = request.sid
    
    if username in clients.values():
        emit("username_taken", to=client_id)
        return
    clients[client_id] = username

@socketio.on("message")
def handle_message(msg):
    client_id = request.sid
    if client_id in clients.keys():
        print("Msg sent: " + str(msg))
        # Getting the receiver sid
        if not msg["receiver"] in clients.values():
            print("Receiver is not online")
            return
        receiver = list(clients.keys())[list(clients.values()).index(msg["receiver"])]
        msg = {
            "sender" : clients[client_id],
            "content" : msg["content"]
        }
        send(msg, to=receiver)

@socketio.on("connect")
def handle_connection():
    print("Player connects:")
    # Save username to dictionary
   # send(["clients_full", list(clients.values())], broadcast=True)
    clients[request.sid] = ""

@socketio.on("disconnect")
def handle_connection():
    print("Player disconnects")
    # Save username to dictionary
    print(clients)
    clients.pop(request.sid)
    clients.pop(request.sid)
    print(clients)
   # send(["clients_full", list(clients.values())], broadcast=True)
