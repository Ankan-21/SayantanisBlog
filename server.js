const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const userAuth = require("./middlewares/userAuth");
const adminAuth = require("./middlewares/adminAuth");

app.use(session({
    cookie: {
        maxAge: 60000
    },
    secret: "sayantani230598",
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({
    extended: true
}));

const dbdrive = "mongodb+srv://ankandb:vnkhSzkCKB5LXe20@cluster0.jmt30c3.mongodb.net/blogapp"

app.use(userAuth.authJwt);
app.use(adminAuth.authJwt);




const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
app.use(userRouter);
app.use("/admin", adminRouter);


const port = process.env.PORT || 2000

mongoose.connect(dbdrive,{useNewurlParser:true,useUnifiedTopology:true}).then(result => {
    app.listen(port,()=>{
        console.log("DataBase Connected");
        console.log(`server is running at port http://localhost:${port}`);
    })
}).catch(err =>{
    console.log(err);
})