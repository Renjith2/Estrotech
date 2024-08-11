// userValidation.js

const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const nameRegex = /^[A-Za-z]{3,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

const validateEmail = (email) => {
    if (!emailRegex.test(email)) {
        throw new Error("Email must end with @gmail.com");
    }
};

const validateName = (name) => {
    if (!nameRegex.test(name)) {
        throw new Error("Name must contain only alphabets and be at least 3 characters long");
    }
};

const validatePassword = (password) => {
    if (!passwordRegex.test(password)) {
        throw new Error("Password must be at least 10 characters long, contain one uppercase letter, one number, and one special character");
    }
};

module.exports = {
    validateEmail,
    validateName,
    validatePassword
};
