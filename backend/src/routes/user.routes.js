const express = require("express");
const { createAccount } = require("../controllers/user.controller");

const router = express.Router();

router.post("/", createAccount);

module.exports = router;
