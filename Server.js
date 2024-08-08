const express = require('express')
require('dotenv').config()
var cors=require('cors')
const userRoute=require('./routes/userRoute')

const dbConfig=require('./config/dbConfig')
const blogRoute= require('./routes/blogROute')
const app=express()
app.use(cors())
app.use(express.json())
app.use('/api/user',userRoute)
app.use('/api/blog',blogRoute)



app.listen(7700,()=>{
    console.log("Server is Running!!!!!!@@@")
})

app.get('/',(req,res)=>{
    res.send("HIIIIII@!!!!!")
})
