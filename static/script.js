/* === 1. SISTEMA DE NAVEGAÇÃO ENTRE ABAS === */
function openTab(evt, dayName) {
    var i, tabcontent, tablinks;

    // Esconde todo o conteúdo
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active-content");
    }

    // Remove a classe 'active' de todos os botões
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostra o dia atual
    document.getElementById(dayName).style.display = "block";
    document.getElementById(dayName).classList.add("active-content");
    
    // Ativa o botão visualmente
    if (evt) {
        evt.currentTarget.className += " active";
    }
}

/* === 2. GRÁFICO DE FADIGA MUSCULAR (Chart.js) === */
let muscleData = {
    labels: ['Peitoral', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'],
    values: [10, 10, 10, 10, 10, 10]
};
let myChart = null;

function getColor(value) {
    if (value < 30) return '#00B0FF'; // Azul
    if (value < 60) return '#BD00FF'; // Roxo
    return '#FF0055'; // Vermelho
}

document.addEventListener("DOMContentLoaded", function() {
    const chartCanvas = document.getElementById('muscleChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: muscleData.labels,
                datasets: [{
                    label: '% de Fadiga',
                    data: muscleData.values,
                    backgroundColor: muscleData.values.map(val => getColor(val)),
                    borderColor: '#1F2937',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { min: 0, max: 100, grid: { color: '#333' } },
                    y: { grid: { display: false }, ticks: { color: 'white' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
});

function updateFatigue(muscle, amount) {
    const index = muscleData.labels.indexOf(muscle);
    if (index !== -1 && myChart) {
        let newValue = muscleData.values[index] + amount;
        if (newValue > 100) newValue = 100;
        muscleData.values[index] = newValue;
        myChart.data.datasets[0].data = muscleData.values;
        myChart.data.datasets[0].backgroundColor = muscleData.values.map(val => getColor(val));
        myChart.update();
    }
}

function resetFatigue() {
    if (myChart) {
        muscleData.values = muscleData.values.map(v => v > 10 ? v - 40 : 0);
        myChart.data.datasets[0].data = muscleData.values;
        myChart.data.datasets[0].backgroundColor = muscleData.values.map(val => getColor(val));
        myChart.update();
    }
}

/* === 3. CALCULADORA DE MÉTRICAS === */
function calcularTudo() {
    // Inputs
    const altura = parseFloat(document.getElementById('altura').value);
    const peso = parseFloat(document.getElementById('peso').value) || 70;
    const pescoco = parseFloat(document.getElementById('pescoco').value);
    const cintura = parseFloat(document.getElementById('cintura').value);

    // IMC
    if (altura > 0 && peso > 0) {
        const imc = (peso / ((altura/100) ** 2)).toFixed(1);
        const elImc = document.getElementById('result-imc');
        if(elImc) elImc.innerText = imc;
    }

    // Gordura (Navy Method)
    if (cintura > 0 && pescoco > 0 && altura > 0) {
        let fator = Math.log10(cintura - pescoco);
        let gordura = 495 / (1.0324 - 0.19077 * fator + 0.15456 * Math.log10(altura)) - 450;
        if (gordura < 3) gordura = 3;
        const elFat = document.getElementById('result-fat');
        if(elFat) elFat.innerText = gordura.toFixed(1) + "%";
    }

    // Calorias (Baseado em inputs preenchidos)
    let inputsTreino = document.querySelectorAll('.tab-content:not(#perfil) input[type="number"]');
    let setsPreenchidos = 0;
    inputsTreino.forEach(input => {
        // Ignora campos de cardio para contagem de séries
        if (input.value > 0 && !input.parentElement.querySelector('.cardio-label')) {
            setsPreenchidos++;
        }
    });
    
    let seriesReais = Math.ceil(setsPreenchidos / 2);
    let calorias = Math.floor((seriesReais * 1.5) * 6 * peso / 200); // Fórmula MET

    // Soma Cardio
    let inputsCardio = document.querySelectorAll('.cardio-card input');
    inputsCardio.forEach(input => {
        if(input.value > 0) calorias += (parseFloat(input.value) * 8);
    });

    const elCalorias = document.getElementById('result-calorias');
    if(elCalorias) elCalorias.innerText = Math.round(calorias);
}

// Ouvinte Automático
document.addEventListener('input', function(evt) {
    if(evt.target.classList.contains('input-neon')) {
        calcularTudo();
    }
});
