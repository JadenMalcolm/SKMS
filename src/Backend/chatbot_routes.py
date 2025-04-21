from flask import Blueprint, request, jsonify
from rapidfuzz import process, fuzz

chatbot_routes = Blueprint('chatbot_routes', __name__)

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

intents = {
    "hello": "Hi there! How can I assist you today?",
    "hi": "Hello! Feel free to ask me anything.",
    "help": "Sure! Ask me about appointments, login, contact info, and more.",
    "thanks": "You're welcome!",
    "thank you": "You're welcome!"
}

@chatbot_routes.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip().lower()

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    # Quick intent match
    for intent, response in intents.items():
        if intent in user_message:
            return jsonify({"response": response, "suggestions": list(knowledge_base.keys())})

    # Exact keyword match before fuzzy search
    for key in knowledge_base.keys():
        if key in user_message:
            return jsonify({"response": knowledge_base[key], "suggestions": []})

    # Fuzzy match fallback
    matches = process.extract(user_message, knowledge_base.keys(), scorer=fuzz.token_sort_ratio, limit=3)
    best_match, confidence, _ = matches[0]

    if confidence > 85:
        return jsonify({"response": knowledge_base[best_match], "suggestions": []})
    elif confidence > 60:
        suggestions = [match[0] for match in matches if match[0] != best_match]
        return jsonify({"response": knowledge_base[best_match], "suggestions": suggestions})
    else:
        return jsonify({
            "response": "I'm not sure I understand. Here are some things I can help with:",
            "suggestions": list(knowledge_base.keys())
        })
