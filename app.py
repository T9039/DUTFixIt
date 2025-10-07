import os
import random
import smtplib
import socket
import sqlite3
import uuid
from datetime import datetime, timedelta
from enum import Enum

from email_validator import EmailNotValidError, validate_email
from flask import (
    Flask,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

# My app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

# 🔹 Development secret key (change for production!)
app.secret_key = "dev_**********x4b7z6"  # randomly generated for dev use


def generate_otp():
    return str(random.randint(100000, 999999))


def send_email(to_email, subject, body):
    try:
        socket.create_connection(("smtp.mailtrap.io", 587), timeout=5)
        print("Can reach Mailtrap SMTP!")
    except Exception as e:
        print("Cannot connect to Mailtrap:", e)

    """
    Simplest option: use Gmail SMTP or Mailtrap.io (free).
    For a school project you can hardcode Mailtrap credentials.
    """
    from_email = "aa66b1448e7173"
    from_password = "370f53b9a831dc"

    try:
        with smtplib.SMTP("smtp.mailtrap.io", 587) as server:
            server.starttls()
            server.login(from_email, from_password)
            message = f"Subject: {subject}\n\n{body}"
            server.sendmail(from_email, to_email, message)
        return True
    except Exception as e:
        print("Email send failed:", e)
        return False


def validate_db(email, table):
    conn = sqlite3.connect("instance/user_validate.db")
    conn.row_factory = sqlite3.Row  # lets you access columns by name
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {table} WHERE email = ?", (email,))
    result = cur.fetchone()
    conn.close()
    return result


class UserRole(Enum):
    STUDENT = "student"
    ADMIN = "admin"
    STAFF = "staff"
    TECHNICIAN = "technician"


DUMMY_TECHNICIANS = [
    {"id": 1, "name": "John Doe", "current_jobs": 2},
    {"id": 2, "name": "Jane Smith", "current_jobs": 1},
    {"id": 3, "name": "Ali Musa", "current_jobs": 0},
]

reports = [
    {
        "ref": "R-2025-001",
        "category": "Electrical",
        "type": "Light Bulb",
        "status": "pending",
        "technician": "John Doe",
        "count": 2,
        "description": "Light not turning on in Lecture Room 1.",
        "campus": "Steve Biko",
    },
    {
        "ref": "R-2025-002",
        "category": "Plumbing",
        "type": "Sink",
        "status": "in-progress",
        "technician": "Mary Smith",
        "count": 4,
        "description": "Leaking sink in staff restroom.",
        "campus": "ML Sultan",
    },
    {
        "ref": "R-2025-003",
        "category": "Infrastructure",
        "type": "Door",
        "status": "done",
        "technician": "Unassigned",
        "count": 0,
        "description": "Broken door in classroom 4B.",
        "campus": "Ritson",
    },
]


# Data class(not the same thing) ~ row of data
class Task(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(50), nullable=False)
    task_email = db.Column(db.String(120), unique=True, nullable=False)
    # good for longer free text
    task_message = db.Column(db.Text, nullable=True)
    task_complete = db.Column(db.Integer, default=0)
    task_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Request {self.task_id}"


# Base User Model
class User(db.Model):
    __tablename__ = "user"

    user_id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), unique=True, nullable=False)
    user_password_hash = db.Column(db.String(255), nullable=False)
    user_role = db.Column(db.Enum(UserRole), nullable=False)
    user_surname = db.Column(db.String(100))
    initials = db.Column(db.String(10))
    user_system_id = db.Column(db.String(20))
    user_created = db.Column(db.DateTime, default=datetime.utcnow)

    def set_pass_hash(self, password):
        self.user_password_hash = generate_password_hash(password)

    def check_pass_hash(self, password):
        return check_password_hash(self.user_password_hash, password)


class Report(db.Model):
    __tablename__ = "reports"

    report_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    campus = db.Column(db.String(50), nullable=False)
    block = db.Column(db.String(50), nullable=False)
    nearest_class = db.Column(db.String(50))
    notes = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="pending")
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # New
    assignment = db.relationship("Assignment", back_populates="report", uselist=False)

    def __repr__(self):
        return f"<Report {self.report_id} by User {self.user_id}>"


