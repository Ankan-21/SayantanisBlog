const router = require("express").Router();
const AdminController = require("../controllers/AdminController");

router.get("/dashboard", AdminController.adminAuth, AdminController.adminDashboard);
router.get("/", AdminController.showIndex);
router.post("/login", AdminController.login);
router.get("/posts", AdminController.adminAuth, AdminController.posts);
router.get("/comments", AdminController.adminAuth, AdminController.comments);
router.get("/users", AdminController.adminAuth, AdminController.users);
router.get("/activepost/(:id)", AdminController.adminAuth, AdminController.activePost);
router.get("/deactivepost/(:id)", AdminController.adminAuth, AdminController.deActivePost);
router.get("/activecomment/(:id)", AdminController.adminAuth, AdminController.activeComment);
router.get("/deactivecomment/(:id)", AdminController.adminAuth, AdminController.deActiveComment);
router.get("/activeuser/(:id)", AdminController.adminAuth, AdminController.activeUser);
router.get("/deactiveuser/(:id)", AdminController.adminAuth, AdminController.deActiveUser);
router.get("/logout", AdminController.logout);


module.exports = router;