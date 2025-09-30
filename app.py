import enum
from datetime import datetime

from email_validator import EmailNotValidError, validate_email
from flask import Flask, jsonify, redirect, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# My app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

# 🔹 Development secret key (change for production!)
app.secret_key = "dev_3kq2g9p1v8x4b7z6"  # randomly generated for dev use

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

    # NEW: role field
    class UserRole(enum.Enum):
        STUDENT = "STUDENT"
        STAFF = "STAFF"

    user_role = db.Column(db.Enum(UserRole), nullable=False)

    def __repr__(self):
        return f"User {self.user_id}"

    def set_pass_hash(self, password):
        self.user_password_hash = generate_password_hash(password)

    def check_pass_hash(self, password):
        return check_password_hash(self.user_password_hash, password)


class Report(db.Model):
    report_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    # Basic report info
    category = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    campus = db.Column(db.String(50), nullable=False)
    block = db.Column(db.String(50), nullable=False)
    nearest_class = db.Column(db.String(50))
    notes = db.Column(db.Text, nullable=False)

    # Status tracking
    status = db.Column(
        db.String(20), default="pending"
    )  # pending / in_progress / resolved

    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.report_id} by User {self.user_id}>"


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
    if request.method == "POST":
        # Detect JSON vs traditional form POST
        if request.is_json:
            data = request.get_json()
            email = data.get("email", "").strip().lower()
            password = data.get("password", "")
        else:
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")

        # Basic validation
        if not email or not password:
            msg = "Email, password, and role are required."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            else:
                return msg, 400

        if not is_valid_dut_email(email):
            msg = "Please use a valid DUT email (@dut.ac.za or @dut4life.ac.za)."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            else:
                return msg, 400

        user = User.query.filter_by(user_email=email).first()

        # 🔹 Check password
        if not user or not user.check_pass_hash(password):
            msg = "Invalid email or password."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 401
            return msg, 401

        # 🔹 Set session BEFORE returning
        session["user_id"] = user.user_id
        session["email"] = user.user_email

        # Return response
        if request.is_json:
            return jsonify({"success": True, "message": "Login successful"}), 200
        return redirect("/dashboard")

    return render_template("sign-in.html")


@app.route("/sign-up", methods=["POST", "GET"])
def sign_up():
    if request.method == "POST":
        # Detect JSON vs traditional form POST
        if request.is_json:
            data = request.get_json()
            email = data.get("email", "").strip().lower()
            password = data.get("password", "")
            role = data.get("role", "").upper()
        else:
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")
            role = request.form.get("role", "").upper()

        # Basic validation
        if not email or not password or not role:
            msg = "Email, password, and role are required."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            else:
                return msg, 400

        # Email format check
        if not is_valid_dut_email(email):
            msg = "Please use a valid DUT email (@dut.ac.za or @dut4life.ac.za)."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            else:
                return msg, 400

        # Role whitelist check
        valid_roles = ["STUDENT", "STAFF"]
        if role not in valid_roles:
            msg = "Invalid role selected."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            else:
                return msg, 400

        # Check for existing email
        if email_exists(email):
            msg = "Email already registered."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 409
            else:
                return msg, 409

        # All validations passed — create user
        try:
            new_user = User()
            new_user.user_email = email
            new_user.user_role = User.UserRole[role]
            new_user.set_pass_hash(password)

            db.session.add(new_user)
            db.session.commit()

            if request.is_json:
                return jsonify({"success": True}), 201
            else:
                return redirect("/")

        except Exception as e:
            # Log full error on server, but return safe message to client
            print(f"ERROR: {e}")
            msg = "An unexpected error occurred. Please try again."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 500
            else:
                return msg, 500

    # GET request → render signup page
    return render_template("sign-up.html")


@app.route("/report", methods=["POST", "GET"])
def report():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    if request.method == "POST":
        # Detect JSON vs traditional form POST
        if request.is_json:
            data = request.get_json()
            category = data.get("category")
            type = data.get("type")
            campus = data.get("campus")
            block = data.get("block")
            nearest_class = data.get("nearestClass")
            notes = data.get("notes")
        else:
            category = request.form.get("category")
            type = request.form.get("type")
            campus = request.form.get("campus")
            block = request.form.get("block")
            nearest_class = request.form.get("nearestClass")
            notes = request.form.get("notes")

        try:
            new_report = Report()
            new_report.user_id = session["user_id"]
            new_report.category = category
            new_report.campus = campus
            new_report.block = block
            new_report.notes = notes
            new_report.type = type
            new_report.nearest_class = nearest_class

            db.session.add(new_report)
            db.session.commit()

            msg = "Report submitted successfully."
            if request.is_json:
                return jsonify({"success": True, "message": msg}), 200
            else:
                return redirect("/dashboard")

        except Exception as e:
            print(f"ERROR: {e}")
            msg = "An unexpected error occurred. Please try again."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 500
            else:
                return msg, 500

    return render_template("report.html")


@app.route("/profile", methods=["POST", "GET"])
def profile():
    return render_template("profile.html")


@app.route("/dashboard", methods=["POST", "GET"])
def dashboard():
    return render_template("dashboard.html")


@app.route("/reset-db")
def reset_db():
    db.drop_all()
    db.create_all()
    return "Database reset!"


@app.route("/test-report")
def test_last_report():
    last_report = Report.query.order_by(Report.report_id.desc()).first()
    if last_report is None:
        return {"error": "No reports found"}

    user = User.query.get(last_report.user_id)

    return {
        "report": {
            "id": last_report.report_id,
            "category": last_report.category,
            "type": last_report.type,
            "campus": last_report.campus,
            "block": last_report.block,
            "nearest_class": last_report.nearest_class,
            "notes": last_report.notes,
            "user_id": last_report.user_id,
        },
        "user": {
            "id": user.user_id if user else None,
            "email": user.user_email if user else None,
            "role": user.user_role.value if user else None,
        },
    }


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
