###############################################################################
# Chatbot routes module.
# Provides basic chatbot functionality using fuzzy matching with predefined responses.
###############################################################################
from flask import Blueprint, request, jsonify
from rapidfuzz import process, fuzz


chatbot_routes = Blueprint('chatbot_routes', __name__)

# Predefined knowledge base for chatbot responses
knowledge_base = {
    "home": "You can visit the Home page to explore our platform.",
    "contact": "You can contact us via the Contact page or email support@example.com.",
    "features": "Our system includes appointment booking, real-time chat, and a service dashboard.",
    "support": "Support is available 24/7 through chat or our Help Center.",
    "about": "We are a student-built SKMS system designed to streamline service operations.",
    "faq": "The FAQ section answers common questions about the system.",
    "appointments": "You can schedule, reschedule, or cancel appointments from the portal.",
    "login": "Login with your registered email and password through the login page.",
    "signup": "Sign up as a user or support agent depending on your role."
}

# Common conversational intents
intents = {
    "hello": "Hi there! How can I assist you today?",
    "hi": "Hello! Feel free to ask me anything.",
    "help": "Sure! Ask me about appointments, login, contact info, and more.",
    "thanks": "You're welcome!",
    "thank you": "You're welcome!"
}

@chatbot_routes.route('/chat', methods=['POST'])

def chat():
    # Process user chat message and return appropriate response
    data = request.get_json()
    user_message = data.get("message", "").strip().lower()

    # Validate input
    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    # Check for direct intent matches first (greetings, thanks, etc.)
    for intent, response in intents.items():
        if intent in user_message:
            return jsonify({"response": response, "suggestions": list(knowledge_base.keys())})

    # Check for exact keyword matches in knowledge base
    for key in knowledge_base.keys():
        if key in user_message:
            return jsonify({"response": knowledge_base[key], "suggestions": []})

    # Use fuzzy matching as fallback for imprecise queries
    matches = process.extract(user_message, knowledge_base.keys(), scorer=fuzz.token_sort_ratio, limit=3)
    best_match, confidence, _ = matches[0]

    # Determine response based on match confidence
    if confidence > 85:
        # High confidence match
        return jsonify({"response": knowledge_base[best_match], "suggestions": []})
    elif confidence > 60:
        # Medium confidence match with suggestions
        suggestions = [match[0] for match in matches if match[0] != best_match]
        return jsonify({"response": knowledge_base[best_match], "suggestions": suggestions})
    else:
        # Low confidence, provide general help
        return jsonify({
            "response": "I'm not sure I understand. Here are some things I can help with:",
            "suggestions": list(knowledge_base.keys())
        })
