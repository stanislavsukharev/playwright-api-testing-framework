import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV
const env = processENV || 'prod'
console.log(`Test environment is: ${env}`);

const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'email@test.io',
    userPassword: 'password'
}

if(env === 'qa') {
    config.userEmail = 'email2@test.io',
    config.userPassword = 'password2'
}

if(env === 'prod') {
    config.userEmail = process.env.PROD_USERNAME as string,
    config.userPassword = process.env.PROD_PASSWORD as string
}

export { config }