class Assignment(db.Model):
    __tablename__ = "assignments"

    assignment_id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(
        db.Integer, db.ForeignKey("reports.report_id"), nullable=False
    )
    technician_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="in-progress")

    report = db.relationship("Report", back_populates="assignment")
    technician = db.relationship("User", foreign_keys=[technician_id])
    admin = db.relationship("User", foreign_keys=[admin_id])


class NotificationType(Enum):
    STATUS_UPDATE = "Status Update"
    BROADCAST = "Broadcast"
    ASSIGNMENT = "Assignment"
    MESSAGE = "Message"


class Notification(db.Model):
    __tablename__ = "notifications"

    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    type = db.Column(
        db.Enum(NotificationType),
        nullable=False,
        default=NotificationType.STATUS_UPDATE,
    )
    # may be None for broadcasts
    report_ref = db.Column(db.String(50), nullable=True)
    heading = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sender = db.Column(db.String(50), nullable=False, default="System")

    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Optional relationships
    user = db.relationship("User", backref=db.backref("notifications", lazy=True))

    def to_dict(self):
        """Convert to dict for JSON responses."""
        return {
            "id": self.notification_id,
            "type": self.type.value,
            "report_ref": self.report_ref or "—",
            "heading": self.heading,
            "message": self.message,
            "sender": self.sender,
            "date": self.created_at.isoformat(),
            "read": self.is_read,
        }


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
    # if request.method == "POST":
    #     # Handle JSON POST from JS
    #     if request.is_json:
    #         data = request.get_json()
    #         name = data.get("name", "")
    #         email = data.get("email", "")
    #         message = data.get("message", "")
    #     else:
    #         # fallback for normal HTML form POST
    #         name = request.form.get("name", "")
    #         email = request.form.get("email", "")
    #         message = request.form.get("message", "")
    #
    #     # Basic validation
    #     if not name.strip() or not email.strip():
    #         if request.is_json:
    #             return jsonify(
    #                 {"success": False, "error": "Name and email are required"}
    #             ), 400
    #         else:
    #             return "Error: Name and email are required", 400
    #
    #     new_task = Task()
    #     new_task.task_name = name.strip()
    #     new_task.task_email = email.strip().lower()  # normalize email
    #     new_task.task_message = message.strip() if message else None
    #
    #     try:
    #         db.session.add(new_task)
    #         db.session.commit()
    #
    #         # Return appropriate response based on request type
    #         if request.is_json:
    #             return jsonify(
    #                 {
    #                     "success": True,
    #                     "message": "Data submitted successfully",
    #                     "data": {
    #                         "id": new_task.task_id,
    #                         "name": new_task.task_name,
    #                         "email": new_task.task_email,
    #                         "created": new_task.task_created.isoformat(),
    #                     },
    #                 }
    #             )
    #         else:
    #             return redirect("/")
    #
    #     except Exception as e:
    #         print(f"ERROR: {e}")  # server log only
    #
    #         error_msg = (
    #             "This email address is already registered"
    #             if "UNIQUE constraint failed" in str(e)
    #             else "An unexpected error occurred"
    #         )
    #
    #         if request.is_json:
    #             return jsonify({"success": False, "message": error_msg}), 409
    #         else:
    #             return f"ERROR: {error_msg}", 409

    return render_template("home.html")


@app.route("/sign-in", methods=["POST", "GET"])
def sign_in():
    if request.method == "POST":
        # Handle JSON and form data
        if request.is_json:
            data = request.get_json()
            email = data.get("email", "").strip().lower()
            password = data.get("password", "")
        else:
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")

        # Validation
        if not email or not password:
            msg = "Email and password are required."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            return msg, 400

        if not is_valid_dut_email(email):
            msg = "Please use a valid DUT email (@dut.ac.za or @dut4life.ac.za)."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 400
            return msg, 400

        user = User.query.filter_by(user_email=email).first()

        # Check credentials
        if not user or not user.check_pass_hash(password):
            msg = "Invalid email or password."
            if request.is_json:
                return jsonify({"success": False, "message": msg}), 401
            return msg, 401

        # ✅ Store session data safely
        session["user_id"] = user.user_id
        session["email"] = user.user_email
        session["role"] = user.user_role.value  # <-- FIXED HERE

        # ✅ Decide redirect URL based on role
        role_value = user.user_role.value.lower()

        if role_value == "admin":
            redirect_url = "/admin/dashboard"
        elif role_value == "technician":
            redirect_url = "/technician/dashboard"
        else:
            redirect_url = "/user/dashboard"

        # ✅ JSON or form-based response
        if request.is_json:
            return jsonify(
                {
                    "success": True,
                    "message": "Login successful",
                    "redirect": redirect_url,
                }
            ), 200
        else:
            return redirect(redirect_url)

    return render_template("sign-in.html")


