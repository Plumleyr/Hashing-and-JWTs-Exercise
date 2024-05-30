const express = require("/express");
const router = express.Router();
const Message = require("../models/message");
const {ensureLoggedIn} = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try{
        const message = await Message.get(req.params.id);
        if(req.user.username === message.from_user.username || req.user.username === message.to_user.username){
            return res.json({message: message});
        } else {
            throw new ExpressError("Unauthorized user", 400)
        }
    } catch(e) {
        return next(e);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async(req, res, next) => {
    try{
        const {to_username, body} = req.body;
        const newMessage = await Message.create(req.user.username, to_username, body);
        return res.json({message: newMessage})
    } catch(e) {
        return next(e);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async(req, res, next) => {
    try{
        const message = Message.get(req.params.id);
        if(req.user.username === message.to_username){
           const readMsg = await Message.markRead(message.id);
           return res.json({readMsg})
        } else {
            throw new ExpressError("Unauthorized access", 400);
        }
    } catch (e) {
        return next(e);
    }
});
