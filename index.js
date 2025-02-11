const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.DB)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Import and use routes
require("./routes/routes")(app);



const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
