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

@socketio.on("message")
def handle_message(msg):
    if msg[0] == "set_username":
        # Setting username
        print(msg[1])
        usernames[request.sid] = msg[1]
        send(["usernames", msg[1]], broadcast=True)

    elif msg[0] == "message":
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


if __name__ == "__main__":
    print("Chatier intiated.")
    socketio.run(app, host='0.0.0.0')