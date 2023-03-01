const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const CommentModel = require("../models/CommentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cookie } = require("express/lib/response");


exports.userAuth = (req, res, next) => {
    if (req.user) {
        console.log(req.user);
        next();
    } else {
        console.log(req.user);
        res.redirect("login");
    }
}
//this part needs to be explained
exports.index = (req, res) => {
    const pager = req.query.page ? req.query.page : 1
    const options = {
        populate: "user",
        page: pager,
        limit: 3,
        sort: '-createdAt',
        collation: {
            locale: 'en',
        },
    };
    PostModel.paginate({}, options).then(data => {
        if (data) {
            console.log(data.docs);
            console.log(data);
            PostModel.find().populate("user").sort('-createdAt').limit(5).exec((err, result) => {
                if (!err) {
                    CommentModel.find().sort('-createdAt').limit(5).then(comment => {
                        res.render("index", {
                            title: "Sayantani's Blog | Home",
                            data: req.user,
                            displayData: data,
                            pager: pager,
                            result: result,
                            comment: comment
                        })
                    }).catch(err => {
                        console.log(err);
                    })
                } else {
                    console.log("Something went wrong...");
                }
            })

        } else {
            console.log("Something went wrong...");
        }
    }).catch(err => {
        console.log(err);
    })
}


exports.register = (req, res) => {
    res.render("register", {
        title: "Sayantani's Blog | Register",
        message: req.flash("message"),
        alert: req.flash("alert"),
        data: req.user
    })
}

exports.postRegister = (req, res) => {
    UserModel({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        userName: req.body.username,
        contact: req.body.contact,
        email: req.body.email,
        profilePicture: req.file.filename,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }).save().then(result => {
        console.log("User Added...");
        req.flash("message", "Successfully Registered");
        req.flash("alert", "success-msg");
        res.redirect("register");
    }).catch(err => {
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
        console.log("User Not Added...");
        res.redirect("register");
    })
}



exports.viewLogin = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    res.render("login", {
        title: "Sayantani's Blog | Login",
        message: req.flash("message"),
        alert: req.flash("alert"),
        displayData: loginData,
        data: req.user
    })
}

exports.login = (req, res, next) => {
    UserModel.findOne({
        email: req.body.email
    }, (err, data) => {
        if (data) {
            if (data.status && data.isAdmin === false) {
                const hashPassword = data.password;
                if (bcrypt.compareSync(req.body.password, hashPassword)) {
                    const token = jwt.sign({
                        id: data._id,
                        username: data.userName,
                        email: data.email
                    }, "sayantani-23051998@", { expiresIn: '5h' });
                    res.cookie("userToken", token);
                    if (req.body.rememberme) {
                        res.cookie('email', req.body.email)
                        res.cookie('password', req.body.password)
                    }
                    console.log(data);
                    res.redirect("post");
                } else {
                   
                    req.flash("message", "Invalid Password");
                    req.flash("alert", "error-msg");
                    res.redirect("login");
                }
            } else {
                // console.log("Account Is Not Verified");
                req.flash("message", "Account Is Not Verified");
                req.flash("alert", "error-msg");
                res.redirect("login");
            }
        } else {
            // console.log("Invalid Email...");
            // res.redirect("/");
            req.flash("message", "Invalid Email");
            req.flash("alert", "error-msg");
            res.redirect("login");
        }
    })
}

exports.logout = (req, res) => {
    res.clearCookie("userToken");
    res.redirect("login")
}

exports.post = (req, res) => {
    res.render("post", {
        title: "Sayantani's Blog | Post",
        message: req.flash("message"),
        alert: req.flash("alert"),
        data: req.user
    })
}

exports.addPost = (req, res) => {
    PostModel.findOne({
        slug: req.body.title.trim().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_').toLowerCase()
    }).exec((err, data) => {
        if (data) {
            req.flash("message", "Post Title Already Exists");
            req.flash("alert", "error-msg");
            console.log("Post Title Already Exists", err);
            res.redirect("post");
        } else {
            PostModel({
                title: req.body.title,
                subTitle: req.body.subtitle,
                postText: req.body.post,
                image: req.file.filename,
                slug: req.body.title.trim().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, "_").toLowerCase(),
                user: req.user.id
            }).save().then(result => {
                console.log("Post Added...");
                req.flash("message", "Post Added");
                req.flash("alert", "success-msg");
                res.redirect("post");
            }).catch(err => {
                req.flash("message", "Something Went Wrong!!!");
                req.flash("alert", "error-msg");
                console.log("Post Not Added...", err);
                res.redirect("post");
            })
        }
    })
}

exports.viewPost = (req, res) => {
    PostModel.find({ slug: req.params.slug }).populate("user").then(result => {
        console.log(result);
        CommentModel.find().populate("post").exec((err, data) => {
            if (!err) {
                console.log(data);
                res.render("viewpost", {
                    title: "Sayantani's Blog | View Post",
                    displayData: result,
                    data: req.user,
                    message: req.flash("message"),
                    alert: req.flash("alert"),
                    cmnt: data
                })
            } else {
                console.log(err);
            }
        })
    }).catch(err => {
        console.log(err);
    })
}
//this part needs to be explained
exports.addComment = (req, res) => {
    CommentModel({
        post: req.body.post,
        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment
    }).save().then(result => {
        console.log("Comment Added...");
        req.flash("message", "Comment Added Successfully");
        req.flash("alert", "success-msg");
        res.redirect(`viewpost/${req.body.slug}`);
    }).catch(err => {
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
        console.log("Comment Not Added...", err);
        res.redirect(`viewpost/${req.body.slug}`);
    })
}

exports.about = (req, res) => {
    res.render("about", {
        title: "Sayantani's Blog | About",
        data: req.user
    })
}

exports.contact = (req, res) => {
    res.render("contact", {
        title: "Sayantani's Blog | Contact",
        data: req.user
    })
}