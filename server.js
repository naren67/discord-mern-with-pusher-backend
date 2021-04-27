import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
//mongoData import - schema
import mongoData from './mongoData.js'
import Pusher from 'pusher'


//app config
const app = express()
const port = process.env.PORT || 4000

//pusher to make mongodb a realtime
const pusher = new Pusher({
       appId: "1194991",
       key: "ca601933a3860937099f",
       secret: "8aa6d59f0d5a77f874fa",
       cluster: "ap2",
       useTLS: true
     });
     

//middlewares
app.use(express.json())
app.use(cors())

//db config
const mongodbURL = 'mongodb+srv://admin:RNkuFMfkHZ9xMMR@cluster0.nvljm.mongodb.net/discordDB?retryWrites=true&w=majority'

mongoose.connect(mongodbURL, {
          useCreateIndex:true,
          useNewUrlParser:true,
          useUnifiedTopology:true, 
})

//pusher error handler and connections
mongoose.connection.once('open',()=>{
       console.log('connection is open - database')

       const changeStream = mongoose.connection.collection('conversations').watch()

       changeStream.on('change', (change)=>{
              if(change.operationType === 'insert'){
                     pusher.trigger('channels', 'newChannel', {
                            'change' : change
                     })
              }
              else if(change.operationType === 'update'){
                     pusher.trigger('conversation', 'newMessage', {
                            'change' : change
                     })
              }
              else{
                     console.log('error while triggering pusher')
              }
       })
})


//api router
app.get('/',(req,res)=>{
          res.status(200).send('hello there')
})

app.post('/new/channel',(req,res)=>{
          //req
          const dbData = req.body

          //res
          mongoData.create(dbData, (err,data)=>{
                    if(err){
                              res.status(500).send(err)
                    }
                    else{
                              res.status(201).send(data)
                    }
          })

})

app.get('/get/channelList',(req,res)=>{

          mongoData.find((err,data)=>{
                    if(err){
                              res.status(500).send(err)
                    }
                    else{

                              let channels = []

                              data.map(channelData => {
                                        const channelInfo = {
                                                  id : channelData._id,
                                                  channelName : channelData.channelName,
                                        }

                                        channels.push(channelInfo)
                              })
                              res.status(201).send(channels)
                    }
          })
})


app.post('/new/message',(req,res)=>{
       const newMessage = req.body

       mongoData.update(
                 //filter part from url ? //localhost:8002/new/message?id=767867834
                 {_id : req.query.id},
                 {$push : {conversation : req.body}},
                 (err,data)=>{
                           if(err){
                                     console.log('error while sending message - ', err)
                                     res.status(500).send(err)
                           }
                           else{
                                     res.status(201).send(data)
                           }
                 }
       )

          
})


//get the entire created mongodb posted schema data..............the entire set of channel data with messages and user info
app.get('/get/data',(req,res)=>{
          mongoData.find((err,data)=>{
                    if(err){
                              res.status(500).send(err)
                    }
                    else{
                              res.status(200).send(data)
                    }
          })
}) 

//getting only the conversation part 
app.get('/get/conversation',(req,res)=>{
       const id = req.query.id

       mongoData.find({ _id : id },(err,data)=>{
              if(err){
                     res.status(500).send(err)
              }
              else{
                     res.status(200).send(data)
              }
       })
})

//listener
app.listen(port,()=>{
          console.log(`app is live on ${port}`)
})