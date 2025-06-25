const config = {
	development: {
		apiUrl: 'http://localhost:5000',
		environment: 'development',
	},
	production: {
		apiUrl: 'https://ceylon-top-guide-v1.fly.dev',
		environment: 'production',
	},
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
