const processENV = process.env.TEST_ENV
const env = processENV || 'dev'
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
    config.userEmail = '',
    config.userPassword = ''
}

export { config }