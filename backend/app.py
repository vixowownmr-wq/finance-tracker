import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    from routes.ingresos import ingresos_bp
    from routes.gastos import gastos_bp

    app.register_blueprint(ingresos_bp, url_prefix="/api/ingresos")
    app.register_blueprint(gastos_bp, url_prefix="/api/gastos")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)