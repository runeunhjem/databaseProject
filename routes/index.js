const express = require("express");
const router = express.Router();

/* ✅ GET home page */
router.get("/", (req, res) => {
  /* #swagger.tags = ['Home']
     #swagger.description = "Retrieves the homepage of the hotel booking system."
     #swagger.path = "/"
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