@app.route("/forgot-password/email", methods=["GET", "POST"])
def forgot_password_email():
    if request.method == "GET":
        return render_template("forgot-password-email.html")

    data = request.get_json(silent=True)
    if data:
        email = data.get("email")
    else:
        email = request.form.get("email")

    user = User.query.filter_by(user_email=email).first()

    if not user:
        return jsonify({"success": False, "redirect": "/sign-up"})

    # Generate OTP
    otp_code = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=5)

    session["otp_email"] = email
    session["otp_code"] = otp_code
    session["otp_expiry"] = expiry.isoformat()
    session["otp_attempts"] = 0
    session["otp_round"] = 1

    # Send OTP via email
    send_email(
        email, "Your OTP Code", f"Your OTP is {otp_code}. It expires in 5 minutes."
    )

    return jsonify({"success": True, "redirect": "/forgot-password/otp"})


@app.route("/forgot-password/otp", methods=["GET", "POST"])
def forgot_password_otp():
    if request.method == "GET":
        return render_template("forgot-password-otp.html")

    data = request.get_json(silent=True)
    if data:
        otp_input = data.get("otp")
    else:
        otp_input = request.form.get("otp")

    otp_code = session.get("otp_code")

    otp_expiry_str = session.get("otp_expiry")
    if otp_expiry_str is None:
        return jsonify({"error": "OTP not found or expired"}), 400

    try:
        otp_expiry = datetime.fromisoformat(otp_expiry_str)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid OTP timestamp"}), 400

    attempts = session.get("otp_attempts", 0)
    round_num = session.get("otp_round", 1)

    if datetime.utcnow() > otp_expiry:
        return jsonify(
            {"success": False, "error": "OTP expired. Please request a new one."}
        )

    if attempts >= 3:
        if round_num >= 3:
            return jsonify({"success": False, "redirect": "sign-up.html"})
        # resend new otp
        new_otp = generate_otp()
        session["otp_code"] = new_otp
        session["otp_expiry"] = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        session["otp_attempts"] = 0
        session["otp_round"] = round_num + 1
        send_email(session["otp_email"], "Your OTP Code", f"Your OTP is {new_otp}")
        return jsonify(
            {"success": False, "error": "Too many attempts. A new OTP has been sent."}
        )

    if otp_input == otp_code:
        return jsonify({"success": True, "redirect": "/forgot-password/new"})

    # wrong code
    session["otp_attempts"] = attempts + 1
    return jsonify({"success": False, "error": "Incorrect code. Try again."})


@app.route("/forgot-password/otp/resend", methods=["POST"])
def resend_otp():
    otp_email = session.get("otp_email")
    if not otp_email:
        return jsonify({"success": False, "message": "No email in session"}), 400

    new_otp = generate_otp()
    session["otp_code"] = new_otp
    session["otp_expiry"] = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    session["otp_attempts"] = 0
    session["otp_round"] = session.get("otp_round", 1) + 1

    send_email(otp_email, "Your OTP Code", f"Your OTP is {new_otp}")

    return jsonify({"success": True, "message": f"New OTP sent to {otp_email}"})


