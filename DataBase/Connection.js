const mongoose = require("mongoose");

const Connection = async (userName, userPass, userDB) => {
    try {
        await mongoose.connect(`mongodb+srv://${userName}:${userPass}@cluster0.he6lxvj.mongodb.net/${userDB}?retryWrites=true&w=majority`, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        // console.log("DataBase Connected Successfully...");
    } catch (error) {
        // console.log("MongoDB Connection", error);
    }
}

// mongodb+srv://${userName}:${userPass}@cluster0.he6lxvj.mongodb.net/${userDB}?retryWrites=true&w=majority

module.exports = Connection;