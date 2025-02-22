const express = require('express')
const bodyparser = require('body-parser')
const app = express()
const mysql = require('mysql2/promise')
const cors = require('cors')
const bcrypt = require('bcrypt');

app.use(bodyparser.json())
// อนุญาติให้ใครยิงมาก็ได้
app.use(cors())

const port = 8000

let conn = null

const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'miniproject'
    })
}



// path = GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users')
    res.json(results[0])
})

// path = GET /plants สำหรับ get plants ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/plants', async (req, res) => {
    const results = await conn.query('SELECT plants.PlantID, subplantname.PlantName, subplantseason.PlantSeason, subgrowth.GrowthStage, plants.CropDensity, plants.PestPressure FROM plants JOIN subplantname ON plants.PlantName = subplantname.PlantID2 JOIN subgrowth ON plants.GrowthStage = subgrowth.PlantID3 JOIN subplantseason ON plants.PlantSeason = subplantseason.PlantID11 ORDER BY plants.PlantID')
    res.json(results[0])
})

// path = GET /subplants สำหรับ get subplants ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/subplants', async (req, res) => {
    const results = await conn.query('SELECT * FROM subplantname')
    res.json(results[0])
})

// path = GET /subplantsSS สำหรับ get subplantsSS ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/subplantsSS', async (req, res) => {
    const results = await conn.query('SELECT * FROM subplantseason')
    res.json(results[0])
})

// path = GET /subplantsgr สำหรับ get subplantsgr ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/subplantsgr', async (req, res) => {
    const results = await conn.query('SELECT * FROM subgrowth')
    res.json(results[0])
})

// path = GET /sensors สำหรับ get sensors ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/sensors/all', async (req, res) => {
    try {
        const [results] = await conn.query(`
            SELECT * FROM sensors
            WHERE Timestamp <= NOW()
            ORDER BY Timestamp ASC;
        `); // NOW() ค่าเวลาปัจจุบัน

        // map คือการวนลูปแต่ละแถวเพื่อแปลงข้อมูลให้เป็นรูปแบบที่เราต้องการ
        const formattedResults = results.map(row => ({
            SensorID: row.SensorID,
            // ตรวจสอบว่า row.Timestamp มีค่า (ไม่เป็น null หรือ undefined)
            Timestamp: row.Timestamp
                // แปลง timestamp ให้เป็นวันที่และเวลาในรูปแบบของประเทศไทย GMT+7
                ? new Date(row.Timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
                : "Invalid Timestamp",
            Nitrogen: row.Nitrogen,
            Phosphorus: row.Phosphorus,
            Potassium: row.Potassium,
            Temperature: row.Temperature,
            Humidity: row.Humidity,
            PH: row.PH,
            Rainfall: row.Rainfall
        }));

        res.json(formattedResults);
    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            errorMessage: error.message
        });
    }
})


