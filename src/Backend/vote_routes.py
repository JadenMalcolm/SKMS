from flask import Blueprint, request, jsonify
import sqlite3

vote_routes = Blueprint('vote_report_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()

@vote_routes.route('/questions/<int:id>/upvote', methods=['POST'])
def upvote_question(id):
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    cursor.execute("SELECT * FROM upvotes WHERE user_id = ? AND question_id = ?", (user_id, id))
    upvote = cursor.fetchone()
    if upvote:
        return jsonify({'error': 'Already upvoted this question.'}), 400

    cursor.execute("INSERT INTO upvotes (user_id, question_id) VALUES (?, ?)", (user_id, id))
    conn.commit()
    return jsonify({'message': 'Question upvoted successfully!'}), 201

@vote_routes.route('/questions/<int:id>/downvote', methods=['POST'])
def downvote_question(id):
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    cursor.execute("SELECT * FROM downvotes WHERE user_id = ? AND question_id = ?", (user_id, id))
    downvote = cursor.fetchone()
    if downvote:
        return jsonify({'error': 'Already downvoted this question.'}), 400

    cursor.execute("INSERT INTO downvotes (user_id, question_id) VALUES (?, ?)", (user_id, id))
    conn.commit()
    return jsonify({'message': 'Question downvoted successfully!'}), 201

@vote_routes.route('/questions/<int:id>/report', methods=['POST'])
def report_question(id):
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required.'}), 400

    cursor.execute("SELECT * FROM reports WHERE user_id = ? AND question_id = ?", (user_id, id))
    reported = cursor.fetchone()
    if reported:
        return jsonify({'error': 'Already reported this question.'}), 400

    cursor.execute("INSERT INTO reports (user_id, question_id) VALUES (?, ?)", (user_id, id))
    conn.commit()
    return jsonify({'message': 'Question reported successfully!'}), 201

@vote_routes.route('/upvotes/count/<int:question_id>', methods=['GET'])
def count_upvotes(question_id):
    cursor.execute('SELECT COUNT(*) FROM upvotes WHERE question_id = ?', (question_id,))
    count = cursor.fetchone()[0]
    return jsonify(count=count)

@vote_routes.route('/downvotes/count/<int:question_id>', methods=['GET'])
def count_downvotes(question_id):
    cursor.execute('SELECT COUNT(*) FROM downvotes WHERE question_id = ?', (question_id,))
    count = cursor.fetchone()[0]
    return jsonify(count=count)

@vote_routes.route('/reports/count/<int:question_id>', methods=['GET'])
def count_reports(question_id):
    cursor.execute('SELECT COUNT(*) FROM reports WHERE question_id = ?', (question_id,))
    count = cursor.fetchone()[0]
    return jsonify(count=count)
