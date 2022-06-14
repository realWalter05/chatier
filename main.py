from flask import Flask, request, render_template
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config["SECRET_KEY"] = "WalterIsCull"
socketio = SocketIO(app, cors_allowed_origins="*")
usernames = {}

@app.route('/')
def index():
    print("returning")
    return render_template('index.html')

@socketio.on("message")
def handle_message(msg):
    print(usernames[request.sid])

    if not usernames[request.sid]:
        # Setting username
        print("broadcasting username")
        usernames[request.sid] = msg
        send(["usernames_full", list(dict.fromkeys(list(usernames.values())))], broadcast=True)

    #elif msg == "usernames_request":
    #    print("sending")
    #    send(["usernames_full", list(dict.fromkeys(list(usernames.values())))], to=request.sid)

    else:
        receiver = list(usernames.keys())[list(usernames.values()).index(msg[0])]
        message = [usernames[request.sid], msg[1]]
        send(message, to=receiver)

@socketio.on("connect")
def handle_connection():
    print("connects")
    # Save username to dictionary
    usernames[request.sid] = ""


if __name__ == "__main__":
    print("HUH")
    #app.run()
    socketio.run(app)