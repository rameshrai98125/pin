var express = require("express");
var router = express.Router();
const upload = require("./multer");
const userModel = require("./users");
const postModel = require("./posts");
const localStrategy = require("passport-local");
const passport = require("passport");
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});
router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

// add page
router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("add", { user, nav: true });
});

// profile page
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("profile", { user, nav: true });
});
// show all posts page
router.get("/show/posts", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("show", { user, nav: true });
});
// show all posts page
router.get("/show/posts/:carid", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("singlePost", { user, nav: true });
});
//  page
router.post(
  "/createpost",
  isLoggedIn,
  upload.single("postImage"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
  }
);

// file upload
router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

// post
router.post("/register", function (req, res) {
  var userData = new userModel({
    username: req.body.username,
    email: req.body.email,
  });
  userModel.register(userData, req.body.password).then(function (registeruser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

//login

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

//logout

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// isLoggedIn middleware

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
