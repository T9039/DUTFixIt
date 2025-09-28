from datetime import datetime

from email_validator import EmailNotValidError, validate_email
from flask import Flask, jsonify, redirect, render_template, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# My app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

# Data class(not the same thing) ~ row of data


class Task(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(50), nullable=False)
    task_email = db.Column(db.String(120), unique=True, nullable=False)
    task_message = db.Column(db.Text, nullable=True)  # good for longer free text
    task_complete = db.Column(db.Integer, default=0)
    task_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Request {self.task_id}"


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), unique=True, nullable=False)
    user_created = db.Column(db.DateTime, default=datetime.utcnow)
    user_password_hash = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"User {self.user_id}"

    def set_pass_hash(self, password):
        self.user_password_hash = generate_password_hash(password)

    def check_pass_hash(self, password):
        return check_password_hash(self.user_password_hash, password)


def is_valid_dut_email(email: str) -> bool:
    """
    Checks if the email has valid format and DUT domain.
    """
    try:
        v = validate_email(email)
        email_normalized = v.email.lower()
        if not (
            email_normalized.endswith("@dut.ac.za")
            or email_normalized.endswith("@dut4life.ac.za")
        ):
            return False
        return True
    except EmailNotValidError:
        return False


def email_exists(email: str) -> bool:
    """
    Checks if the email is already registered in the database.
    """
    email = email.strip().lower()
    return User.query.filter_by(user_email=email).first() is not None


@app.route("/", methods=["POST", "GET"])
def index():
    if request.method == "POST":
        # Handle JSON POST from JS
        if request.is_json:
            data = request.get_json()
            name = data.get("name", "")
            email = data.get("email", "")
            message = data.get("message", "")
        else:
            # fallback for normal HTML form POST
            name = request.form.get("name", "")
            email = request.form.get("email", "")
            message = request.form.get("message", "")

        # Basic validation
        if not name.strip() or not email.strip():
            if request.is_json:
                return jsonify(
                    {"success": False, "error": "Name and email are required"}
                ), 400
            else:
                return "Error: Name and email are required", 400

        new_task = Task()
        new_task.task_name = name.strip()
        new_task.task_email = email.strip().lower()  # normalize email
        new_task.task_message = message.strip() if message else None

        try:
            db.session.add(new_task)
            db.session.commit()

            # Return appropriate response based on request type
            if request.is_json:
                return jsonify(
                    {
                        "success": True,
                        "message": "Data submitted successfully",
                        "data": {
                            "id": new_task.task_id,
                            "name": new_task.task_name,
                            "email": new_task.task_email,
                            "created": new_task.task_created.isoformat(),
                        },
                    }
                )
            else:
                return redirect("/")

        except Exception as e:
            print(f"ERROR: {e}")  # server log only

            error_msg = (
                "This email address is already registered"
                if "UNIQUE constraint failed" in str(e)
                else "An unexpected error occurred"
            )

            if request.is_json:
                return jsonify({"success": False, "message": error_msg}), 409
            else:
                return f"ERROR: {error_msg}", 409

    return render_template("form.html")


@app.route("/sign-in", methods=["POST", "GET"])
def sign_in():
    return render_template("sign-in.html")


@app.route("/sign-up", methods=["POST", "GET"])
def sign_up():
    if request.method == "POST":
        # Handle JSON POST from JS
        if request.is_json:
            data = request.get_json()
            email = data.get("email", "")
            password = data.get("password", "")
        else:
            # fallback for normal HTML form POST
            email = request.form.get("email", "")
            password = request.form.get("password", "")

        # Basic validation
        if not password.strip() or not email.strip():
            if request.is_json:
                return jsonify(
                    {"success": False, "error": "Email and Password are required"}
                ), 400
            else:
                return "Error: Email and Password are required", 400

        new_user = User()
        new_user.set_pass_hash(password)
        new_user.user_email = email.strip().lower()  # normalize email

        try:
            db.session.add(new_user)
            db.session.commit()

            if request.is_json:
                return jsonify(
                    {
                        "success": True,
                    }
                ), 201
            else:
                return redirect("/")

        except Exception as e:
            print(f"ERROR: {e}")  # server log only

            error_msg = (
                "This email address is already registered"
                if "UNIQUE constraint failed" in str(e)
                else "An unexpected error occurred"
            )

            if request.is_json:
                return jsonify({"success": False, "message": error_msg}), 409
            else:
                return f"ERROR: {error_msg}", 409

    return render_template("sign-up.html")


@app.route("/report", methods=["POST", "GET"])
def report():
    return render_template("report.html")


@app.route("/profile", methods=["POST", "GET"])
def profile():
    return render_template("profile.html")


@app.route("/dashboard", methods=["POST", "GET"])
def dashboard():
    return render_template("dashboard.html")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
