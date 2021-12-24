const { Router } = require("express");
const { auth } = require("../controllers");
const { validate } = require("../middlewares");
const { auth: validator } = require("../validator");

const routes = Router();

routes.get("/", auth.welcomeText);

routes.post("/create-church-app-account",validate(validator.churchAccountRegistration), auth.churchAccountRegistration);

routes.post("/login",validate(validator.generalLogin), auth.generalLogin);

routes.post("/validate-user-token", validate(validator.validateUserToken),auth.validateUserToken);

routes.post("/validate-email-account", validate(validator.validateEmailCode),auth.validateEmailCode);

routes.get("/get-all-church-users", validate(validator.getAllChurchUsers), auth.getAllChurchUsers);

routes.get("/get-church-user-by-id",validate(validator.getAChurchUser),auth.getAChurchUser);

routes.put("/update-church-auth-data-by-id",validate(validator.updateChurchAuthData),auth.updateChurchAuthData);

routes.delete("/delete-church-user-by-id",validate(validator.deleteAChurchUser),auth.deleteAChurchUser);


routes.post("/re-send-email-code",validate(validator.reSendEmailCode), auth.reSendEmailCode);

routes.post("/forgotPassword",validate(validator.forgotPassword), auth.forgotPassword);

routes.post("/validate-forgot-password-code",validate(validator.validateForgotPasswordCode), auth.validateForgotPasswordCode);

routes.put("/update-password",validate(validator.updatePassword), auth.updatePassword);

routes.post("/create-church-member-account",validate(validator.churchMembersRegistration), auth.churchMembersRegistration);

routes.get("/get-all-church-admins",validate(validator.getAllChurchAdmins), auth.getAllChurchAdmins);

routes.put("/update-church-member-auth-data-by-id",validate(validator.updateChurchMemberAuthData), auth.updateChurchMemberAuthData);

routes.post("/validate-phone-number-code",validate(validator.validatePhoneNumberCode), auth.validatePhoneNumberCode);

routes.post("/re-send-phone-number-code",validate(validator.reSendPhoneNumberCode), auth.reSendPhoneNumberCode);

routes.put("/update-phone-number",validate(validator.updatePhoneNumber), auth.updatePhoneNumber);

routes.put("/verify-church-member",validate(validator.verifyChurchMember), auth.verifyChurchMember);

routes.put("/update-church-member-count",validate(validator.updateChurchMembersCount), auth.updateChurchMembersCount);

routes.get("/church-members",validate(validator.getChurchAdminMembers), auth.getChurchAdminMembers);

routes.get("/list-of-churches",validate(validator.getListOfChurches), auth.getListOfChurches);

routes.get("/get-unverified-members",validate(validator.getUnverifiedMembers), auth.getUnverifiedMembers);


routes.put("/update-church-name",validate(validator.updateChurchName), auth.updateChurchName);

routes.put("/update-email-address",validate(validator.updateEmailAddress), auth.updateEmailAddress);

routes.put("/update-meeting-days",validate(validator.updateMeetingDays), auth.updateMeetingDays);

module.exports = routes; 
