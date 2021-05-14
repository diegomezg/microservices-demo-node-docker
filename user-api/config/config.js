// ===========================
//  Port
// ===========================
process.env.PORT = process.env.PORT || 3000;

// ===========================
// SEED JWT
// ===========================
module.exports.SEED = "B1nn3C4t4lg";

// ===========================
// SEED JWT PASS RECOVER
// ===========================
module.exports.SEED_PASS = "84d$sdf*g";

// ===========================
// TOKEN EXPIRATION TIME (seconds*minutes*hours)
// ===========================
module.exports.TOKEN_EXP_TIME = 60 * 60 * 3;

// ===========================
// TOKEN RECOVER PASS EXPIRATION
// ===========================
module.exports.TOKEN_PASS_EXP_TIME = 60 * 30 * 1;

// ===========================
// Google CLIENT ID
// ===========================
module.exports.CLIENT_ID = ''


// ===========================
// IMAGES PUBLIC ROUTE
// ===========================
module.exports.IMAGES_PATH = 'https://firebasestorage.googleapis.com/v0/b/comter-3e603.appspot.com/o/img%2F';
//module.exports.IMAGES_PATH = `https://localhost:${process.env.PORT}/uploads/images`;

// ===========================
// PROJECT ID FIREBASE
// ===========================
module.exports.PROJECT_ID = 'comter-3e603';

// ===========================
// KEYFILENAME
// ===========================
module.exports.KEY_FILENAME = '../comter-3e603-firebase-adminsdk-u3qpo-566ca51631.json';

// ===========================
// BUCKET
// ===========================
module.exports.BUCKET = "gs://comter-3e603.appspot.com";