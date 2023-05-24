const userRouter = require("express").Router();
const user = require('../controllers/user');
const auth=require("../auth/auth")

const upl=require("../commonFunction/multer")



/**
 * @swagger
 * /api/signUp:
 *   post:
 *     summary: User sign up
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Signup success
 *       '400':
 *         description: Missing required fields
 *       '409':
 *         description: Email already exists
 *       '500':
 *         description: Internal server error
 *       '501':
 *         description: Something went wrong
 */

userRouter.post('/signUp',user.signUp)
// userRouter.get('/signup',user.signupGet)
userRouter.post('/otpVerify',user.otpVerify)
userRouter.get('/getOne',user.getOne)
// userRouter.post('/update',user.update)
userRouter.get('/getAll',user.getAll)
userRouter.get('/logIn',user.logIn)
userRouter.patch('/forgot',user.forgot)
userRouter.get('/resendOtp',user.resendOtp)
userRouter.patch('/reset',user.reset)
userRouter.patch('/newPassword',user.newPassword)
userRouter.put('/editProfile',auth.verifyToken,user.editProfile)
userRouter.post('/upload', upl.upload.single('image'), user.image);
userRouter.post('/uploadOnCloud', user.uploadOnCloud);
userRouter.get('/twoFacAuth', user.twoFacAuth);
userRouter.get('/twoFacAuthVerify', user.twoFacAuthVerify);
userRouter.get('/page', user.page);
userRouter.get('/aggPage', user.aggPage);
userRouter.get('/verifyLink/:email', user.verifyLink);
userRouter.get('/staticList',user.staticList)
userRouter.put('/staticEdit',user.staticEdit)
userRouter.get('/searchBy',user.searchBy)
userRouter.get('/userList',user.userList)




module.exports = userRouter;


