import mongoose from 'mongoose'

const discordSchema = mongoose.Schema({

          //channelName first................1
          channelName : String,

          //conversation second..............2
          conversation : [{

                    //message details........3
                    message : String,
                    timestamp : String,

                    //user details...........4
                    user : {
                              displayName : String,
                              email : String,
                              photo : String,
                              uid : String,
                    }
          }]
})

                                             //plural form
export default mongoose.model('conversations', discordSchema)