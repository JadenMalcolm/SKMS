###############################################################################
# Database Setup Module
# Initializes the SQLite database structure and creates default users
# Handles table creation and default admin/expert accounts
###############################################################################

import sqlite3
from werkzeug.security import generate_password_hash
from cryptography.fernet import Fernet
import os

# Initialize SQLite database connection with thread safety
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

###############################################################################
# Database Schema Definition
###############################################################################

# Users table - stores user accounts and authentication info
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','expert-asset','expert-threat','expert-securitygoal','expert-countermeasure','expert-defensestrategy', 'expert-vulnerability','employee')) DEFAULT 'employee',
    securityQuestion TEXT NOT NULL,
    securityQuestionAnswer TEXT NOT NULL
)''')

# Questions table - stores user questions with voting metrics
cursor.execute('''CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Asset', 'Threat', 'Security Goal', 'Countermeasure', 'Defense Strategy', 'Vulnerability')),
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    upvotes INTEGER NOT NULL DEFAULT 0, -- Store upvote count
    downvotes INTEGER NOT NULL DEFAULT 0, -- Store downvote count
    reports INTEGER NOT NULL DEFAULT 0, -- Store report count
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)''')

# Responses table - stores answers to questions
cursor.execute('''CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    response TEXT NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)''')

# Subscriptions table - tracks users following specific questions
cursor.execute('''CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
)''')

# User_votes table - tracks individual user votes on questions
cursor.execute('''CREATE TABLE IF NOT EXISTS user_votes (
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    vote_type TEXT CHECK(vote_type IN ('upvote', 'downvote', 'report')) NOT NULL,
    PRIMARY KEY (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (question_id) REFERENCES questions (id)
)''')

# Direct_messages table - stores private messages between users
cursor.execute('''CREATE TABLE IF NOT EXISTS direct_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
)''')

# Meetings table - manages meeting requests and their status
cursor.execute('''CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    meeting_type TEXT NOT NULL CHECK(meeting_type IN ('in-person', 'online')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('accepted', 'rejected', 'pending')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE CASCADE
)''')

# Feedback table - collects user feedback about the system
cursor.execute('''CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    feedback_type TEXT NOT NULL CHECK(feedback_type IN ('voice', 'report')),
    feedback_text TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
)''')

# Enable foreign key constraints for data integrity
cursor.execute('PRAGMA foreign_keys = ON')

# Commit schema changes
conn.commit()

###############################################################################
# Security Key Generation
###############################################################################

# Create or load encryption key for secure operations
key_file = 'secret.key'
if not os.path.exists(key_file):
    # Generate new key if none exists
    key = Fernet.generate_key()
    with open(key_file, 'wb') as f:
        f.write(key)
else:
    # Load existing key
    with open(key_file, 'rb') as f:
        key = f.read()

###############################################################################
# Default User Creation
###############################################################################

# Create admin user if not exists
admin_email = 'admin@example.com'.lower()  # Convert to lowercase
admin_password = 'Admin@123'
admin_role = 'admin'
hashed_password = generate_password_hash(admin_password)
security_question = 'Admin Security Question'
security_question_answer = 'adminsecurityanswer'

# Hash the security answer for secure storage
hashed_security_answer = generate_password_hash(security_question_answer)

# Check if admin already exists
cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (admin_email,))
user_exists = cursor.fetchone()[0]
if not user_exists:
    # Insert admin user
    cursor.execute("INSERT INTO users (email, password, role, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?, ?)", (admin_email, hashed_password, admin_role, security_question, hashed_security_answer))
    conn.commit()

# Create expert users for each domain category
expert_categories = [
    'expert-asset', 'expert-threat', 'expert-securitygoal',
    'expert-countermeasure', 'expert-defensestrategy',
    'expert-vulnerability'
]

# Loop through expert categories and create users
for category in expert_categories:
    expert_email = f'{category}@example.com'.lower()  # Convert to lowercase
    expert_password = f'{category.capitalize()}@123'
    hashed_password = generate_password_hash(expert_password)
    
    # Check if expert already exists
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (expert_email,))
    user_exists = cursor.fetchone()[0]
    if not user_exists:
        # Insert expert user
        cursor.execute("INSERT INTO users (email, password, role, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?, ?)", (expert_email, hashed_password, category, security_question, hashed_security_answer))
        conn.commit()

# Close database connection
conn.close()
