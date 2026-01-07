/* === 1. NAVEGAÇÃO ENTRE ABAS === */
function openTab(evt, dayName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active-content");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(dayName).style.display = "block";
    document.getElementById(dayName).classList.add("active-content");
    if (evt) evt.currentTarget.className += " active";
}

/* === 2. SISTEMA DE SÉRIES DINÂMICAS === */
function adicionarSerie(btn, baseId) {
    // Encontra o container acima do botão
    const container = btn.previousElementSibling;
    if (!container) return; // Segurança

    // Calcula qual é o número da próxima série
    const totalLinhas = container.getElementsByClassName('set-row').length;
    const proximaSerie = totalLinhas + 1;

    // Cria os elementos HTML
    const novaDiv = document.createElement('div');
    novaDiv.className = 'set-row';
    
    // Verifica se é um exercício de ABS (normalmente tem ID contendo 'abs') para decidir o placeholder
    let isAbs = baseId.includes('abs');

    novaDiv.innerHTML = `
        <span>${proximaSerie}</span>
        <input type="number" id="${baseId}_s${proximaSerie}_r" class="input-neon save-data" placeholder="reps">
        <input type="number" id="${baseId}_s${proximaSerie}_w" class="input-neon save-data" placeholder="${isAbs ? '-' : 'kg'}" ${isAbs ? 'disabled' : ''}>
    `;

    // Adiciona na tela
    container.appendChild(novaDiv);
}

/* === 3. SALVAR E CARREGAR (COM MEMÓRIA DE SÉRIES EXTRAS) === */
function salvarTreino() {
    const inputs = document.querySelectorAll('input');
    let dadosSalvos = 0;
    inputs.forEach(input => {
        if (input.id) {
            localStorage.setItem(input.id, input.value);
            dadosSalvos++;
        }
    });
    if (dadosSalvos > 0) {
        alert("✅ Treino salvo! (Incluindo séries extras)");
        calcularTudo();
    }
}

function carregarTreino() {
    // 1. RECONSTRUIR SÉRIES EXTRAS (S4, S5, S6...)
    // Varre o LocalStorage procurando chaves que indiquem séries altas
    Object.keys(localStorage).forEach(key => {
        // Regex para achar chaves como: seg_ex1_s4_r
        const match = key.match(/(.*)_s(\d+)_[rw]$/);
        
        if (match) {
            const baseId = match[1]; // ex: seg_ex1
            const serieNum = parseInt(match[2]); // ex: 4
            
            // Se for série 4 ou maior, precisamos garantir que o HTML exista
            if (serieNum > 3) {
                // Tenta achar o input. Se não existir, temos que criar.
                const inputExiste = document.getElementById(key);
                
                if (!inputExiste) {
                    // Precisamos achar o botão "+" desse exercício para clicar nele virtualmente
                    // Usamos a série 1 como âncora para achar o lugar certo
                    const ancora = document.getElementById(`${baseId}_s1_r`) || document.getElementById(`${baseId}_s1`);
                    
                    if (ancora) {
                        const container = ancora.closest('.sets-container');
                        const btnAdd = container.nextElementSibling; // O botão fica depois do container
                        
                        // Adiciona séries até chegar na necessária
                        let linhasAtuais = container.getElementsByClassName('set-row').length;
                        while (linhasAtuais < serieNum) {
                            if(btnAdd && btnAdd.classList.contains('btn-add-set')) {
                                adicionarSerie(btnAdd, baseId);
                            }
                            linhasAtuais++;
                        }
                    }
                }
            }
        }
    });

    // 2. PREENCHER VALORES
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.id) {
            const valorSalvo = localStorage.getItem(input.id);
            if (valorSalvo) input.value = valorSalvo;
        }
    });
    
    setTimeout(calcularTudo, 500);
}

/* === 4. GRÁFICO E GRÁFICO DE BARRAS === */
let muscleData = { labels: ['Peitoral', 'Costas', 'Pernas', 'Ombros', 'Bíceps'], values: [10, 10, 10, 10, 10] };
let myChart = null;

function getColor(value) {
    if (value < 30) return '#00B0FF';
    if (value < 60) return '#BD00FF';
    return '#FF0055';
}

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

/* === 5. CALCULADORA === */
function calcularTudo() {
    const altura = parseFloat(document.getElementById('altura')?.value);
    const peso = parseFloat(document.getElementById('peso')?.value) || 70;
    const pescoco = parseFloat(document.getElementById('pescoco')?.value);
    const cintura = parseFloat(document.getElementById('cintura')?.value);

    // IMC
    if (altura > 0 && peso > 0) {
        document.getElementById('result-imc').innerText = (peso / ((altura/100) ** 2)).toFixed(1);
    }
    // Gordura
    if (cintura > 0 && pescoco > 0 && altura > 0) {
        let fat = 495 / (1.0324 - 0.19077 * Math.log10(cintura - pescoco) + 0.15456 * Math.log10(altura)) - 450;
        document.getElementById('result-fat').innerText = (fat > 3 ? fat.toFixed(1) : 3) + "%";
    }
    // Calorias
    let sets = 0;
    document.querySelectorAll('.tab-content:not(#perfil) input[type="number"]').forEach(inp => {
        if(inp.value > 0 && !inp.parentElement.querySelector('.cardio-label')) sets++;
    });
    // Divide por 2 porque cada série tem 2 inputs (reps e peso)
    let cal = Math.floor((Math.ceil(sets / 2) * 1.5) * 6 * peso / 200);
    document.querySelectorAll('.cardio-card input').forEach(inp => {
        if(inp.value > 0) cal += (parseFloat(inp.value) * 8);
    });
    const elCal = document.getElementById('result-calorias');
    if(elCal) elCal.innerText = Math.round(cal);
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('muscleChart');
    if (ctx) {
        myChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: { labels: muscleData.labels, datasets: [{ data: muscleData.values, backgroundColor: muscleData.values.map(val => getColor(val)), borderRadius: 5 }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { max: 100, grid: { color: '#333' } }, y: { ticks: { color: 'white' } } } }
        });
    }
    carregarTreino();
    document.addEventListener('input', (evt) => { if(evt.target.classList.contains('input-neon')) calcularTudo(); });
});