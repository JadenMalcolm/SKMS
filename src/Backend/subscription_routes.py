###############################################################################
# Subscription routes module.
# Handles subscriptions to questions, allowing users to follow questions and get updates.
###############################################################################
from flask import Blueprint, request, jsonify
import sqlite3

subscription_routes = Blueprint('subscription_routes', __name__)

# Initialize SQLite database
conn = sqlite3.connect('users.db', check_same_thread=False)
cursor = conn.cursor()


@subscription_routes.route('/subscriptions', methods=['POST'])
def subscribe_to_question():
    # Subscribe a user to a question to receive notifications for new responses
    data = request.get_json()
    user_id = data.get('user_id')
    question_id = data.get('question_id')

    # Validate required fields
    if not user_id or not question_id:
        return jsonify({'error': 'User ID and Question ID are required.'}), 400

    # Check if subscription already exists
    cursor.execute(
        "SELECT * FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    subscription = cursor.fetchone()
    if subscription:
        return jsonify({'error': 'Already subscribed to this question.'}), 400

    # Create new subscription
    cursor.execute(
        "INSERT INTO subscriptions (user_id, question_id) VALUES (?, ?)", (user_id, question_id))
    conn.commit()
    return jsonify({'message': 'Subscribed to question successfully!'}), 201


@subscription_routes.route('/subscriptions', methods=['DELETE'])
def unsubscribe_from_question():
    # Remove a user's subscription from a question
    data = request.get_json()
    user_id = data.get('user_id')
    question_id = data.get('question_id')

    # Validate required fields
    if not user_id or not question_id:
        return jsonify({'error': 'User ID and Question ID are required.'}), 400

    # Delete subscription
    cursor.execute(
        "DELETE FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    conn.commit()
    return jsonify({'message': 'Unsubscribed from question successfully!'}), 200


@subscription_routes.route('/users/<int:user_id>/subscriptions', methods=['GET'])
def get_subscribed_questions(user_id):
    # Get all questions that a user has subscribed to
    cursor.execute('''
        SELECT q.id, q.question, q.category, q.timestamp, u.email
        FROM subscriptions s
        JOIN questions q ON s.question_id = q.id
        JOIN users u ON q.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY q.timestamp DESC
    ''', (user_id,))
    questions = cursor.fetchall()
    return jsonify([
        {'id': q[0], 'question': q[1], 'category': q[2], 'timestamp': q[3], 'user_email': q[4]}
        for q in questions
    ]), 200


@subscription_routes.route('/subscriptions/<int:user_id>/<int:question_id>', methods=['GET'])
def check_subscription(user_id, question_id):
    # Check if a user is subscribed to a specific question
    cursor.execute(
        "SELECT * FROM subscriptions WHERE user_id = ? AND question_id = ?", (user_id, question_id))
    subscription = cursor.fetchone()
    return jsonify(subscription is not None), 200
