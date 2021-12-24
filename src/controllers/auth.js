const { auth } = require("../services");
const { response } = require("../helpers");



const welcomeText = async (req, res) => {
    const data = await auth.welcomeText(req.form);
    return response(res, data);
  };

  const churchAccountRegistration = async (req, res) => {
    const data = await auth.churchAccountRegistration(req.form);
    return response(res, data);
  };

  const generalLogin = async (req, res) => {
    const data = await auth.generalLogin(req.form);
    return response(res, data);
  };

  
  const validateUserToken = async (req, res) => {
    const data = await auth.validateUserToken(req.form);
    return response(res, data);
  };


  const getAllChurchUsers = async (req, res) => {
    const data = await auth.getAllChurchUsers(req.form);
    return response(res, data);
  };

  const getAChurchUser = async (req, res) => {
    const data = await auth.getAChurchUser(req.form);
    return response(res, data);
  };

  const updateChurchAuthData = async (req, res) => {
    const data = await auth.updateChurchAuthData(req.form);
    return response(res, data);
  };

 

  const deleteAChurchUser = async (req, res) => {
    const data = await auth.deleteAChurchUser(req.form);
    return response(res, data);
  };

  const validateEmailCode = async (req, res) => {
    const data = await auth.validateEmailCode(req.form);
    return response(res, data);
  };

  const reSendEmailCode = async (req, res) => {
    const data = await auth.reSendEmailCode(req.form);
    return response(res, data);
  };

  const forgotPassword = async (req, res) => {
    const data = await auth.forgotPassword(req.form);
    return response(res, data);
  };
  const validateForgotPasswordCode = async (req, res) => {
    const data = await auth.validateForgotPasswordCode(req.form);
    return response(res, data);
  };

  const updatePassword = async (req, res) => {
    const data = await auth.updatePassword(req.form);
    return response(res, data);
  };

  const churchMembersRegistration = async (req, res) => {
    const data = await auth.churchMembersRegistration(req.form);
    return response(res, data);
  };

  const getAllChurchAdmins = async (req, res) => {
    const data = await auth.getAllChurchAdmins(req.form);
    return response(res, data);
  };

  const updateChurchMemberAuthData = async (req, res) => {
    const data = await auth.updateChurchMemberAuthData(req.form);
    return response(res, data);
  };
  const validatePhoneNumberCode= async (req, res) => {
    const data = await auth.validatePhoneNumberCode(req.form);
    return response(res, data);
  };

  const reSendPhoneNumberCode= async (req, res) => {
    const data = await auth.reSendPhoneNumberCode(req.form);
    return response(res, data);
  };

  const updatePhoneNumber= async (req, res) => {
    const data = await auth.updatePhoneNumber(req.form);
    return response(res, data);
  };

  const verifyChurchMember = async (req, res) => {
    const data = await auth.verifyChurchMember(req.form);
    return response(res, data);
  };

  const updateChurchMembersCount = async (req, res) => {
    const data = await auth.updateChurchMembersCount(req.form);
    return response(res, data);
  };

  const getChurchAdminMembers = async (req, res) => {
    const data = await auth.getChurchAdminMembers(req.form);
    return response(res, data);
  };

  const getListOfChurches = async (req, res) => {
    const data = await auth.getListOfChurches(req.form);
    return response(res, data);
  };

  const getUnverifiedMembers = async (req, res) => {
    const data = await auth.getUnverifiedMembers(req.form);
    return response(res, data);
  };

  const updateChurchName = async (req, res) => {
    const data = await auth.updateChurchName(req.form);
    return response(res, data);
  };

  const updateEmailAddress = async (req, res) => {
    const data = await auth.updateEmailAddress(req.form);
    return response(res, data);
  };

  const updateMeetingDays = async (req, res) => {
    const data = await auth.updateMeetingDays(req.form);
    return response(res, data);
  };


  module.exports = {
    welcomeText,
    generalLogin,
    validateUserToken,
    churchAccountRegistration,
    getAllChurchUsers,
    getAChurchUser,
    updateChurchAuthData,
    deleteAChurchUser,
    validateEmailCode,
    reSendEmailCode,
    forgotPassword,
    validateForgotPasswordCode,
    updatePassword,
    churchMembersRegistration,
    getAllChurchAdmins,
    updateChurchMemberAuthData,
    validatePhoneNumberCode,
    reSendPhoneNumberCode,
    updatePhoneNumber,
    verifyChurchMember,
    updateChurchMembersCount,
    getChurchAdminMembers,
    getListOfChurches,
    getUnverifiedMembers,
    updateChurchName,
    updateEmailAddress,
    updateMeetingDays
}