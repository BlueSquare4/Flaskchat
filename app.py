from flask import Flask, render_template
import pyrebase
from flask_socketio import SocketIO
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
socketio = SocketIO(app)

# Firebase initialization
config = {
    "apiKey": "AIzaSyCQ_8hJgjGxEx9YS3Sr7mK9bs6lBTox6_o",
    "authDomain": "chat-app-a2345.firebaseapp.com",
    "projectId": "chat-app-a2345",
    "databaseURL": "https://chat-app-a2345-default-rtdb.asia-southeast1.firebasedatabase.app/",
    "storageBucket": "chat-app-a2345.appspot.com",
    "messagingSenderId": "918707434125",
    "appId": "1:918707434125:web:ddee98356269225ac0e8c4",
    "measurementId": "G-BQM90307YZ",
}
firebase = pyrebase.initialize_app(config)
db = firebase.database()
firebase_db = db.child("message")

@app.route("/")
def index():
    return render_template("index.html")


@socketio.on('user_connected')
def handle_user_connected(user_name):
    messages = firebase_db.get()
    previous_messages = []
    if messages is not None:
        for key, value in messages.items():
            previous_messages.append({'sender': value['sender'], 'message': value['message']})
    socketio.emit('previous_messages', previous_messages, room=sid)  # Use sid here
    socketio.emit('message', {'sender': 'System', 'message': f"{user_name} has joined the chat!"}, broadcast=True)


@socketio.on('message')
def handle_message(data):
    socketio.emit('message', data)
    firebase_db.push({'sender': data['sender'], 'message': data['message']})


@socketio.on('request_previous_messages')
def handle_request_previous_messages():
    messages = firebase_db.get()
    previous_messages = []
    if messages is not None:
        for key, value in messages.items():
            previous_messages.append({'sender': value['sender'], 'message': value['message']})
    socketio.emit('previous_messages', previous_messages, room=sid)  # Use sid here


if __name__ == "__main__":
    app.run(debug=True, port=3306)
