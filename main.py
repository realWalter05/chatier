from flask import Flask, request, render_template
from flask_socketio import SocketIO, send
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = "WalterIsCull"
socketio = SocketIO(app, cors_allowed_origins="*")
usernames = {}

@app.route('/')
def index():
    print("Indexing")
    return render_template('index.html')

@app.route('/reset')
def reset():
    usernames = {}
    return render_template('index.html')

@socketio.on("message")
def handle_message(msg):
    if msg[0] == "set_username":
        # Setting username
        print(msg[1])
        usernames[request.sid] = msg[1]
        send(["usernames", msg[1]], broadcast=True)

    elif msg[0] == "message":
        if msg[1][0] in list(usernames.values()):
            print("Msg sent: " + str(msg))
            receiver = list(usernames.keys())[list(usernames.values()).index(msg[1][0])]
            message = [usernames[request.sid], msg[1][1], datetime.now().strftime("%H:%M:%S")]
            send(message, to=receiver)

@socketio.on("connect")
def handle_connection():
    print("Player connects:")
    # Save username to dictionary
    send(["usernames_full", list(usernames.values())], to=request.sid)
    usernames[request.sid] = ""

@socketio.on("disconnect")
def handle_connection():
    print("Player disconnects")
    # Save username to dictionary
    print(usernames)
    usernames.pop(request.sid)
    print(usernames)
    send(["usernames_full", list(usernames.values())], broadcast=True)
