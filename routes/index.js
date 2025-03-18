var express = require("express");
var router = express.Router();

/* ✅ GET home page */
router.get("/", (req, res) => {
  /* #swagger.tags = ['Home']
     #swagger.description = "Retrieves the homepage of the hotel booking system."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Homepage rendered successfully.",
        content: { "text/html": {} }
     }
  */
  res.render("index", {
    title: "Hotel Booking",
    user: req.user,
  });
});

module.exports = router;


