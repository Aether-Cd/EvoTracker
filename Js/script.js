// Função para "Fazer Login" (Trocar de tela)
function fazerLogin() {
    // Pega os elementos da tela
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const userInput = document.querySelector('.input-login').value;

    // Efeito visual simples (Validação fake)
    if (userInput.trim() === "") {
        alert("Por favor, digite um usuário!");
        return;
    }

    // Esconde o Login e Mostra o Dashboard
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    
    // Atualiza o nome do usuário (Opcional)
    // document.querySelector('header h1').innerText = `Olá, ${userInput} 👋`;
}

// Função para Trocar as Abas (Segunda, Terça...)
function openTab(evt, dayName) {
    var i, tabcontent, tablinks;

    // 1. Esconde todo o conteúdo das abas
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active-content");
    }

    // 2. Remove a classe 'active' de todos os botões
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // 3. Mostra o dia clicado e ativa o botão
    document.getElementById(dayName).style.display = "block";
    document.getElementById(dayName).classList.add("active-content");
    evt.currentTarget.className += " active";
}