const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      servers: [
        {
          url: 'http://localhost:3000', // Update with your server URL
        },
      ],
    },
    apis: ['./*.js'],
    info: {
        "title": "Help Juan",
        "summary": "An online Help Want Ads.",
        "description": "Anyone can post a Help Want Ad.",
        "termsOfService": "https://example.com/terms/",
        "contact": {
            "name": "API Support",
            "url": "https://www.example.com/support",
            "email": "support@example.com"
        },
        "license": {
            "name": "Apache 2.0",
            "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
        },
        "version": "1.0.1"
    }
}   

module.exports = swaggerOptions;
  