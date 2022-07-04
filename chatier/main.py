from flask import Flask, request, render_template, jsonify
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

def get_client_count():
    return len(list(clients.keys()))

@app.route('/')
def index():
    print("Indexing")
    return render_template('index.html')

@app.route('/get_online_clients', methods=["POST"])
def get_online_clients():
    print(list(clients.values()))
    return jsonify(list(clients.values()))


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
            "content" : msg["content"],
            "time" : msg["time"]
        }
        send(msg, to=receiver)

@socketio.on("connect")
def handle_connection():
    print("Player connects:")
    # Save username to dictionary
    clients[request.sid] = ""
    emit("online_count", get_client_count(), broadcast=True)


@socketio.on("disconnect")
def handle_connection():
    print("Player disconnects")
    # Remove player from list of online clients
    clients.pop(request.sid)
    emit("online_count", get_client_count(), broadcast=True)
