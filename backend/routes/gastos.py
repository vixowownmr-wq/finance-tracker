from flask import Blueprint, request, jsonify
from extensions import db
from models import Gasto
from datetime import datetime

gastos_bp = Blueprint("gastos", __name__)

@gastos_bp.route("/", methods=["GET"])
def get_gastos():
    gastos = Gasto.query.order_by(Gasto.fecha.desc()).all()
    return jsonify([g.to_dict() for g in gastos])

@gastos_bp.route("/", methods=["POST"])
def create_gasto():
    data = request.get_json()
    gasto = Gasto(
        descripcion=data["descripcion"],
        monto=data["monto"],
        categoria=data["categoria"],
        fecha=datetime.strptime(data["fecha"], "%Y-%m-%d").date(),
        notas=data.get("notas", "")
    )
    db.session.add(gasto)
    db.session.commit()
    return jsonify(gasto.to_dict()), 201

@gastos_bp.route("/<int:id>", methods=["PUT"])
def update_gasto(id):
    gasto = Gasto.query.get_or_404(id)
    data = request.get_json()
    gasto.descripcion = data.get("descripcion", gasto.descripcion)
    gasto.monto = data.get("monto", gasto.monto)
    gasto.categoria = data.get("categoria", gasto.categoria)
    gasto.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d").date() if "fecha" in data else gasto.fecha
    gasto.notas = data.get("notas", gasto.notas)
    db.session.commit()
    return jsonify(gasto.to_dict())

@gastos_bp.route("/<int:id>", methods=["DELETE"])
def delete_gasto(id):
    gasto = Gasto.query.get_or_404(id)
    db.session.delete(gasto)
    db.session.commit()
    return jsonify({"mensaje": "Gasto eliminado"}), 200