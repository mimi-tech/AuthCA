const Joi = require("joi");

module.exports = {
  generalLogin: {
    email: Joi.string().required(),
    password: Joi.string().required(),
  },

  churchAccountRegistration: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    username: Joi.string().lowercase({ force: true }).required(),
    profileImageUrl: Joi.string(),
    fullName: Joi.string().required(),
    domination: Joi.string(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    town: Joi.string().required(),
    roadName: Joi.string().required(),
    roadNumber: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    churchName: Joi.string().required(),
    churchAddress: Joi.string().required(),
    foundedDate: Joi.string().required(),
    description: Joi.string().required(),
    churchMotto: Joi.string().required(),
    meetings: Joi.array().items(
      Joi.object({
        meetingDay: Joi.string().required(),
        meetingTitle: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        startTime2: Joi.string(),
        endTime2: Joi.string()
      })
    ),
    videoIntroUrl: Joi.string(),
    unverifiedMembersCount: Joi.number().required(),
    membersCount: Joi.number().required(),

    

  },


  churchMembersRegistration: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    username: Joi.string().lowercase({ force: true }).required(),
    churchesJoined: Joi.string().required(),
    fullName: Joi.string().required(),
    domination: Joi.string().required(),
    DOB: Joi.string(),
    gender: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    
    
    
    

  },

  getAChurchUser:{
    authId: Joi.string().uuid().required(),
  },


  getAllChurchUsers:{
    page: Joi.number().required(),
  },

  getAllChurchAdmins:{
    page: Joi.number().required(),
  },

 

  updateChurchAuthData:{
    authId: Joi.string().uuid().required(),
    username: Joi.string().lowercase({ force: true }).required(),
    profileImageUrl: Joi.string(),
    fullName: Joi.string().required(),
    domination: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    town: Joi.string().required(),
    roadName: Joi.string().required(),
    roadNumber: Joi.string().required(),
    churchAddress: Joi.string().required(),
    foundedDate: Joi.string().required(),
    description: Joi.string().required(),
    churchMotto: Joi.string().required(),
    videoIntoUrl: Joi.string().required(),
  },


  updateChurchMemberAuthData:{
    authId: Joi.string().uuid().required(),
    username: Joi.string().lowercase({ force: true }).required(),
    fullName: Joi.string().required(),
    domination: Joi.string().required(),
    DOB: Joi.string(),
    gender: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
  },

  deleteAChurchUser:{
    authId: Joi.string().uuid().required(),
  },
  
  validateUserToken: {
    token: Joi.string().required(),
  },

  validateEmailCode:{ 
    authId: Joi.string().uuid().required(),
    emailCode: Joi.number().required(),
  },

  validatePhoneNumberCode:{ 
    authId: Joi.string().uuid().required(),
    phoneNumberCode: Joi.number().required(),
  },

  reSendEmailCode:{ 
    email: Joi.string().required(),
  },

  forgotPassword:{ 
    email: Joi.string().required(),
  },

  validateForgotPasswordCode:{ 
    email: Joi.string().required(),
    emailCode: Joi.number().required(),
  },

  updatePassword: {
    email: Joi.string().required(),
    password: Joi.string().required(),
  },

  reSendPhoneNumberCode:{ 
    phoneNumber: Joi.string().required(),
  },

  updatePhoneNumber: { 
    phoneNumber: Joi.string().required(),
    authId: Joi.string().uuid().required(),
  },


  verifyChurchMember:{
    authId: Joi.string().uuid().required(),
  },

  updateChurchMembersCount:{
    churchId: Joi.string().required(),
  },

  getChurchAdminMembers:{
    page: Joi.number().required(),
    authId: Joi.string().required(),
  },

  getListOfChurches:{
    page: Joi.number().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),


  },

  getUnverifiedMembers:{
    page: Joi.number().required(),
    authId: Joi.string().required(),
  },

  updateChurchName:{
    churchName: Joi.string().required(),
    authId: Joi.string().uuid().required(),

  },
  
  updateEmailAddress:{
    email: Joi.string().required(),
    authId: Joi.string().uuid().required(),

  },

  updateMeetingDays:{
    meetings: Joi.array().items(
      Joi.object({
        meetingDay: Joi.string().required(),
        meetingTitle: Joi.string().required(),
        startTime: Joi.string().required(),
        endTime: Joi.string().required(),
        startTime2: Joi.string(),
        endTime2: Joi.string()
      })
    ),
    authId: Joi.string().uuid().required(),
    churchId: Joi.string().uuid().required(),
  }
}