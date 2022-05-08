const router = require('express').Router();
const {wrapAsync} = require('../util/util');
const roomController = require('../controllers/roomController');
const {createRoom, getRoom, getRandomRoom, getAllRooms} = roomController;

router.route('/room/')
    .post(wrapAsync(createRoom));

router.route('/room/random')
    .get(wrapAsync(getRandomRoom));

router.route('/room/:roomId')
    .get(wrapAsync(getRoom));

router.route('/rooms')
    .get(wrapAsync(getAllRooms));

module.exports = router;