from flask import Blueprint, request, jsonify
from rapidfuzz import process, fuzz

chatbot_routes = Blueprint('chatbot_routes', __name__)

knowledge_base = {
    "home": "home",
    "contact": "Contact",
    "features": "Features",
    "support": "Support",
    "about": "FAQ"
}

# Define the /chat endpoint to handle POST requests


@chatbot_routes.route('/chat', methods=['POST'])
def chat():
    # Get the user message from the request body (in JSON format)
    data = request.get_json()
    user_message = data.get("message", "").strip().lower()

    # Check if the message is empty
    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    # Use fuzzy matching to find the best response from the knowledge base
    matches = process.extract(
        user_message, knowledge_base.keys(), scorer=fuzz.ratio, limit=3)

    # Ignore the index value (third element)
    best_match, confidence, _ = matches[0]

    # If the confidence is high enough, return the response
    if confidence > 80:
        return jsonify({"response": knowledge_base[best_match], "suggestions": []})

    # If confidence is low, suggest some similar responses
    suggestions = list(knowledge_base.keys())
    return jsonify({"response": "I'm not sure. Did you mean one of these?", "suggestions": suggestions})
