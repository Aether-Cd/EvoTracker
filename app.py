import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, render_template, request, redirect
from datetime import datetime
import random


if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)

FRASES = [
    "A persistência realiza o impossível.",
    "Não pare até se orgulhar.",
    "O corpo alcança o que a mente acredita.",
    "Um passo de cada vez, mas sempre para frente.",
    "Disciplina é liberdade.",
    "Foco no processo, não apenas no resultado.",
    "Hoje é um ótimo dia para evoluir!"
]

@app.route('/')
def homepage():
    
    docs = db.collection('historico').stream()
    
    lista_historico = []
    contagem_categorias = {} 

    for doc in docs:
        dado = doc.to_dict()
        lista_historico.append(dado)
        
        cat = dado['categoria']
        if cat in contagem_categorias:
            contagem_categorias[cat] += 1
        else:
            contagem_categorias[cat] = 1

    frase_do_dia = random.choice(FRASES)

    return render_template('index.html', 
                           historico=lista_historico, 
                           frase=frase_do_dia,
                           dados_grafico=contagem_categorias)

@app.route('/registrar', methods=['POST'])
def registrar():
    categoria = request.form['categoria']
    descricao = request.form['descricao']
    
    dados_para_salvar = {
        "categoria": categoria,
        "descricao": descricao,
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    db.collection('historico').add(dados_para_salvar)
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)