const BASE_URL = 'http://localhost:8000'

let barChart, pieChart;
let sensorHistory = []; // เก็บค่าข้อมูลเซ็นเซอร์ที่ได้รับมาแต่ละครั้ง
const MAX_HISTORY = 10; // กำหนดจำนวนข้อมูลที่ใช้คำนวณค่าเฉลี่ย

window.onload = async () => {
    await loadData()
    setInterval(loadData, 3000); // อัปเดตทุก 3 วินาที
}

const loadData = async () => {
    const response = await axios.get(`${BASE_URL}/sensors`)
    const sensors = response.data

    // เพิ่มข้อมูลใหม่ลงใน sensorHistory และลบข้อมูลเก่าหากเกินจำนวนที่กำหนด
    sensorHistory.push(sensors);
    if (sensorHistory.length > MAX_HISTORY) {
        sensorHistory.shift();
    }

    document.getElementById("temp").innerText = `${sensors.Temperature} °C`;
    document.getElementById("humidity").innerText = `${sensors.Humidity} %`;
    document.getElementById("nitrogen").innerText = `${sensors.Nitrogen} mg/kg`;
    document.getElementById("phosphorus").innerText = `${sensors.Phosphorus} mg/kg`;
    document.getElementById("potassium").innerText = `${sensors.Potassium} mg/kg`;
    document.getElementById("ph").innerText = `${sensors.PH}`;
    document.getElementById("rainfall").innerText = `${sensors.Rainfall} mm`;

    // คำนวณค่าเฉลี่ยของข้อมูลเซ็นเซอร์
    const avgSensors = calculateAverage(sensorHistory);
    updateCharts(avgSensors);
    updateTable(sensors);
}

// ฟังก์ชันคำนวณค่าเฉลี่ยของค่าต่างๆ ใน sensorHistory
const calculateAverage = (data) => {
    const keys = ['Temperature', 'Humidity', 'Nitrogen', 'Phosphorus', 'Potassium', 'PH', 'Rainfall'];
    let avg = {};

    for (let i = 0; i < keys.length; i++) {
        let sum = 0;
        for (let j = 0; j < data.length; j++) {
            sum += data[j][keys[i]];
        }
        avg[keys[i]] = sum / data.length;
    }

    return avg;
}


const updateCharts = (sensors) => {
    // ข้อมูลสำหรับ Bar Chart (แสดงค่าธาตุอาหารในดิน)
    const barData = [sensors.Nitrogen, sensors.Phosphorus, sensors.Potassium];
    
    // ข้อมูลสำหรับ Pie Chart (แสดงค่าภาวะแวดล้อม)
    const pieData = [sensors.Temperature, sensors.Humidity, sensors.PH, sensors.Rainfall];

    const barCtx = document.getElementById('myChart').getContext('2d');
    const pieCtx = document.getElementById('myChart1').getContext('2d');

    if (!barChart) {
        // สร้าง Bar Chart ครั้งแรก
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
                datasets: [{
                    label: 'Soil Nutrients (mg/kg)',
                    data: barData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        // อัปเดตค่า Bar Chart
        barChart.data.datasets[0].data = barData;
        barChart.update();
    }

    if (!pieChart) {
        // สร้าง Pie Chart ครั้งแรก
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Temperature (°C)', 'Humidity (%)', 'pH', 'Rainfall (mm)'],
                datasets: [{
                    data: pieData,
                    backgroundColor: ['#FF5733', '#33FF57', '#5733FF', '#FFC300']
                }]
            },
            options: {
                responsive: true
            }
        });
    } else {
        // อัปเดตค่า Pie Chart
        pieChart.data.datasets[0].data = pieData;
        pieChart.update();
    }
}

const updateTable = (sensors) => {
    const tableBody = document.getElementById("sensorTable").getElementsByTagName("tbody")[0];

    // สร้างแถวใหม่
    const newRow = tableBody.insertRow();

    const isoString = sensors.Timestamp;
    const date = new Date(isoString);
    const formattedDate = date.toLocaleString("th-TH", { 
        year: "numeric", month: "2-digit", day: "2-digit", 
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

    // เพิ่มข้อมูลแต่ละคอลัมน์
    newRow.insertCell(0).innerText = formattedDate;
    newRow.insertCell(1).innerText = sensors.Temperature.toFixed(2);
    newRow.insertCell(2).innerText = sensors.Humidity.toFixed(2);
    newRow.insertCell(3).innerText = sensors.Nitrogen.toFixed(2);
    newRow.insertCell(4).innerText = sensors.Phosphorus.toFixed(2);
    newRow.insertCell(5).innerText = sensors.Potassium.toFixed(2);
    newRow.insertCell(6).innerText = sensors.PH.toFixed(2);
    newRow.insertCell(7).innerText = sensors.Rainfall.toFixed(2);

    // จำกัดจำนวนแถวให้แสดงล่าสุด 10 ค่า
    if (tableBody.rows.length > MAX_HISTORY) {
        tableBody.deleteRow(0); // ลบแถวแรก (แถวเก่าที่สุด)
    }
}
