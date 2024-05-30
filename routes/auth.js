const jwt = require("jsonwebtoken")
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config")
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

request.post("/login", async (req, res, next) => {
    try{
        const {username, password } = req.body;
        if(await User.authenticate(username, password)){
            let token = jwt.sign({ username }, SECRET_KEY);
            await User.updateLoginTimestamp(username);
            return res.json({ token });
        } else {
            throw new ExpressError("Invalid username/password", 400);
        }
    } catch (e) {
       return next(e);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
request.post("/register", async (req, res, next) => {
    try{
       const {username, password, first_name, last_name, phone} = req.body;
       const newUser = await User.register(username, password, first_name, last_name, phone);
       let token = jwt.sign({username: newUser.username}, SECRET_KEY);
       await User.updateLoginTimestamp(newUser.username);
       return res.json({token});
    } catch (e) {
        return next(e);
    }
});

module.exports = router;