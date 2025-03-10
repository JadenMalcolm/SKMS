from dm_routes import dm_routes
from chatbot_routes import chatbot_routes
from vote_routes import vote_routes
from subscription_routes import subscription_routes
from response_routes import response_routes
from question_routes import question_routes
from auth_routes import auth_routes
import sqlite3
from flask_cors import CORS
from flask import Flask
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.dont_write_bytecode = True


app = Flask(__name__)
CORS(app)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Import routes

# Register routes
app.register_blueprint(auth_routes)
app.register_blueprint(question_routes)
app.register_blueprint(response_routes)
app.register_blueprint(subscription_routes)
app.register_blueprint(vote_routes)
app.register_blueprint(chatbot_routes)
app.register_blueprint(dm_routes)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
