console.log('connect JS')
const BASE_URL = 'http://localhost:8000'

window.onload = async () => {
    await loadsubplant()
    await loadData()
    await dropdown()
}
let selectedPlantID = null;  // เก็บค่า ID ของพืชที่กำลังแก้ไข

const loadData = async () => {
    console.log('on load')
    // Load plants ทั้งหมดออกมาจาก API
    const response = await axios.get(`${BASE_URL}/plants`)

    console.log(response.data)

    const plantsDOM = document.querySelector("#plantTable tbody")

    let htmlData = ''
    // นำ plants ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response.data.length;i++) {
        let plant = response.data[i]
        htmlData += `<tr>
            <td>${i+1}</td>
            <td>${plant.PlantName}</td>
            <td>${plant.PlantSeason}</td>
            <td>${plant.GrowthStage}</td>
            <td>${plant.CropDensity}</td>
            <td>${plant.PestPressure}</td>
            <td>
                <button class='editt' data-id=${plant.PlantID} onclick="openModal(3)">Edit</button>
                <button class='deletee' data-id=${plant.PlantID}>Delete</button>
            </td>   
        </tr>`
    }

    plantsDOM.innerHTML = htmlData

    // button class=dalete
    const deleteDOMs = document.getElementsByClassName('deletee')

    for (let i=0;i<deleteDOMs.length;i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            // ดึง id ออกมา
            const id = event.target.dataset.id
            try {
                await axios.delete(`${BASE_URL}/plants/${id}`)
                loadData() // call function ตัวเอง
            } catch (error) {
                console.log('error', error)
            }
        })
    }

    // button class=edit
    const editDOMs = document.getElementsByClassName('editt')

    for (let i=0;i<editDOMs.length;i++) {
        editDOMs[i].addEventListener('click', async (event) => {
            // ดึง id ออกมา
            selectedPlantID = event.target.dataset.id
            try {
                const response = await axios.get(`${BASE_URL}/plants/${selectedPlantID}`)
                const plant = response.data

                let plantName = document.getElementById('plantName2')
                let plantSeason = document.getElementById('plantseason2')
                let growthStage = document.getElementById('growthstage2')
                let cropDensity = document.getElementById('cropdensity2')
                let pestPressure = document.getElementById('pestpressure2')

                plantName.value = plant.PlantName
                plantSeason.value = plant.PlantSeason
                growthStage.value = plant.GrowthStage
                cropDensity.value = plant.CropDensity
                pestPressure.value = plant.PestPressure

            }
            catch (error) {
                console.log('error', error)
            }
        })
    }
}


document.getElementById('editplantForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    let plantname = document.getElementById('plantName2').value;
    let plantseason = document.getElementById('plantseason2').value;
    let growthstage = document.getElementById('growthstage2').value;
    let cropDensity = document.getElementById('cropdensity2').value.trim();
    let pestPressure = document.getElementById('pestpressure2').value.trim();


    try {

        let plantData = {
            "PlantName": plantname,
            "PlantSeason": plantseason,
            "GrowthStage": growthstage,
            "CropDensity": cropDensity,
            "PestPressure": pestPressure
        };

        console.log('Updating data:', plantData);

        const errors = validateDate(plantData,2)

        if (errors.length > 0) {
            // มี error เกิดขึ้น
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
    
        const response = await axios.put(`${BASE_URL}/plants/${selectedPlantID}`, plantData);
        console.log('Response:', response.data);
        alert('แก้ไขข้อมูลเรียบร้อย');
        document.getElementById('editplantForm').reset();
    } catch (error) {

        let htmlData = error.message
        htmlData += 'กรุณากรอก '
        for(let i=0;i<error.errors.length;i++) {
            htmlData += error.errors[i]

            if (i < error.errors.length-1) {
                htmlData += ','
            }
        }

        console.log('Error Message', error.message)
        console.error('Error:', error.errors);
        alert(htmlData);
    }
});

const loadsubplant =  async () => {
    console.log('on loadsubplant')
    // Load subplants ทั้งหมดออกมาจาก API
    const response = await axios.get(`${BASE_URL}/subplants`)

    console.log(response.data)

    const subplantsDOM = document.querySelector("#plantTable1 tbody")

    let htmlData = ''
    // นำ plants ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response.data.length;i++) {
        let plant = response.data[i]
        htmlData += `<tr>
            <td>${i+1}</td>
            <td>${plant.PlantName}</td> 
        </tr>`
    }

    subplantsDOM.innerHTML = htmlData
}

