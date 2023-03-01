const router = require("express").Router();
const UserController = require("../controllers/UserContoller");
const verifySignup = require("../middlewares/verifySignup");
const path = require("path");
const multer = require("multer");


// Setup file storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + 'blog' + path.extname(file.originalname));
    }
})

const maxSize = 2 * 1024 * 1024; // for 1MB

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
    limits: {
        fileSize: maxSize
    }
});

router.get("/", UserController.index);
router.get("/register", UserController.register);
router.post("/register", upload.single('image'), [verifySignup.checkDuplicateEntries], UserController.postRegister);
router.get("/login", UserController.viewLogin);
router.get("/post", UserController.userAuth, UserController.post);
router.post("/post", upload.single('image'), UserController.addPost);
router.get("/viewpost/(:slug)", UserController.viewPost);
router.post("/comment", UserController.addComment);
router.get("/about", UserController.about);
router.get("/contact", UserController.contact);
router.post("/login", UserController.login);
router.get("/logout", UserController.logout);

module.exports = router;