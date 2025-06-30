// Данные для графиков
const productionData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [{
        label: 'Выпуск продукции (тонн)',
        data: [120, 190, 170, 200, 210, 180],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
    }]
};

const efficiencyData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [{
        label: 'Эффективность (%)',
        data: [85, 88, 90, 87, 92, 89],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
    }]
};

// Инициализация графиков
document.addEventListener('DOMContentLoaded', () => {
    const productionCtx = document.getElementById('productionChart').getContext('2d');
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');

    new Chart(productionCtx, {
        type: 'bar',
        data: productionData,
        options: { responsive: true }
    });

    new Chart(efficiencyCtx, {
        type: 'line',
        data: efficiencyData,
        options: { responsive: true }
    });

    // Обновление статистики
    document.getElementById('totalOutput').textContent = 
        productionData.datasets[0].data.reduce((a, b) => a + b, 0) + ' т';
    
    const avgEfficiency = efficiencyData.datasets[0].data.reduce((a, b) => a + b, 0) / 
                         efficiencyData.datasets[0].data.length;
    document.getElementById('efficiency').textContent = avgEfficiency.toFixed(1) + '%';
});
