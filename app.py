from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Rota da Página Inicial (Login)
@app.route('/')
def home():
    return render_template('login.html')

# Rota do Dashboard
@app.route('/login', methods=['POST', 'GET'])
def dashboard():
    # Se tentar acessar direto pelo link (GET), manda voltar pro login
    if request.method == 'GET':
        return redirect(url_for('home'))
        
    # Se veio pelo formulário (POST)
    nome_usuario = request.form.get('nome')
    if not nome_usuario:
        nome_usuario = "Atleta" # Nome padrão de segurança
        
    return render_template('index.html', nome=nome_usuario)

if __name__ == '__main__':
    app.run(debug=True)