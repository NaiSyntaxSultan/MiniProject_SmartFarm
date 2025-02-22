const validateDate = (userData) => {
    let errors = []

    if (!userData.Username) {
        errors.push('Username')
    }
    if (!userData.Password) {
        errors.push('Password')
    }
    return errors
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    try {

        let userData = {
            "Username": username,
            "Password": password
        };

        const errors = validateDate(userData)

        if (errors.length > 0) {
            // มี error เกิดขึ้น
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
        
        try {
            const response = await axios.post('http://localhost:8000/users/login', userData);
            console.log('response', response.data.message);
            let welcome = response.data.message
            alert(welcome);
            if (response.data.role == 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert('เกิดข้อผิดพลาดบางอย่าง');
            }
        }
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

console.log('connect JS')