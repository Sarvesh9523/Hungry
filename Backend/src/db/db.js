const mongoose = require('mongoose')


const connectDB = async()=>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected Successfully: ${connect.connection.host}`);
    
    }catch(err){
        console.log(`Error: ${err.message}`)
        process.exit(1) ;

    }

}

module.exports = connectDB;