@app.route("/forgot-password/new", methods=["GET", "POST"])
def forgot_password_new():
    if request.method == "GET":
        return render_template("forgot-password-new.html")

    email = session.get("otp_email")

    data = request.get_json(silent=True)
    if data:
        new_pass = data.get("password")
    else:
        new_pass = request.form.get("password")

    if not email:
        return jsonify({"success": False, "redirect": "/sign-in"})

    # if new_pass != confirm_pass or len(new_pass) < 6:
    #     return jsonify({"success": False, "error": "Passwords invalid or don't match."})

    user = User.query.filter_by(user_email=email).first()
    if not user:
        return jsonify({"success": False, "redirect": "/sign-up"})

    if not new_pass or not isinstance(new_pass, str):
        return jsonify({"error": "Missing or invalid new password"}), 400

    user.user_password_hash = generate_password_hash(new_pass)
    db.session.commit()

    # clear session data
    session.pop("otp_email", None)
    session.pop("otp_code", None)
    session.pop("otp_expiry", None)
    session.pop("otp_attempts", None)
    session.pop("otp_round", None)

    return jsonify({"success": True, "redirect": "/sign-in"})


@app.route("/sign-up", methods=["POST", "GET"])
def sign_up():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        role = data.get("role", "").upper()

        # Basic validation
        if not email or not password or not role:
            return jsonify({"success": False, "message": "Missing fields."}), 400

        if not is_valid_dut_email(email):
            return jsonify({"success": False, "message": "Invalid DUT email."}), 400

        # Email ↔ role domain check
        if email.endswith("@dut4life.ac.za") and role != "STUDENT":
            return jsonify(
                {"success": False, "message": "DUT4Life emails are for students only."}
            ), 400
        if email.endswith("@dut.ac.za") and role == "STUDENT":
            return jsonify(
                {
                    "success": False,
                    "message": "DUT staff emails cannot register as students.",
                }
            ), 400

        # Check main user DB
        if email_exists(email):
            return jsonify(
                {"success": False, "message": "Email already registered."}
            ), 409

        # Query validation DB
        table_mapping = {
            "STUDENT": "students",
            "STAFF": "staff",
            "ADMIN": "admins",
            "TECHNICIAN": "technicians",
        }

        table = table_mapping.get(role)
        result = validate_db(email, table)

        if not result:
            return jsonify(
                {"success": False, "message": "Email not found in school records."}
            ), 404

        surname = result["surname"]
        initials = result["initials"]
        record_id = result["id"]
        student_number = email.split("@")[0][:8]
        user_system_id = f"{student_number}#{record_id}"

        # Create User
        try:
            new_user = User()
            new_user.user_email = email
            new_user.user_role = UserRole[role]
            new_user.user_surname = surname
            new_user.initials = initials
            new_user.user_system_id = user_system_id
            new_user.set_pass_hash(password)

            db.session.add(new_user)
            db.session.commit()

            return jsonify({"success": True, "message": "Account created."}), 201

        except Exception as e:
            print(f"Signup error: {e}")
            return jsonify({"success": False, "message": "Internal server error."}), 500

    # GET → render signup page
    return render_template("sign-up.html")


@app.route("/user/dashboard", methods=["GET"])
def dashboard():
    if "user_id" not in session:
        # redirect to login for page loads
        if "application/json" in request.headers.get("Accept", ""):
            return jsonify({"success": False, "message": "User not logged in"}), 401
        return redirect("/sign-in")

    user = User.query.get(session["user_id"])
    if not user:
        return redirect("/sign-in")

    formatted_name = f"{user.initials.upper()} {user.user_surname.capitalize()}"

    # If it's a fetch request asking for JSON
    if "application/json" in request.headers.get("Accept", ""):
        try:
            user_id = session["user_id"]
            reports = (
                Report.query.filter_by(user_id=user_id)
                .order_by(Report.report_id.desc())
                .all()
            )

            reports_list = []
            for r in reports:
                reports_list.append(
                    {
                        "id": r.report_id,
                        "category": r.category,
                        "type": r.type,
                        "status": getattr(r, "status", "pending"),
                        "notes": r.notes,
                        "image_url": f"/{r.image_url}"
                        if getattr(r, "image_url", None)
                        else None,
                        "date": r.created_at.strftime("%Y-%m-%d")
                        if hasattr(r, "created_at")
                        else "",
                        "time": r.created_at.strftime("%H:%M")
                        if hasattr(r, "created_at")
                        else "",
                    }
                )

            return jsonify({"success": True, "reports": reports_list}), 200

        except Exception as e:
            print(f"ERROR fetching user reports: {e}")
            return jsonify({"success": False, "message": "Server error"}), 500

    # Otherwise render the dashboard page
    return render_template("dashboard.html", user_name=formatted_name)


