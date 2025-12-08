# -------------------------------------------------
# Project: EvoTracker Pro - Versão Estável
# Developer: Aether-cd
# Fix: Tratamento de dados nulos/antigos
# -------------------------------------------------

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, render_template, request, redirect, session
from datetime import datetime, timedelta
import random

# Configuração do Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

app.secret_key = "chave_super_secreta_do_hivo"
app.permanent_session_lifetime = timedelta(days=7) # Login dura 7 dias

FRASES = [
    "A persistência realiza o impossível.",
    "Não pare até se orgulhar.",
    "O corpo alcança o que a mente acredita.",
    "Um passo de cada vez, mas sempre para frente.",
    "Disciplina é liberdade.",
    "Foco no processo, não apenas no resultado.",
    "Hoje é um ótimo dia para evoluir!"
]

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session.permanent = True
        
        # --- A MÁGICA ACONTECE AQUI ---
        # 1. Pega o nome
        # 2. .strip() tira espaços inúteis
        # 3. .lower() converte para minúsculo (hivo)
        nome_padronizado = request.form['nome'].strip().lower()
        
        session['usuario'] = nome_padronizado
        return redirect('/')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('usuario', None)
    return redirect('/login')

@app.route('/')
def homepage():
    if 'usuario' not in session:
        return redirect('/login')

    nome = session['usuario']
    
    docs = db.collection('historico').where('usuario', '==', nome).stream()
    
    lista_historico = []
    contagem_categorias = {} 

    print(f"--- Buscando dados para: {nome} ---")
    
    for doc in docs:
        dado_bruto = doc.to_dict()
        
        dado_limpo = {
            "categoria": str(dado_bruto.get('categoria', 'Outros')),
            "descricao": str(dado_bruto.get('descricao', 'Sem descrição')),
            "data": str(dado_bruto.get('data', '---'))
        }
        
        lista_historico.append(dado_limpo)

        # Lógica do Gráfico
        cat = dado_limpo['categoria']
        if cat in contagem_categorias:
            contagem_categorias[cat] += 1
        else:
            contagem_categorias[cat] = 1

    lista_historico.reverse()
    print(f"--> Encontrados {len(lista_historico)} registros pessoais.")

    frase_do_dia = random.choice(FRASES)

    return render_template('index.html', 
                           historico=lista_historico, 
                           frase=frase_do_dia,
                           dados_grafico=contagem_categorias,
                           nome_pessoa=nome)

@app.route('/registrar', methods=['POST'])
def registrar():
    if 'usuario' not in session: return redirect('/login')

    dados_para_salvar = {
        "categoria": request.form['categoria'],
        "descricao": request.form['descricao'],
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "usuario": session['usuario']
    }
    
    db.collection('historico').add(dados_para_salvar)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)