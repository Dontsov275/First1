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

function loadData() {
    const fileInput = document.getElementById('csvUpload');
    if (!fileInput.files.length) {
        alert('Пожалуйста, выберите CSV файл');
        return;
    }

    const file = fileInput.files[0];
    document.getElementById('fileName').textContent = `Загружен: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = parseCSV(e.target.result);
            processData(csvData);
            renderAllCharts();
        } catch (error) {
            console.error('Ошибка обработки файла:', error);
            alert(`Ошибка обработки файла: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("CSV файл пуст");

    const headers = lines[0].split('\t'); // Используем табуляцию как разделитель
    return lines.slice(1).map(line => {
        const values = line.split('\t');
        return headers.reduce((obj, header, i) => {
            let value = values[i] ? values[i].trim() : '';
            if (!isNaN(value) && header !== 'Цех' && header !== 'Месяц') {
                value = parseFloat(value);
            }
            obj[header] = value;
            return obj;
        }, {});
    });
}

// Добавляем отсутствующую функцию processData
function processData(data) {
    // Очистка предыдущих данных
    appData = {
        rawData: data,
        workshops: [],
        monthlyData: {},
        quarterlyData: {},
        annualData: {}
    };

    // Получаем список цехов
    appData.workshops = [...new Set(data.map(row => parseInt(row['Цех'])))].sort((a, b) => a - b);
    
    // Обработка месячных данных
    processMonthlyData();
    
    // Расчет квартальных данных
    processQuarterlyData();
    
    // Расчет годовых данных
    processAnnualData();
}

function processMonthlyData() {
    appData.workshops.forEach(workshop => {
        appData.monthlyData[workshop] = {};
        config.months.forEach(month => {
            const monthData = appData.rawData.filter(
                row => parseInt(row['Цех']) === workshop && row['Месяц'] === month
            );
            
            if (monthData.length > 0) {
                appData.monthlyData[workshop][month] = monthData[0];
            }
        });
    });
}

function processQuarterlyData() {
    Object.entries(config.quarters).forEach(([quarter, months]) => {
        appData.quarterlyData[quarter] = {};
        
        appData.workshops.forEach(workshop => {
            const quarterData = {
                'Выпуск': 0,
                'Брак': 0,
                'Простой': 0,
                'Численность': 0,
                'Изготовлено': 0,
                'Себестоимость': 0,
                'ВаловаяПрибыль': 0,
                'EBITDA': 0,
                'ЧистаяПрибыль': 0
            };
            
            let monthCount = 0;
            months.forEach(month => {
                const monthData = appData.monthlyData[workshop][month];
                if (monthData) {
                    config.indicators.forEach(indicator => {
                        if (quarterData.hasOwnProperty(indicator) {
                            quarterData[indicator] += parseFloat(monthData[indicator]) || 0;
                        }
                    });
                    monthCount++;
                }
            });
            
            // Расчет средних значений
            if (monthCount > 0) {
                ['Брак', 'Простой', 'ПроцентОтПлана', 'Маржинальность', 'Рентабельность'].forEach(indicator => {
                    if (quarterData.hasOwnProperty(indicator)) {
                        quarterData[indicator] = quarterData[indicator] / monthCount;
                    }
                });
            }
            
            appData.quarterlyData[quarter][workshop] = quarterData;
        });
    });
}

function processAnnualData() {
    appData.annualData = {};
    
    appData.workshops.forEach(workshop => {
        const annualData = {
            'Выпуск': 0,
            'Брак': 0,
            'Простой': 0,
            'Численность': 0,
            'Изготовлено': 0,
            'Себестоимость': 0,
            'ВаловаяПрибыль': 0,
            'EBITDA': 0,
            'ЧистаяПрибыль': 0
        };
        
        let monthCount = 0;
        config.months.forEach(month => {
            const monthData = appData.monthlyData[workshop][month];
            if (monthData) {
                config.indicators.forEach(indicator => {
                    if (annualData.hasOwnProperty(indicator)) {
                        annualData[indicator] += parseFloat(monthData[indicator]) || 0;
                    }
                });
                monthCount++;
            }
        });
        
        // Расчет средних значений
        if (monthCount > 0) {
            ['Брак', 'Простой', 'ПроцентОтПлана', 'Маржинальность', 'Рентабельность'].forEach(indicator => {
                if (annualData.hasOwnProperty(indicator)) {
                    annualData[indicator] = annualData[indicator] / monthCount;
                }
            });
        }
        
        appData.annualData[workshop] = annualData;
    });
}

function renderAllCharts() {
    renderWorkshopCharts();
    renderQuarterlyReports();
    renderAnnualReports();
}

function renderWorkshopCharts() {
    const container = document.getElementById('workshopCharts');
    container.innerHTML = '';
    
    config.indicators.forEach((indicator, idx) => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-wrapper';
        
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${indicator}`;
        chartDiv.appendChild(canvas);
        container.appendChild(chartDiv);
        
        const labels = appData.workshops.map(w => `Цех ${w}`);
        const data = appData.workshops.map(workshop => {
            const annualData = appData.annualData[workshop];
            return annualData ? annualData[indicator] || 0 : 0;
        });
        
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
    });
}

// Остальные функции (renderQuarterlyReports, renderAnnualReports, switchTab, exportToPDF) остаются без изменений
