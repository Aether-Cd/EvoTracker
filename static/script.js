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
// === CÁLCULO DE MÉTRICAS ===

    function calcularTudo() {
        calcularGorduraEIMC();
        calcularCaloriasTreino();
    }

    function calcularGorduraEIMC() {
        const altura = parseFloat(document.getElementById('altura').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const pescoco = parseFloat(document.getElementById('pescoco').value);
        const cintura = parseFloat(document.getElementById('cintura').value);

        // 1. Cálculo do IMC (Peso / Altura²)
        if (altura > 0 && peso > 0) {
            const alturaMetros = altura / 100;
            const imc = (peso / (alturaMetros * alturaMetros)).toFixed(1);
            document.getElementById('result-imc').innerText = imc;
        }

        // 2. Cálculo de Gordura (Fórmula Navy Method Simplificada para Homens)
        // %Gordura = 495 / (1.0324 - 0.19077(log10(cintura-pescoço)) + 0.15456(log10(altura))) - 450
        if (cintura > 0 && pescoco > 0 && altura > 0) {
            try {
                // Conversão logarítmica básica aproximada
                let fatorCinturaPescoco = Math.log10(cintura - pescoco);
                let fatorAltura = Math.log10(altura);
                
                let gordura = 495 / (1.0324 - 0.19077 * fatorCinturaPescoco + 0.15456 * fatorAltura) - 450;
                
                // Ajuste de segurança para valores irreais
                if(gordura < 3) gordura = 3; 
                
                document.getElementById('result-fat').innerText = gordura.toFixed(1) + "%";
            } catch (e) {
                document.getElementById('result-fat').innerText = "--";
            }
        }
    }

    function calcularCaloriasTreino() {
        const peso = parseFloat(document.getElementById('peso').value) || 70; // Peso padrão 70 se vazio
        
        // 1. Contar quantos inputs de "Reps" foram preenchidos nas abas de treino
        // Vamos varrer todos os inputs dentro da classe .sets-container que não sejam do perfil
        let inputsTreino = document.querySelectorAll('.tab-content:not(#perfil) input[type="number"]');
        let setsPreenchidos = 0;

        inputsTreino.forEach(input => {
            if (input.value !== "" && input.value > 0) {
                // Consideramos cada input preenchido como uma parte de uma série feita
                setsPreenchidos++;
            }
        });

        // Como cada série tem 2 inputs (reps e carga), dividimos por 2 para ter o número real de séries
        let totalSeriesReais = Math.ceil(setsPreenchidos / 2);

        // 2. A Fórmula MET (Metabolic Equivalent of Task)
        // Musculação Moderada/Intensa gasta aprox 0.1 kcal por kg por minuto.
        // Estimamos que 1 Série dura 1.5 minutos (Execução + Descanso)
        
        let tempoEstimadoMinutos = totalSeriesReais * 1.5;
        
        // Gasto Calórico = Tempo(min) * MET * Peso / 200 (Fórmula simplificada)
        // MET musculação = 6.0
        let caloriasGastas = Math.floor(tempoEstimadoMinutos * 6 * peso / 200);

        // Adiciona um valor base se fez cardio (procura input cardio)
        let inputsCardio = document.querySelectorAll('.cardio-card input');
        inputsCardio.forEach(input => {
            if(input.value > 0) {
                // Cardio gasta mais: aprox 8 a 10 calorias por minuto
                caloriasGastas += (input.value * 8); 
            }
        });

        // Atualiza na tela com animaçãozinha
        document.getElementById('result-calorias').innerText = caloriasGastas + " kcal";
    }

    // Adiciona um "ouvinte" para recalcular calorias sempre que digitar algo nos treinos
    document.addEventListener('input', function(evt) {
        if(evt.target.classList.contains('input-neon')) {
            calcularCaloriasTreino();
        }
    });