const dropdown =  async () => {
    
    // Load subplants ทั้งหมดออกมาจาก API
    const response1 = await axios.get(`${BASE_URL}/subplants`)
    // Load subplantsSS ทั้งหมดออกมาจาก API
    const response2 = await axios.get(`${BASE_URL}/subplantsSS`)
    // Load subplantsgr ทั้งหมดออกมาจาก API
    const response3 = await axios.get(`${BASE_URL}/subplantsgr`)

    // add
    const subplantsDOM = document.querySelector("#plantName1")
    const subplantseasonDOM = document.querySelector("#plantSeason1")
    const subgrowthstageDOM = document.querySelector("#growthStage1")
    // edit
    const subplantsDOM1 = document.querySelector("#plantName2")
    const subplantseasonDOM1 = document.querySelector("#plantseason2")
    const subgrowthstageDOM1 = document.querySelector("#growthstage2")

    let htmlData1 = '<option value="">Select a Plant</option>'
    // นำ plants ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response1.data.length;i++) {
        let plant = response1.data[i]
        htmlData1 += `<option value="${plant.PlantID2}">${plant.PlantName}</option>`
    }

    let htmlData2 = '<option value="">Select a Season</option>'
    // นำ season ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response2.data.length;i++) {
        let plant = response2.data[i]
        htmlData2 += `<option value="${plant.PlantID11}">${plant.PlantSeason}</option>`
    }

    let htmlData3 = '<option value="">Select a Growth Stage</option>'
    // นำ season ที่โหลดมาใส่กลับเข้าไปใน html
    for (let i=0;i<response3.data.length;i++) {
        let plant = response3.data[i]
        htmlData3 += `<option value="${plant.PlantID3}">${plant.GrowthStage}</option>`
    }

    // add
    subplantsDOM.innerHTML = htmlData1
    subplantseasonDOM.innerHTML = htmlData2
    subgrowthstageDOM.innerHTML = htmlData3
    // edit
    subplantsDOM1.innerHTML = htmlData1
    subplantseasonDOM1.innerHTML = htmlData2
    subgrowthstageDOM1.innerHTML = htmlData3
}

function openModal(num) {
    if (num == 1){
        document.getElementById("modal").classList.add("show");
    } else if (num == 2) {
        dropdown()
        document.getElementById('addall').classList.add('show');
    } else {
        document.getElementById('edit').classList.add('show');
    }
    
}

function closeModal(num) {
    if (num == 1) {
        document.getElementById("modal").classList.remove("show");
        loadsubplant()
    } else if (num == 2) {
        document.getElementById('addall').classList.remove('show');
        loadData()
    } else {
        document.getElementById("edit").classList.remove("show");
        loadData()
    }
}

const validateDate = (userData,num) => {
    let errors = []

    if (num == 1) {
        if (!userData.PlantName) {
            errors.push('PlantName')
        }
    } else {
        if (!userData.PlantName) {
            errors.push('PlantName')
        }
        if (!userData.PlantSeason) {
            errors.push('PlantSeason')
        }
        if (!userData.GrowthStage) {
            errors.push('GrowthStage')
        }
        if (!userData.CropDensity) {
            errors.push('CropDensity')
        }
        if (!userData.PestPressure) {
            errors.push('PestPressure')
        }
    }
    return errors
}

document.getElementById('subplantForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    let plantname = document.getElementById('plantName').value.trim();


    try {

        let plantData = {
            "PlantName": plantname
        };

        console.log('Submitting data:', plantData);

        const errors = validateDate(plantData,1)

        if (errors.length > 0) {
            // มี error เกิดขึ้น
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
    
        const response = await axios.post('http://localhost:8000/subplants', plantData);
        console.log('Response:', response.data);
        alert('บันทึกข้อมูลเรียบร้อย');
        document.getElementById('subplantForm').reset();
    } catch (error) {

        let htmlData = error.message
        htmlData += 'กรุณากรอก '
        for(let i=0;i<error.errors.length;i++) {
            htmlData += error.errors[i]

            if (i < error.errors.length-1) {
                htmlData += ','
            }
        }

        console.log('Error Message', error.message)
        console.error('Error:', error.errors);
        alert(htmlData);
    }
});

document.getElementById('plantForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    let plantname = document.getElementById('plantName1').value;
    let plantseason = document.getElementById('plantSeason1').value;
    let growthstage = document.getElementById('growthStage1').value;
    let cropDensity = document.getElementById('cropDensity1').value.trim();
    let pestPressure = document.getElementById('pestPressure1').value.trim();


    try {

        let plantData = {
            "PlantName": plantname,
            "PlantSeason": plantseason,
            "GrowthStage": growthstage,
            "CropDensity": cropDensity,
            "PestPressure": pestPressure
        };

        console.log('Submitting data:', plantData);

        const errors = validateDate(plantData,2)

        if (errors.length > 0) {
            // มี error เกิดขึ้น
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
    
        const response = await axios.post('http://localhost:8000/plants', plantData);
        console.log('Response:', response.data);
        alert('บันทึกข้อมูลเรียบร้อย');
        document.getElementById('plantForm').reset();
    } catch (error) {

        let htmlData = error.message
        htmlData += 'กรุณากรอก '
        for(let i=0;i<error.errors.length;i++) {
            htmlData += error.errors[i]

            if (i < error.errors.length-1) {
                htmlData += ','
            }
        }

        console.log('Error Message', error.message)
        console.error('Error:', error.errors);
        alert(htmlData);
    }
});