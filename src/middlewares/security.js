const jwt = require("jsonwebtoken");
const { response } = require("../helpers");
const { auth } = require("../services");


//creates a list of non restricted endpoints
const nonRestrictedEndPoints = [
"/", 
"/create-church-app-account",
"/login",
"/get-all-church-users",
"/validate-user-token",
"/validate-email-account",
"/re-send-email-code",
"/forgotPassword",
"/validate-forgot-password-code",
"/update-password",
"/create-church-member-account",
"/get-all-church-admins",
"/validate-phone-number-code",
"/re-send-phone-number-code",
"/list-of-churches",
"/get-unverified-members",
"/get-church-user-by-id",
];

//creates list of authorized endpoints
const restrictedEndPoints = [
  "/verify-church-member",
  "/update-church-auth-data-by-id",
  "/update-meeting-days",
  "/update-phone-number",
   "/update-email-address",
   "/delete-church-user-by-id", 
   "/update-church-name",
   "/church-members",
   "/update-church-member-count",
   "/verify-church-member",
   "/update-church-member-auth-data-by-id",

]




module.exports = async (req, res, next) => {

  //forwards request without validation if is not restricted
  if (nonRestrictedEndPoints.includes(req.path)) {


    next();
  } else if (restrictedEndPoints.includes(req.path)) {

   
    //validates request if is restricted
    const token = req.headers.authorization;

    const body = { token: token }

    const data = await auth.validateUserToken(body);

    if (data.status === false) {
      return response(res, { status: false, message: "Unauthorized Access" }, 401);
    }

    next();
  }

  else {
    const t = jwt.sign({}, process.env.SECRET)
    console.log(t);
    try {
      jwt.verify(req.headers["x-access-token"], process.env.SECRET);
    } catch (error) {
      return response(res, { status: false, message: "Unauthorized Access!  " }, 401);
    }

    next();
  }







};
