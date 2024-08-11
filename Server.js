const express = require('express')
require('dotenv').config()
var cors=require('cors')
const userRoute=require('./routes/userRoute')
const{specs,swaggerUi}=require('./swagger')

const dbConfig=require('./config/dbConfig')
const analyticsRoute=require('./routes/analyticsRouter')
const uptimeRoute=require('./routes/uptimeRoute')
const overallreportRoute=require('./routes/overallreportRouter')
const app=express() 
app.use(express.json())
app.use('/api/user',userRoute)
app.use('/api/analytics',analyticsRoute)
app.use('/api/uptime',uptimeRoute)
app.use('/api/overall-report',overallreportRoute)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(7700,()=>{
    console.log("Server is Running!!!!!!@@@")
})

app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  
app.get('/',(req,res)=>{
    res.send("HIIIIII@!!!!!")
})
