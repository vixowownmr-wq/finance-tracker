from flask import Blueprint, request, jsonify
from extensions import db
from models import Ingreso
from datetime import datetime

ingresos_bp = Blueprint("ingresos", __name__)

@ingresos_bp.route("/", methods=["GET"])
def get_ingresos():
    ingresos = Ingreso.query.order_by(Ingreso.fecha.desc()).all()
    return jsonify([i.to_dict() for i in ingresos])

@ingresos_bp.route("/", methods=["POST"])
def create_ingreso():
    data = request.get_json()
    ingreso = Ingreso(
        descripcion=data["descripcion"],
        monto=data["monto"],
        categoria=data["categoria"],
        fecha=datetime.strptime(data["fecha"], "%Y-%m-%d").date(),
        notas=data.get("notas", "")
    )
    db.session.add(ingreso)
    db.session.commit()
    return jsonify(ingreso.to_dict()), 201

@ingresos_bp.route("/<int:id>", methods=["PUT"])
def update_ingreso(id):
    ingreso = Ingreso.query.get_or_404(id)
    data = request.get_json()
    ingreso.descripcion = data.get("descripcion", ingreso.descripcion)
    ingreso.monto = data.get("monto", ingreso.monto)
    ingreso.categoria = data.get("categoria", ingreso.categoria)
    ingreso.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d").date() if "fecha" in data else ingreso.fecha
    ingreso.notas = data.get("notas", ingreso.notas)
    db.session.commit()
    return jsonify(ingreso.to_dict())

@ingresos_bp.route("/<int:id>", methods=["DELETE"])
def delete_ingreso(id):
    ingreso = Ingreso.query.get_or_404(id)
    db.session.delete(ingreso)
    db.session.commit()
    return jsonify({"mensaje": "Ingreso eliminado"}), 200