// path = GET /users/:id สำหรับการดึง users หลายคนออกมา
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('SELECT * FROM users WHERE UserID = ?', id)

        if (results[0].length == 0) {
            //โยนทิ้ง
            throw { statusCode: 404, message: 'not found!!' }
            
        } 
        res.json(results[0][0])

    } catch (error) {
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = GET /users/:id สำหรับการดึง users หลายคนออกมา
app.get('/plants/:id', async (req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('SELECT * FROM plants WHERE PlantID = ?', id)

        if (results[0].length == 0) {
            //โยนทิ้ง
            throw { statusCode: 404, message: 'not found!!' }
            
        } 
        res.json(results[0][0])

    } catch (error) {
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = POST /users สำหรับการสร้าง users ใหม่ที่บันทึกเข้ามา โดยใช้ bcrypt ในการเข้ารหัส password
app.post('/users' , async (req, res) => {
    try {
        const { Username, Password, Email } = req.body
        const passwordHash = await bcrypt.hash(Password, 10)
        const userData = {
            Username,
            Password: passwordHash,
            Email
        }
        const results = await conn.query('INSERT INTO users SET ?', userData)
        res.json({
            message: 'insert ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = POST /users/login สำหรับการ login โดยต้องเช็คว่า username และ password ตรงกับที่มีในระบบหรือไม่
app.post('/users/login', async (req, res) => {
    try {
        const { Username, Password} = req.body
        const [results] = await conn.query('SELECT * FROM users WHERE Username = ?', Username)
        const userData = results[0]
        const match = await bcrypt.compare(Password, userData.Password)
        if (!match) {
            return res.status(400).json({ 
                message: 'login fail' 
            });
        }
        return res.json({ 
            username: userData.Username,
            message: 'login success',
            role: userData.UserRole
        });        
    } catch (error) {
        res.status(401).json({
            message: 'login fail'
        })
    }
})

// path = POST /plants สำหรับการสร้าง plants ใหม่ที่บันทึกเข้ามา
app.post('/plants' , async (req, res) => {
    try {
        let plants = req.body
        const results = await conn.query('INSERT INTO plants (PlantName, PlantSeason, GrowthStage, CropDensity, PestPressure) VALUES ( (SELECT PlantID2 FROM subplantname WHERE PlantID2 = ?), (SELECT PlantID11 FROM subplantseason WHERE PlantID11 = ?), (SELECT PlantID3 FROM subgrowth WHERE PlantID3 = ?), ?, ?)', [plants.PlantName, plants.PlantSeason, plants.GrowthStage, plants.CropDensity, plants.PestPressure])
        res.json({
            message: 'insert ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = POST /subplants สำหรับการสร้าง subplants ใหม่ที่บันทึกเข้ามา
app.post('/subplants' , async (req, res) => {
    try {
        let plant = req.body
        const results = await conn.query('INSERT INTO subplantname SET ?', plant)
        res.json({
            message: 'insert ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = PUT /users/:id สำหรับการแก้ไข users รายคน ตาม id
app.put('/users/:id', async (req,res) => {
    try {
        let id = req.params.id
        let updateUser = req.body
        const results = await conn.query('UPDATE users SET ? WHERE UserID = ?', [updateUser, id])
        res.json({
            message: 'update ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = PUT /plants/:id สำหรับการแก้ไข plants รายคน ตาม id
app.put('/plants/:id', async (req,res) => {
    try {
        let id = req.params.id
        let updateplant = req.body
        const [results] = await conn.query('UPDATE plants SET ? WHERE PlantID = ?', [updateplant, id])
        res.json({
            message: 'update ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = PATCH /user/:id
app.patch('/user/:id', (req,res) => {
    let id = req.params.id
    let updateUser = req.body

    // หา users จาก id ที่ส่งมา
    let selectedIndex = users.findIndex(user => user.id == id)

    // update users นั้น
    if (updateUser.firstname) {
        users[selectedIndex].firstname = updateUser.firstname
    }

    if (updateUser.lastname) {
        users[selectedIndex].lastname = updateUser.lastname
    }

    if (updateUser.age) {
        users[selectedIndex].age = updateUser.age
    }

    // users ที่ update ใหม่ update กลับเข้าไปที่ users ตัวเดิม


    res.json({
        message: 'update user complete!',
        data: {
            user: updateUser,
            indexUpdate: selectedIndex
        }
    })
})

// path = DELETE /users/:id สำหรับการลบ users รายคนตาม id
app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('DELETE FROM users WHERE UserID = ?', id)
        res.json({
            message: 'delete ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = DELETE /plants/:id สำหรับการลบ plants ตาม id
app.delete('/plants/:id', async (req, res) => {
    try {
        let id = req.params.id
        await conn.query('DELETE FROM cropcare WHERE PlantID1 = ?', id)
        await conn.query('DELETE FROM plantationareas WHERE PlantID = ?', id)
        const results = await conn.query('DELETE FROM plants WHERE PlantID = ?', id)
        res.json({
            message: 'delete ok',
            data: results[0]
        })
    } catch (error) {
        res.status(500).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

app.listen(port, async (req, res) => {
    await initMySQL()
    console.log('http server run at ' + port)
})