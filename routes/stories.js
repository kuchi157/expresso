const express = require("express");
const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Story = require("../models/Story");
const Comment = require("../models/Comment");
const User = require("../models/User");

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.post("/:id", ensureAuth, async (req, res) => {
  try {
    story = await Story.findById(req.params.id);

    commentuser = await User.findById(req.user.id);

    req.body.user = commentuser;
    if (story.user == req.user.id) {
      req.body.commentusername = "Expresser";
    } else {
      req.body.commentusername = commentuser.displayName;
    }

    req.body.story = req.params.id;

    await Comment.create(req.body);
    res.redirect("/stories/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    if (stories.length < 7) {
      check = true;
    } else {
      check = false;
    }

    res.render("stories/index", {
      stories,
      check,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();

    let comment = await Comment.find({ story: story._id, reported: false })
      .populate("story")
      .lean();

    if (!story) {
      return res.render("error/404");
    }

    data = `/stories/${req.params.id}`;
    res.render("stories/show", {
      story,
      comment,
      data,
    });
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});
router.get("/comment/:id", ensureAuth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    let story = await Story.findById(comment.story);

    if (!comment) {
      return res.render("error/404");
    }

    Comment.updateOne(
      {
        _id: req.params.id,
      },
      { reported: true, reporteduser: req.user.id },
      function (err, doc) {
        if (err) {
          res.send(500, { error: err });
        }
      }
    );

    res.render("successreport");
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

router.delete("/comment/:id", ensureAuth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id).lean();
    let story = await Story.findById(comment.story).lean();

    if (!comment) {
      return res.render("error/404");
    }

    if (comment.user != req.user.id) {
      res.redirect("/stories/" + story._id);
    } else {
      await Comment.remove({ _id: req.params.id });
      res.redirect("/stories/" + story._id);
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
module.exports = router;
