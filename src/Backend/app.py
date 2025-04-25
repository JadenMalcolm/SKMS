###############################################################################
# Main Flask application entry point.
# Configures and starts the Flask server with all route blueprints registered.
###############################################################################
from dm_routes import dm_routes
from chatbot_routes import chatbot_routes
from vote_routes import vote_routes
from subscription_routes import subscription_routes
from response_routes import response_routes
from question_routes import question_routes
from auth_routes import auth_routes
from meeting_routes import meeting_routes
from feedback_routes import feedback_routes
from users_routes import users_routes
import sqlite3
from flask_cors import CORS
from flask import Flask
import sys
import os
from waitress import serve
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.dont_write_bytecode = True


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Register routes
app.register_blueprint(auth_routes)
app.register_blueprint(question_routes)
app.register_blueprint(response_routes)
app.register_blueprint(subscription_routes)
app.register_blueprint(vote_routes)
app.register_blueprint(chatbot_routes)
app.register_blueprint(dm_routes)
app.register_blueprint(meeting_routes)
app.register_blueprint(feedback_routes)
app.register_blueprint(users_routes)


if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000, threads=4, url_prefix='/api')