@app.route("/user/report", methods=["GET", "POST"])
def report():
    if "user_id" not in session:
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return jsonify({"success": False, "message": "User not logged in"}), 401
        return redirect("/sign-in")

    if request.method == "POST":
        # ✅ Handle both JSON and form data
        if request.is_json:
            data = request.get_json(silent=True) or {}
            category = data.get("category")
            type_ = data.get("type")
            campus = data.get("campus")
            block = data.get("block")
            nearest_class = data.get("nearestClass")
            notes = data.get("notes")
            image_path = data.get("imagePath")  # optional if sent via JSON
        else:
            category = request.form.get("category")
            type_ = request.form.get("type")
            campus = request.form.get("campus")
            block = request.form.get("block")
            nearest_class = request.form.get("nearestClass")
            notes = request.form.get("notes")
            image_path = request.form.get("imagePath")

            # ✅ handle optional file upload
            image = request.files.get("issueImage")
            image_path = None
            if image and image.filename:
                filename = secure_filename(image.filename)
                ext = os.path.splitext(filename)[1]
                unique_name = f"{uuid.uuid4().hex}{ext}"

                upload_dir = os.path.join(
                    current_app.instance_path, "uploads", "reports"
                )
                os.makedirs(upload_dir, exist_ok=True)
                image.save(os.path.join(upload_dir, unique_name))

                # store relative path for retrieval
                image_path = f"uploads/reports/{unique_name}"

        # ✅ validate required fields
        if not category or not type_ or not campus or not notes:
            if request.is_json:
                return jsonify(
                    {"success": False, "message": "Missing required fields"}
                ), 400
            # flash("Missing required fields.", "error")
            return redirect(request.referrer or "/user/report")

        # ✅ create and save report
        new_report = Report()
        new_report.user_id = session["user_id"]
        new_report.category = category
        new_report.type = type_
        new_report.campus = campus
        new_report.block = block
        new_report.nearest_class = nearest_class
        new_report.notes = notes
        new_report.image_url = image_path

        db.session.add(new_report)
        db.session.commit()

        # ✅ Create a notification confirming the report submission
        confirmation_notif = Notification()
        confirmation_notif.user_id = session["user_id"]
        confirmation_notif.type = NotificationType.STATUS_UPDATE
        confirmation_notif.report_ref = str(new_report.report_id)
        confirmation_notif.heading = "Report Submitted Successfully"
        confirmation_notif.message = (
            f"Your report (#{new_report.report_id}) regarding '{category}' "
            f"has been received and is pending review. Thank you for submitting."
        )
        confirmation_notif.sender = "System"
        confirmation_notif.created_at = datetime.utcnow()

        db.session.add(confirmation_notif)
        db.session.commit()

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            # flash("Report submitted successfully!", "success")
            return jsonify(
                {"success": True, "message": "Report submitted successfully"}
            )
        else:
            return redirect("/user/dashboard")

    # ✅ default return for GET
    return render_template("report.html")


@app.route("/uploads/reports/<filename>")
def get_report_image(filename):
    upload_dir = os.path.join(current_app.instance_path, "uploads", "reports")
    return send_from_directory(upload_dir, filename)


@app.route("/user/profile", methods=["GET"])
def profile():
    if "user_id" not in session:
        # Redirect for normal page load, JSON for fetch
        if (
            request.accept_mimetypes.accept_json
            and not request.accept_mimetypes.accept_html
        ):
            return jsonify({"success": False, "message": "User not logged in"}), 401
        return redirect("/sign-in")

    user = User.query.get(session["user_id"])
    if not user:
        if (
            request.accept_mimetypes.accept_json
            and not request.accept_mimetypes.accept_html
        ):
            return jsonify({"success": False, "message": "User not found"}), 404
        return "User not found", 404

    # Determine gender placeholder
    # gender = getattr(user, "gender", None) or random.choice(["male", "female"])

    # Check if this is a JSON request (AJAX fetch)
    if (
        request.accept_mimetypes.accept_json
        and not request.accept_mimetypes.accept_html
    ):
        return jsonify(
            {
                "success": True,
                "id": user.user_system_id,
                "email": user.user_email,
                "initials": user.initials,  # placeholder
                "surname": user.user_surname,  # placeholder
                "role": user.user_role.value,
                "passwordLength": 12,  # placeholder, TODO: Calculate the real length before hashing
            }
        )

    # Otherwise, render the HTML page
    return render_template("profile.html")


