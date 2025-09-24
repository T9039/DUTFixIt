from datetime import datetime

from flask import Flask, jsonify, redirect, render_template, request
from flask_sqlalchemy import SQLAlchemy

# My app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db = SQLAlchemy(app)

# Data class(not the same thing) ~ row of data


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    message = db.Column(db.Text, nullable=True)  # good for longer free text
    complete = db.Column(db.Integer, default=0)
    created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Request {self.id}"


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
        new_task.name = name.strip()
        new_task.email = email.strip().lower()  # normalize email
        new_task.message = message.strip() if message else None

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
                            "id": new_task.id,
                            "name": new_task.name,
                            "email": new_task.email,
                            "created": new_task.created.isoformat(),
                        },
                    }
                )
            else:
                return redirect("/")

        except Exception as e:
            print(f"ERROR: {e}")
            error_msg = str(e)

            # Handle specific database errors
            if "UNIQUE constraint failed" in error_msg:
                error_msg = "This email address is already registered"

            if request.is_json:
                return jsonify({"success": False, "error": error_msg}), 400
            else:
                return f"ERROR: {error_msg}", 400

    return render_template("form.html")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
