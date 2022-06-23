from main import app, socketio

if __name__ == "__main__":
    print("Chatier intiated.")
    socketio.run(app)
