import sqlite3
from werkzeug.security import generate_password_hash

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

# Create tables
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','expert','employee')) DEFAULT 'employee',
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

# Enable foreign key constraints in SQLite
cursor.execute('PRAGMA foreign_keys = ON')


conn.commit()

# Create admin user if not exists
admin_email = 'admin@example.com'
admin_password = 'Admin@123'
admin_role = 'admin'
hashed_password = generate_password_hash(admin_password)
security_question = 'Admin Security Question'
security_question_answer = 'adminsecurityanswer'

hashed_security_answer = generate_password_hash(security_question_answer)

cursor.execute("SELECT COUNT(*) FROM users WHERE email = ?", (admin_email,))
user_exists = cursor.fetchone()[0]

if user_exists == 0:
    cursor.execute("INSERT INTO users (email, password, role, securityQuestion, securityQuestionAnswer) VALUES (?, ?, ?, ?, ?)", (admin_email, hashed_password, admin_role, security_question, hashed_security_answer))
    conn.commit()
    print("Admin user inserted successfully.")
else:
    print("Admin user already exists.")

conn.close()
