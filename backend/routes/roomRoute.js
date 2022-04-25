const router = require('express').Router();
const {wrapAsync} = require('../util/util');
const roomController = require('../controllers/roomController');
const {createRoom, getRoom, getRandomRoom} = roomController;

router.route('/room/')
    .post(wrapAsync(createRoom));

router.route('/room/random')
    .get(wrapAsync(getRandomRoom));

router.route('/room/:roomId')
    .get(wrapAsync(getRoom));

module.exports = router;