const BASE_URL = 'http://localhost:8000'

let barChart, pieChart;
let sensorHistory = []; // เก็บค่าข้อมูลเซ็นเซอร์ที่ได้รับมาแต่ละครั้ง
const MAX_HISTORY = 10; // กำหนดจำนวนข้อมูลที่ใช้คำนวณค่าเฉลี่ย

window.onload = async () => {
    await loadData()
    await loadAllData()
}

const loadData = async () => {
    const response = await axios.get(`${BASE_URL}/sensors/all`)
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

// แสดงข้อมูลเซ็นเซอร์ทั้งหมดบนตาราง
const loadAllData =  async () => {
    // Load sensors ทั้งหมดออกมาจาก API
    const response = await axios.get(`${BASE_URL}/sensors/all`)

    const allDataDOM = document.querySelector("#sensorTable tbody")

    let htmlData = ''
    // นำ plants ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response.data.length;i++) {
        let data = response.data[i]
        htmlData += `<tr>
            <td>${i+1}</td>
            <td>${data.Timestamp}</td>
            <td>${data.Temperature}</td>
            <td>${data.Humidity}</td>
            <td>${data.Nitrogen}</td>
            <td>${data.Phosphorus}</td>
            <td>${data.Potassium}</td>
            <td>${data.PH}</td>
            <td>${data.Rainfall}</td>
        </tr>`
    }

    allDataDOM.innerHTML = htmlData
}
