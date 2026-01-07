from flask import Flask, render_template, request

app = Flask(__name__)

# Rota Inicial (Tela de Login)
@app.route('/')
def home():
    return render_template('login.html')

# Rota do Dashboard (Pós-Login)
@app.route('/login', methods=['POST'])
def dashboard():
    # Pega o nome digitado no input
    nome_usuario = request.form.get('nome')
    # Manda o usuário para o dashboard com o nome dele
    return render_template('index.html', nome=nome_usuario)

if __name__ == '__main__':
    app.run(debug=True)
