const express=require('express');
const app = express();
require('./db/dbconnection');
const userRouter = require("./routes/userRouter");

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coders World',
      version: '1.0.0',
    },
  },
  apis: ['./routes/userRouter.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

// app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a greeting message
 *     tags:
 *       - User
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
 app.get('/', (req, res) => {
  res.send('Hello World!');
});


                                                
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 
app.use("/api/v1/user", userRouter);



                                                
app.listen(5050,()=>{
    console.log("Server is running on 5050");
});