@app.route("/user/notifications")
def notifications_page():
    return render_template("notifications.html")


@app.route("/user/notifications-data")
def notifications_data():
    # Check if user is logged in
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401
        return redirect("/sign-in")

    user_id = session["user_id"]
    # print(user_id)

    # Fetch notifications for this user, newest first
    notifications = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    # print(notifications)

    # Convert notifications to dictionary for JSON response
    notifications_list = [notif.to_dict() for notif in notifications]
    # print(notifications_list)

    return jsonify({"success": True, "notifications": notifications_list})


@app.route("/user/notifications-read/<int:notif_id>", methods=["POST"])
def mark_notification_read(notif_id):
    return jsonify(
        {"success": True, "message": f"Notification {notif_id} marked as read."}
    )


# ADMIN ROUTES FROM HERE


@app.route("/admin/dashboard", methods=["GET", "PATCH"])
def admin_dashboard():
    # ---- Authentication ----
    if "user_id" not in session:
        if request.accept_mimetypes.best == "application/json":
            return jsonify({"success": False, "message": "User not logged in"}), 401
        return redirect("/sign-in")

    # ---- JSON (fetch) GET ----
    if request.accept_mimetypes.best == "application/json":
        try:
            # Get all reports, join assignments & technician data if available
            reports = (
                Report.query.outerjoin(Assignment)
                .order_by(Report.report_id.desc())
                .all()
            )

            result = []
            for r in reports:
                assigned_tech = (
                    r.assignment.technician
                    if r.assignment and r.assignment.technician
                    else None
                )
                result.append(
                    {
                        "id": r.report_id,
                        "campus": r.campus,
                        "block": r.block,
                        "category": r.category,
                        "type": r.type,
                        "status": r.status,
                        "technician": f"{assigned_tech.user_surname} {assigned_tech.initials}"
                        if assigned_tech
                        else "Unassigned",
                        "notes": r.notes,
                    }
                )

            return jsonify(result), 200

        except Exception as e:
            print(f"ERROR fetching reports: {e}")
            return jsonify({"success": False, "message": "Server error"}), 500

    # ---- PATCH (status update) ----
    if request.method == "PATCH":
        try:
            data = request.get_json()
            report_id = data.get("id")
            new_status = data.get("status")

            if not report_id or not new_status:
                return jsonify({"success": False, "message": "Missing data"}), 400

            report = Report.query.get(report_id)
            if not report:
                return jsonify({"success": False, "message": "Report not found"}), 404

            report.status = new_status
            db.session.commit()

            return jsonify({"success": True, "message": "Status updated"}), 200

        except Exception as e:
            print(f"ERROR updating report: {e}")
            db.session.rollback()
            return jsonify({"success": False, "message": "Update failed"}), 500

    # ---- Normal page load ----
    return render_template("admin-dashboard.html")


