const BASE_URL = 'http://localhost:8000'

let barChart, pieChart;
const UPDATE_INTERVAL = 5000;
window.onload = async () => {
    await loadData()
    await loadAllData()

    // ทำการโหลดข้อมูลทุกๆ 5 วินาที
    setInterval(async () => {
        await loadData()
        await loadAllData()
    }, UPDATE_INTERVAL);
}

const loadData = async () => {
    const response = await axios.get(`${BASE_URL}/sensors/now`)
    const sensors = response.data[0]

    document.getElementById("temp").innerText = `${sensors.Temperature} °C`;
    document.getElementById("humidity").innerText = `${sensors.Humidity} %`;
    document.getElementById("nitrogen").innerText = `${sensors.Nitrogen} mg/kg`;
    document.getElementById("phosphorus").innerText = `${sensors.Phosphorus} mg/kg`;
    document.getElementById("potassium").innerText = `${sensors.Potassium} mg/kg`;
    document.getElementById("ph").innerText = `${sensors.PH}`;
    document.getElementById("rainfall").innerText = `${sensors.Rainfall} mm`;
}

// แสดงข้อมูลเซ็นเซอร์ทั้งหมดบนตาราง
const loadAllData =  async () => {
    // Load sensors ทั้งหมดออกมาจาก API
    const response = await axios.get(`${BASE_URL}/sensors/all`)
    const sensorData = response.data

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

    const averages = calculateAverages(sensorData)
    console.log(averages)
    updateChart(averages);

}

// ฟังก์ชันคำนวณค่าเฉลี่ยของค่าต่างๆ ใน sensorData
const calculateAverages = (data) => {
    let sum = {
        Temperature: 0,
        Humidity: 0,
        Nitrogen: 0,
        Phosphorus: 0,
        Potassium: 0,
        PH: 0,
        Rainfall: 0
    };

    // วนลูปสะสมค่าของแต่ละคอลัมน์
    for (let i = 0; i < data.length; i++) {
        sum.Temperature += data[i].Temperature;
        sum.Humidity += data[i].Humidity;
        sum.Nitrogen += data[i].Nitrogen;
        sum.Phosphorus += data[i].Phosphorus;
        sum.Potassium += data[i].Potassium;
        sum.PH += data[i].PH;
        sum.Rainfall += data[i].Rainfall;
    }

    // คำนวณค่าเฉลี่ย
    let count = data.length;
    let averages = {
        Temperature: (sum.Temperature / count).toFixed(2),
        Humidity: (sum.Humidity / count).toFixed(2),
        Nitrogen: (sum.Nitrogen / count).toFixed(2),
        Phosphorus: (sum.Phosphorus / count).toFixed(2),
        Potassium: (sum.Potassium / count).toFixed(2),
        PH: (sum.PH / count).toFixed(2),
        Rainfall: (sum.Rainfall / count).toFixed(2)
    };

    return averages;
}

// ฟังก์ชันอัปเดตข้อมูลใน Bar Chart และ Pie Chart
const updateChart = (averages) => {
    // ข้อมูลสำหรับ Bar Chart (แสดงค่าธาตุอาหารในดิน)
    const barData = [averages.Nitrogen, averages.Phosphorus, averages.Potassium];
    
    // ข้อมูลสำหรับ Pie Chart (แสดงค่าภาวะแวดล้อม)
    const pieData = [averages.Temperature, averages.Humidity, averages.PH, averages.Rainfall];

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