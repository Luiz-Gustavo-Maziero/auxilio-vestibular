from flask import Flask, render_template, request, redirect, url_for, session, flash
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import random, os
from flask import send_file
from flask import jsonify
from flask import Flask, send_file, send_from_directory

app = Flask(__name__)
app.secret_key = "myKeyAppFlask" 

client = MongoClient("mongodb://meuUsuario:minhaSenha123@localhost:27017/Provas")
db = client["Provas"]
users = db["usuarios"]
questoes = db['tcc']
bcrypt = Bcrypt(app)

@app.route("/")
def index():
    if "usuario" in session:
        return redirect(url_for("home"))
    return redirect(url_for("login"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        nome = request.form["nome"]
        email = request.form["email"]
        senha = request.form["senha"]
        quantidade_acertos = 0

        if users.find_one({"email": email}):
            flash("E-mail já cadastrado!")
            return redirect(url_for("register"))

        senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")
        users.insert_one({"nome": nome, "email": email, "senha": senha_hash, 'quantidade_acertos': quantidade_acertos})
        flash("Usuário cadastrado! Faça login.")
        return redirect(url_for("login"))

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]

        user = users.find_one({"email": email})
        if user and bcrypt.check_password_hash(user["senha"], senha):
            session["usuario"] = user["nome"]
            session["email"] = user ["email"]
            return redirect(url_for("home"))
        else:
            flash("E-mail ou senha incorretos.")
            return redirect(url_for("login"))

    return render_template("login.html")

@app.route("/home")
def home():
    if "usuario" not in session:
        return redirect(url_for("login"))
    return render_template("home.html", usuario=session["usuario"], email=session["email"])

@app.route("/api/question_uel")
def questao_aleatoria():
    if "usuario" not in session:
        return jsonify({"erro": "Usuário não logado"}), 401

    
    todas_questoes = list(questoes.find({}, {'_id': 0}))
    
    if not todas_questoes:
        return "Nenhuma questão disponível."

    questao = random.choice(todas_questoes)  
    return questao

@app.route("/api/salvar_acertos", methods=['POST'])
def salvar_acertos():
    if "usuario" not in session:
        return jsonify({"erro": "Usuário não logado"}), 401
    data = request.json
    acertos = data.get("acertos", 0)

    result = users.update_one(
        {"nome": session["usuario"]},
        {"$inc": {"quantidade_acertos": acertos}} 
    )

    if result.modified_count == 1:
        return jsonify({"sucesso": True})
    else:
        return jsonify({"erro": "Não foi possível atualizar"}), 400

CAMINHO_HTML = r"C:\Users\marcu\OneDrive\Documentos\luiz\css\css\tcc\views\Uel"

@app.route("/quiz")
def minha_pagina():
    arquivo = os.path.join(CAMINHO_HTML, "perguntas_uel.html")
    if not os.path.exists(arquivo):
        return "Arquivo não encontrado!", 404
    return send_file(arquivo)

CAMINHO_PUBLIC = r"C:\Users\marcu\OneDrive\Documentos\luiz\css\css\tcc\public"

@app.route("/public/<path:filename>")
def public_files(filename):
    return send_from_directory(CAMINHO_PUBLIC, filename)


@app.route("/logout")
def logout():
    session.pop("usuario", None)
    flash("Logout realizado.")
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