# --- ASSIGN TECHNICIAN TO REPORT ---
@app.route("/admin/assign", methods=["POST"])
def assign_technician():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    data = request.get_json()
    report_id = data.get("report_id")
    technician_id = data.get("technician_id")
    admin_id = session["user_id"]

    if not report_id or not technician_id:
        return jsonify({"success": False, "message": "Missing data"}), 400

    report = Report.query.get(report_id)
    if not report:
        return jsonify({"success": False, "message": "Report not found"}), 404

    try:
        # Check if assignment exists
        assignment = report.assignment
        if not assignment:
            assignment = Assignment()
            assignment.report_id = report_id
            assignment.admin_id = admin_id
            assignment.technician_id = technician_id
            db.session.add(assignment)
        else:
            assignment.technician_id = technician_id
            assignment.admin_id = admin_id  # optional: update who reassigned

        db.session.commit()

        # Optional: create notification for technician
        technician = User.query.get(technician_id)
        if technician:
            notification = Notification()
            notification.user_id = technician.user_id
            notification.type = NotificationType.ASSIGNMENT
            notification.report_ref = str(report.report_id)
            notification.heading = "New Assignment"
            notification.message = (
                f"You have been assigned to report #{report.report_id}."
            )
            notification.sender = "System"

            db.session.add(notification)
            db.session.commit()

        return jsonify({"success": True, "message": "Technician assigned"}), 200

    except Exception as e:
        print(f"ERROR assigning technician: {e}")
        db.session.rollback()
        return jsonify({"success": False, "message": "Assignment failed"}), 500


# --- SEND NOTIFICATION TO TECHNICIAN ---
@app.route("/admin/notify", methods=["POST"])
def notify_technician():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    data = request.get_json()
    report_id = data.get("report_id")
    subject = data.get("subject")
    message = data.get("message")

    if not report_id or not subject or not message:
        return jsonify({"success": False, "message": "Missing data"}), 400

    report = Report.query.get(report_id)
    if not report or not report.assignment or not report.assignment.technician:
        return jsonify({"success": False, "message": "Report unassigned"}), 400

    technician = report.assignment.technician

    try:
        notification = Notification()
        notification.user_id = technician.user_id
        notification.type = NotificationType.MESSAGE
        notification.report_ref = str(report.report_id)
        notification.heading = subject
        notification.message = message
        notification.sender = "Admin"

        db.session.add(notification)
        db.session.commit()
        return jsonify({"success": True, "message": "Notification sent"}), 200

    except Exception as e:
        print(f"ERROR sending notification: {e}")
        db.session.rollback()
        return jsonify({"success": False, "message": "Notification failed"}), 500


# @app.route("/admin/reports", methods=["GET"])
# def get_reports():
#     if "user_id" not in session:
#         if request.accept_mimetypes["application/json"]:
#             return jsonify({"success": False, "message": "User not logged in"}), 401
#         return redirect("/sign-in")
#
#     # ---- AJAX (fetch) GET ----
#     if request.method == "GET" and request.accept_mimetypes.best == "application/json":
#         try:
#             # Replace this with real database fetching later
#             return jsonify(reports)
#         except Exception as e:
#             print(f"ERROR fetching reports: {e}")
#             return jsonify({"success": False, "message": "Server error"}), 500
#
#     # ---- Handle POST (future status updates etc.) ----
#     if request.method == "POST":
#         # you can add logic later here for updating request statuses, etc.
#         return jsonify({"success": True, "message": "POST received"})
#
#     # ---- Normal browser GET (page render) ----
#     # if request.method == "GET":
#     return render_template("admin-reports.html")


@app.route("/admin/technicians", methods=["GET"])
def admin_technicians():
    if "application/json" in str(request.headers.get("Accept", "")):
        try:
            # Query all users with role 'technician'
            technicians = User.query.filter_by(user_role=UserRole.TECHNICIAN).all()
            result = [
                {
                    "id": t.user_id,
                    "name": f"{t.user_surname} {t.initials or ''}".strip(),
                }
                for t in technicians
            ]
            return jsonify(result), 200
        except Exception as e:
            print(f"ERROR fetching technicians: {e}")
            return jsonify({"success": False, "message": "Server error"}), 500

    # Fallback to HTML page render
    return render_template("admin-technicians.html")


@app.route("/admin/reports/<int:report_id>", methods=["GET", "PUT"])
def admin_report_id(report_id):
    report = next((r for r in reports if r["id"] == report_id), None)
    if not report:
        return jsonify({"error": "Report not found"}), 404

    if request.method == "GET":
        return jsonify(report)

    if request.method == "PUT":
        data = request.get_json()
        # Update only allowed fields
        for field in ["category", "type", "status", "description", "technician_id"]:
            if field in data:
                report[field] = data[field]
        return jsonify(report)

    # fallback for unsupported methods
    return jsonify({"error": "Method not allowed"}), 405


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
