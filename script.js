// Конфигурация
const config = {
    workshopsCount: 20,
    indicators: [
        'Выпуск', 'Брак', 'Простой', 'Численность', 
        'Изготовлено', 'ПроцентОтПлана', 'Себестоимость',
        'ВаловаяПрибыль', 'Маржинальность', 'EBITDA',
        'Рентабельность', 'ЧистаяПрибыль'
    ],
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    quarters: {
        'Q1': ['Янв', 'Фев', 'Мар'],
        'Q2': ['Апр', 'Май', 'Июн'],
        'Q3': ['Июл', 'Авг', 'Сен'],
        'Q4': ['Окт', 'Ноя', 'Дек']
    }
};

// Глобальные переменные
let appData = {
    rawData: [],
    workshops: [],
    monthlyData: {},
    quarterlyData: {},
    annualData: {}
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('loadBtn').addEventListener('click', loadData);
    document.getElementById('pdfBtn').addEventListener('click', exportToPDF);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
}

async function loadData() {
    const fileInput = document.getElementById('csvUpload');
    if (!fileInput.files.length) {
        alert('Пожалуйста, выберите CSV файл');
        return;
    }

    const file = fileInput.files[0];
    document.getElementById('fileName').textContent = `Загружен: ${file.name}`;

    try {
        const csvData = await parseCSV(file);
        processData(csvData);
        renderAllCharts();
    } catch (error) {
        console.error('Ошибка обработки файла:', error);
        alert(`Ошибка обработки файла: ${error.message}`);
    }
}

function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const lines = e.target.result.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("CSV файл пуст");

                const headers = lines[0].split('\t'); // Изменено на табуляцию
                const result = lines.slice(1).map(line => {
                    const values = line.split('\t'); // Изменено на табуляцию
                    return headers.reduce((obj, header, i) => {
                        let value = values[i] ? values[i].trim() : '';
                        if (!isNaN(value) && header !== 'Цех' && header !== 'Месяц') {
                            value = parseFloat(value);
                        }
                        obj[header] = value;
                        return obj;
                    }, {});
                });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsText(file);
    });
}

// Остальные функции (processData, renderAllCharts и др.) остаются без изменений
// Но нужно добавить проверку на существование графиков перед их созданием:

function renderWorkshopCharts() {
    const container = document.getElementById('workshopCharts');
    container.innerHTML = '';
    
    config.indicators.forEach((indicator, idx) => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-wrapper';
        chartDiv.style.height = '400px'; // Добавлено фиксированное height
        
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${indicator}`;
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);
        
        const labels = appData.workshops.map(w => `Цех ${w}`);
        const data = appData.workshops.map(workshop => {
            const annualData = appData.annualData[workshop];
            return annualData ? annualData[indicator] || 0 : 0;
        });
        
        // Убедимся, что данные существуют
        if (data.length > 0 && data.some(v => v !== 0)) {
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: indicator,
                        data: data,
                        backgroundColor: `hsl(${idx * 360 / config.indicators.length}, 70%, 50%)`,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Годовые показатели: ${indicator}`,
                            font: { size: 16 }
                        },
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        } else {
            canvas.innerHTML = `<p>Нет данных для показателя ${indicator}</p>`;
        }
    });
}
