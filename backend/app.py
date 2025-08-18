from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import datetime

app = Flask(__name__)
CORS(app)

# --- In-memory User Database ---
users = {}
# To reset daily counts
last_reset_day = datetime.date.today().day

# --- AI Models ---
study_knowledge_base = {
    "what is the capital of france?": "The capital of France is Paris.",
    "who wrote 'to kill a mockingbird'?": "Harper Lee wrote 'To Kill a Mockingbird'.",
    "what is the powerhouse of the cell?": "The mitochondrion is known as the powerhouse of the cell.",
    "explain the theory of relativity": "Einstein's theory of relativity is a complex topic, but it generally refers to two interrelated theories: special relativity and general relativity. It has had a significant impact on our understanding of space, time, gravity, and the universe.",
}
smart_ai_responses = [
    "That's an interesting thought!", "I see what you mean.",
    "Could you tell me more about that?", "I'm still learning, but that's a great point.",
    "Let's talk about something else. What's on your mind?",
]
super_ai_responses = [
    "Analyzing your query with advanced logic... The answer is likely more complex than it appears.",
    "From a multi-faceted perspective, the core of your message seems to be...",
    "That's a profound question. Let me provide a detailed, multi-layered answer.",
    "Accessing my advanced knowledge base... Here is a comprehensive explanation.",
]


# --- User Management Endpoints ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    if username in users:
        return jsonify({'error': 'Username already exists'}), 400

    users[username] = {
        'password': password, # In a real app, hash this!
        'is_premium': False,
        'daily_question_count': 0,
    }
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users.get(username)
    if user and user['password'] == password:
        return jsonify({'token': username})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/user_status', methods=['GET'])
def user_status():
    username = request.headers.get('Authorization')
    user = users.get(username)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    global last_reset_day
    today = datetime.date.today().day
    if today != last_reset_day:
        for u in users.values():
            u['daily_question_count'] = 0
        last_reset_day = today

    return jsonify({
        'username': username,
        'is_premium': user['is_premium'],
        'daily_question_count': user['daily_question_count'],
    })

@app.route('/upgrade', methods=['POST'])
def upgrade():
    username = request.headers.get('Authorization')
    user = users.get(username)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user['is_premium'] = True
    return jsonify({'message': 'Congratulations! You are now a premium user.'})


# --- Chat Endpoint (Now with Premium Features) ---
@app.route('/chat', methods=['POST'])
def chat():
    username = request.headers.get('Authorization')
    user = users.get(username)
    if not user:
        return jsonify({'error': 'Authentication required'}), 401

    # Check usage limits for free users
    if not user['is_premium']:
        if user['daily_question_count'] >= 5:
            return jsonify({'response': 'You have reached your daily limit of 5 questions. Please upgrade to premium for unlimited access.'}), 429 # Too Many Requests

    data = request.get_json()
    message = data.get('message', '').lower().strip()
    model = data.get('model', 'smart')

    # Check for premium model access
    if model == 'super' and not user['is_premium']:
        return jsonify({'response': 'The Super AI is a premium feature. Please upgrade to access it.'}), 403 # Forbidden

    response = "I'm not sure how to respond to that."

    if model == 'study':
        response = study_knowledge_base.get(message, "I can only answer specific study questions I've been taught.")
    elif model == 'smart':
        response = random.choice(smart_ai_responses)
    elif model == 'super':
        # This check is technically redundant, but good for clarity
        if user['is_premium']:
            response = random.choice(super_ai_responses)

    # Increment question count for free users *after* a successful response
    if not user['is_premium']:
        user['daily_question_count'] += 1

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
