import sqlite3
from werkzeug.security import generate_password_hash
from cryptography.fernet import Fernet
import os

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Create tables
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','expert-asset','expert-threat','expert-securitygoal','expert-countermeasure','expert-defensestrategy', 'expert-vulnerability','employee')) DEFAULT 'employee',
    securityQuestion TEXT NOT NULL,
    securityQuestionAnswer TEXT NOT NULL
)''')
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

cursor.execute('''CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    response TEXT NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS user_votes (
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    vote_type TEXT CHECK(vote_type IN ('upvote', 'downvote', 'report')) NOT NULL,
    PRIMARY KEY (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (question_id) REFERENCES questions (id)
)''')

cursor.execute('''CREATE TABLE IF NOT EXISTS direct_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
)''')

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

# Add feedback table
cursor.execute('''CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    feedback_type TEXT NOT NULL CHECK(feedback_type IN ('voice', 'report')),
    feedback_text TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP,'LOCALTIME')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
)''')

# Enable foreign key constraints in SQLite
cursor.execute('PRAGMA foreign_keys = ON')


conn.commit()

key_file = 'secret.key'
if not os.path.exists(key_file):
    key = Fernet.generate_key()
    with open(key_file, 'wb') as f:
        f.write(key)
else:
    with open(key_file, 'rb') as f:
        key = f.read()

# Create admin user if not exists
admin_email = 'admin@example.com'.lower()  # Convert to lowercase
admin_password = 'Admin@123'
admin_role = 'admin'
hashed_password = generate_password_hash(admin_password)
security_question = 'Admin Security Question'
security_question_answer = 'adminsecurityanswer'

hashed_security_answer = generate_password_hash(security_question_answer)

cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (admin_email,))
user_exists = cursor.fetchone()[0]
if not user_exists:
    cursor.execute("INSERT INTO users (email, password, role, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?, ?)", (admin_email, hashed_password, admin_role, security_question, hashed_security_answer))
    conn.commit()

# Create users for all expert categories if not exists
expert_categories = [
    'expert-asset', 'expert-threat', 'expert-securitygoal',
    'expert-countermeasure', 'expert-defensestrategy',
    'expert-vulnerability'
]

for category in expert_categories:
    expert_email = f'{category}@example.com'.lower()  # Convert to lowercase
    expert_password = f'{category.capitalize()}@123'
    hashed_password = generate_password_hash(expert_password)
    cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (expert_email,))
    user_exists = cursor.fetchone()[0]
    if not user_exists:
        cursor.execute("INSERT INTO users (email, password, role, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?, ?)", (expert_email, hashed_password, category, security_question, hashed_security_answer))
        conn.commit()
conn.close()
