const validateDate = (userData) => {
    let errors = []

    if (!userData.Username) {
        errors.push('Username')
    }
    if (!userData.Password) {
        errors.push('Password')
    }
    if (!userData.Email) {
        errors.push('Email')
    }

    return errors
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า

    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();
    let email = document.getElementById('email').value.trim();


    try {

        let userData = {
            "Username": username,
            "Password": password,
            "Email": email
        };

        console.log('Submitting data:', userData);

        const errors = validateDate(userData)

        if (errors.length > 0) {
            // มี error เกิดขึ้น
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
    
        const response = await axios.post('http://localhost:8000/users', userData);
        console.log('Response:', response.data);
        alert('บันทึกข้อมูลเรียบร้อย');
        window.location.href = 'login.html';
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