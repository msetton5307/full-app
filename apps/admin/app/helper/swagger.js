const express = require('express');

const router = express.Router();

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const path = require('path');

/* This is for Admin end swiagger API doc */
const optionsAdmin = {
	swaggerDefinition: {
		info: {
			title: project_name,
			version: '3.0.1',
			description: project_name + ' API Documentation',
			contact: {
				email: '',
			},
		},
		tags: [
			{
				name: "Auth",
				description: "Authentication APIs"
			},
			{
				name: "User",
				description: "User APIs"
			},
		],
		// schemes: ['http'],
		// host: `127.0.0.1:` + config.app.port,
		schemes: ['https', 'http'],
		host: `sysaving.dedicateddevelopers.us`,
		basePath: '/api',
		securityDefinitions: {
			Token: {
				type: 'apiKey',
				description: 'JWT authorization of an API',
				name: 'x-access-token',
				in: 'header',
			},
		},
	},

	apis: [path.join(__dirname, `../routes/api/*.js`)],
};



const swaggerSpec = swaggerJSDoc(optionsAdmin);
require('swagger-model-validator')(swaggerSpec);

router.get('/apidoc-json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});

router.use('/apidoc', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec));


function validateModel(name, model) {
	const responseValidation = swaggerSpec.validateModel(name, model, false, true);
	if (!responseValidation.valid) {
		throw new Error('Model doesn\'t match Swagger contract');
	}
}





module.exports = {
	router,
	validateModel
};





