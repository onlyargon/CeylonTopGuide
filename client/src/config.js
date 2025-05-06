const config = {
    development: {
        apiUrl: 'http://localhost:5000',
        environment: 'development'
    },
    production: {
        apiUrl: 'https://topguide.onrender.com',
        environment: 'production'
    }
};

const env = process.env.NODE_ENV || 'development';
export default config[env]; 