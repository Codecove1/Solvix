# Solvix Chat App

This is a simple chat application with two AI models: a "Smart AI" for general conversation and a "Study AI" for academic questions.

## How to Run

### Backend

1.  Navigate to the `backend` directory.
2.  Install the dependencies: `pip install -r requirements.txt`
3.  Run the Flask server: `python app.py`

The server will be running at `http://127.0.0.1:5000`.

### Frontend

1.  Open the `frontend/index.html` file in your web browser.
2.  You can now chat with the AI!

## How to Test

1.  **Register a new user:**
    *   On the login screen, click "Register here".
    *   Enter a username and password and click "Register".
    *   You should see a success message.

2.  **Login:**
    *   You will be taken back to the login screen.
    *   Enter the credentials you just created and click "Login".

3.  **Test Free User Limitations:**
    *   You are now logged in as a free user.
    *   Notice that the "Super AI" model is disabled.
    *   Ask 5 questions using the "Smart AI" or "Study AI".
    *   On the 6th question, you should receive a message that you have reached your daily limit.

4.  **Upgrade to Premium:**
    *   Click the "Upgrade to Premium" button.
    *   A confirmation dialog will appear. Click "OK".
    *   You should see a success message, and the UI will update.

5.  **Test Premium Features:**
    *   Your status should now say "Premium User".
    *   The "Super AI" model is now available. Select it and ask a question.
    *   You can now ask more than 5 questions.

6.  **Logout:**
    *   Click the "Logout" button to return to the login screen.