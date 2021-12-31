/* eslint-disable no-unreachable */
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Op: { or, and },
} = require("sequelize");

const { constants } = require("../configs");
const { ChurchAppUsers } = require("../models");
const { generalHelperFunctions } = require("../helpers");
const { EmailService } = require("../helpers/emailService");

const { SendOtp } = require("../helpers/smsService");
const phoneCode = 123456;

/**
 * Display welcome text
 * @param {Object} params  no params.
 * @returns {Promise<Object>} Contains status, and returns message
 */
const welcomeText = async () => {
  try {
    return {
      status: true,
      message: "welcome to church app authentication service",
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("WELCOME TEXT"),
    };
  }
};

/**
 * login any in app user
 * @param {Object} params  contains email, password and accountTypes.
 * @returns {Promise<Object>} Contains status, and returns message
 */
const generalLogin = async (params) => {
  try {
    const { email, password } = params;
    //check if user exit via user email.
    const userExist = await ChurchAppUsers.findOne({ email: email });
    if (!userExist) {
      return {
        status: false,
        message: "incorrect credentials!",
      };
    }
    //extract and store existing encrypted user password
    const existingUserPassword = userExist.password;

    //validate incoming user password with existing password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUserPassword
    );

    if (!isPasswordCorrect) {
      return {
        status: false,
        message: "incorrect credentials",
      };
    }

    // eslint-disable-next-line no-unused-vars
    //const { password:epassword, emailCode,levelOneAccess,levelTwoAccess,levelThreeAccess, ...publicUserData } = userExist.dataValues;

    //const publicUserData = await generalHelperFunctions.formatRegistrationResult(userExist.dataValues.accountType, userExist.dataValues);

    if (userExist.isEmailVerified === false) {
      return {
        status: false,
        message: "verify user email to login",
      };
    }

    //check if phone number is verified

    if (userExist.isPhoneNumberVerified === false) {
      return {
        status: false,
        message: "verify user phone number to login",
      };
    }

    const { accountType, email: _email, username, id } = userExist;

    const serializeUserDetails = { accountType, _email, username, id };

    const accessToken = jwt.sign(serializeUserDetails, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return {
      status: true,
      message: "succes",
      token: accessToken,
      data: userExist,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("LOGIN"),
    };
  }
};

/**
 * validates user token
 * @param {Object} params  contains email, password and roles.
 * @returns {Promise<Object>} Contains status, and returns message
 */
const validateUserToken = async (params) => {
  try {
    const { token } = params;

    let loggedInUser;

    //verify jwt token
    const check = jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log(err);
        return {
          status: false,
        };
      }

      loggedInUser = user;

      return {
        status: true,
      };
    });

    if (!check.status) {
      return {
        status: false,
        message: "Invalid Token",
      };
    }

    //fetch loggedinuser details
    const _user = await ChurchAppUsers.findOne({ email: loggedInUser._email });

    //const { accountType } = _user;

    //const userDetails = await generalHelperFunctions.formatRegistrationResult(accountType, _user.dataValues);

    return {
      status: true,
      message: "succes",
      data: _user,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("TOKEN VERIFICATION"),
    };
  }
};

/**
 * for creating account for a church admin
 * @param {Object} params email, password, username, profileImageUrl.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const churchAccountRegistration = async (params) => {
  try {
    const {
      email,
      password,
      profileImageUrl,
      username,
      domination,
      country,
      state,
      city,
      town,
      roadName,
      roadNumber,
      phoneNumber,
      fullName,
      churchName,
      churchAddress,
      foundedDate,
      description,
      churchMotto,
      meetings,
      videoIntroUrl,
      coverImageUrl
    } = params;

    //set acount type to personal account
    const accountType = "churchAdmin";
    //check if  account is already registered
    const churchAccount = await ChurchAppUsers.findOne({
      or: [
        { email: email },
        { username: username },
        { churchName: churchName },
      ],
    });

    if (churchAccount) {
      return {
        status: false,
        message: "account already exist",
      };
    }

    //check if phone number is already registered

    const phoneNumberInUse = await ChurchAppUsers.findOne({
      phoneNumber: phoneNumber,
    });

    if (phoneNumberInUse) {
      return {
        status: false,
        message: "This phone number is in use",
      };
    }

    //encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    //generate email code
    const emailCode = generalHelperFunctions.generateEmailCode();
    console.log(emailCode);

    // generate phone number code

    const phoneNumberCode = generalHelperFunctions.generatePhoneNumberCode();
    console.log("phone number code: " + phoneNumberCode);
    const message = "Otp number" + phoneNumberCode;

    //send otp to user phone number
    await SendOtp.sendOtpToPhone(phoneNumber, message);
    const id = uuid();
    //create account
    const newPersonalAccount = await ChurchAppUsers.create({
      id: id,
      email: email,
      password: hashedPassword,
      accountType: accountType,
      profileImageUrl: profileImageUrl,
      username: username,
      emailCode: emailCode,
      domination: domination,
      country: country,
      state: state,
      city: city,
      town: town,
      roadName: roadName,
      roadNumber: roadNumber,
      phoneNumber: phoneNumber,
      phoneNumberCode: phoneCode, //phoneNumberCode,
      fullName: fullName,
      churchName: churchName,
      churchAddress: churchAddress,
      foundedDate: foundedDate,
      description: description,
      churchMotto: churchMotto,
      meetings: meetings,
      videoIntroUrl: videoIntroUrl,
      accountType: accountType,
      churchId: id,
      membersCount: 0,
      unverifiedMembersCount: 0,
      coverImageUrl:coverImageUrl
    });

    //send emailCode to user email
    const { status: EmailStatusCode } =
      await EmailService.sendEmailVerificationCode({
        user: email,
        code: emailCode,
      });

    //format registration details
    //const userDetails = await generalHelperFunctions.formatRegistrationResult(accountType, newPersonalAccount.dataValues);

    return {
      status: true,
      EmailStatusCode: EmailStatusCode,
      message: "Church app account created successfully",
      data: newPersonalAccount,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("CHURCH APP ACCOUNT"),
    };
  }
};

/**
 * for creating account for a church members
 * @param {Object} params email, password, username, profileImageUrl.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const churchMembersRegistration = async (params) => {
  try {
    const {
      email,
      password,
      username,
      domination,
      DOB,
      gender,
      country,
      state,
      city,
      phoneNumber,
      fullName,
      churchesJoined,
      coverImageUrl
    } = params;

    //set acount type to personal account
    const accountType = "churchMember";
    //check if  account is already registered
    const isEmailExisting = await ChurchAppUsers.findOne({
      email: email,
    });

    if (isEmailExisting) {
      return {
        status: false,
        message: "Email already exist",
      };
    }

    //check if username is already registered
    const isUsernameExisting = await ChurchAppUsers.findOne({
      username: username,
    });

    if (isUsernameExisting) {
      return {
        status: false,
        message: "Username already exist",
      };
    }

    //check if phone number is already registered

    const phoneNumberInUse = await ChurchAppUsers.findOne({
      phoneNumber: phoneNumber,
    });

    if (phoneNumberInUse) {
      return {
        status: false,
        message: "This phone number is in use",
      };
    }

    //check if church Id is existing

    const isChurchExisting = await ChurchAppUsers.findOne({
      churchName: churchesJoined,
    });

    if (!isChurchExisting) {
      return {
        status: false,
        message: "This church is not existing",
      };
    }

    //encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    //generate email code
    const emailCode = generalHelperFunctions.generateEmailCode();
    console.log(emailCode);

    // generate phone number code

    const phoneNumberCode = generalHelperFunctions.generatePhoneNumberCode();
    console.log("phone number code: " + phoneNumberCode);
    const message = "Otp number" + phoneNumberCode;

    //send otp to user phone number
    await SendOtp.sendOtpToPhone(phoneNumber, message);

    //create account
    const newMemberAccount = await ChurchAppUsers.create({
      id: uuid(),
      email: email,
      password: hashedPassword,
      accountType: accountType,
      username: username,
      emailCode: emailCode,
      domination: domination,
      country: country,
      state: state,
      city: city,
      DOB: DOB,
      gender: gender,
      phoneNumber: phoneNumber,
      phoneNumberCode: phoneCode, //phoneNumberCode,
      fullName: fullName,
      accountType: accountType,
      churchesJoined: churchesJoined,
      churchId: isChurchExisting.id,
      churchJoinedId: isChurchExisting._id,
      memberVerified: false,
      coverImageUrl:coverImageUrl
    });

    //get the church the user have joined and update there unverified members account

    let existingCount = 0;
    let count;
    existingCount = isChurchExisting.unverifiedMembersCount;
    count = existingCount + 1;
    const updatingCount = await ChurchAppUsers.updateOne(
      { churchName: churchesJoined },
      { unverifiedMembersCount: count }
    );

    if (!updatingCount) {
      return {
        status: false,
        message:
          "Error occured while updating church unverified Members Count ",
      };
    }

    //send emailCode to user email
    const { status: EmailStatusCode } =
      await EmailService.sendEmailVerificationCode({
        user: email,
        code: emailCode,
      });

    //format registration details
    //const userDetails = await generalHelperFunctions.formatRegistrationResult(accountType, newMemberAccount);

    return {
      status: true,
      EmailStatusCode: EmailStatusCode,
      message: "Account created successfully",
      data: newMemberAccount,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("CHURCH APP MEMBERS ACCOUNT"),
    };
  }
};

/**
 * for fetching all church members
 * @param {Object} params  No params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const getAllChurchUsers = async (params) => {
  try {
    const { page } = params;

    const pageCount = 15;

    const allChurchUsers = await ChurchAppUsers.find({
      accountType: "churchMember",
    })
      .limit(pageCount)
      .skip(pageCount * (page - 1))
      .exec();

    return {
      status: true,
      data: allChurchUsers,
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("ALL CHURCH USERS"),
    };
  }
};

/**
 * for fetching all church Admins
 * @param {Object} params  No params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const getAllChurchAdmins = async (params) => {
  try {
    const { page } = params;

    const pageCount = 15;

    const allChurchUsers = await ChurchAppUsers.find({
      accountType: "churchAdmin",
    })
      .limit(pageCount)
      .skip(pageCount * (page - 1))
      .exec();

    return {
      status: true,
      data: allChurchUsers,
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("ALL CHURCH Admins"),
    };
  }
};

/**
 * for fetching a user from sparksUsers collection
 * @param {Object} params  user id {authId} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const getAChurchUser = async (params) => {
  const { authId } = params;
  try {
    const churchUser = await ChurchAppUsers.findOne({ id: authId });

    if (!churchUser) {
      return {
        status: false,
        message: "User not found",
      };
    }

    //format  details
    //const userDetails = await generalHelperFunctions.formatRegistrationResult(churchUser.accountType, churchUser);

    return {
      status: true,
      data: churchUser,
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("CHURCH ACCOUNT GETTING A USER"),
    };
  }
};

/**
 * for updating church account details
 * @param {Object} params  user id {authId} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateChurchAuthData = async (params) => {
  try {
    const {
      authId,
      username,
      profileImageUrl,
      domination,
      country,
      state,
      city,
      town,
      roadName,
      roadNumber,
      fullName,

      churchAddress,
      foundedDate,
      description,
      churchMotto,
      videoIntroUrl,
      coverImageUrl
    } = params;
    console.log(videoIntroUrl);
    //check if auth id exist
    const checkIfAccountExist = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!checkIfAccountExist) {
      return {
        status: false,
        message: "invalid auth Id",
      };
    }

    if (username) {
      //check if the username still belongs to the user
      const isYourUsername = await ChurchAppUsers.find({
        id: authId,
        username: username,
      });

      if (isYourUsername) {
        return {
          status: false,
          message: "username belongs to you",
        };
      }

      //check if username already exist
      const checkIfUsernameAlreadyExist = await ChurchAppUsers.findOne({
        username: username,
      });

      if (checkIfUsernameAlreadyExist) {
        return {
          status: false,
          message: "username already taken",
        };
      }

      const filter = { id: authId };
      const update = {
        username: username,
        profileImageUrl: profileImageUrl,
        domination: domination,
        country: country,
        state: state,
        city: city,
        town: town,
        roadName: roadName,
        roadNumber: roadNumber,
        fullName: fullName,
        churchAddress: churchAddress,
        foundedDate: foundedDate,
        description: description,
        churchMotto: churchMotto,
        videoIntroUrl: videoIntroUrl,
        coverImageUrl:coverImageUrl
      };

      await ChurchAppUsers.findOneAndUpdate(filter, update, {
        new: true,
      });
    }

    return {
      status: true,
      message: "church account updated successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("UPDATE CHURCH APP AUTH DATA"),
    };
  }
};

/**
 * for updating church member account details
 * @param {Object} params  user id {authId} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateChurchMemberAuthData = async (params) => {
  try {
    const {
      authId,
      username,
      domination,
      DOB,
      gender,
      country,
      state,
      city,
      fullName,
      coverImageUrl,
    } = params;

    //check if auth id exist
    const checkIfAccountExist = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!checkIfAccountExist) {
      return {
        status: false,
        message: "invalid auth Id",
      };
    }

    if (username) {
      //check if the username still belongs to the user
      const isYourUsername = await ChurchAppUsers.findOne({
        [and]: [{ id: authId }, { username: username }],
      });

      if (!isYourUsername) {
        //check if username already exist
        const checkIfUsernameAlreadyExist = await ChurchAppUsers.findOne({
          username: username,
        });

        if (checkIfUsernameAlreadyExist) {
          return {
            status: false,
            message: "username already taken",
          };
        }
      }

      const filter = { id: authId };
      const update = {
        username: username,
        domination: domination,
        country: country,
        state: state,
        city: city,
        fullName: fullName,
        DOB: DOB,
        gender: gender,
        coverImageUrl,
      };
      await ChurchAppUsers.findOneAndUpdate(filter, update, {
        new: true,
      });
    }

    return {
      status: true,
      message: "church member account updated successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("UPDATE CHURCH APP MEMBER AUTH DATA"),
    };
  }
};

/**
 * for deleting an account either church admin or member using the users ID
 * @param {Object} params  user id {authId} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const deleteAChurchUser = async (params) => {
  try {
    const { authId } = params;

    //check if the user is already existing
    const churchUser = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!churchUser) {
      return {
        status: false,
        message: "User does not exist",
      };
    }

    //go ahead and delete the account
    await ChurchAppUsers.deleteOne({
      id: authId,
    });

    return {
      status: true,
      message: "account deleted successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("DELETING CHURCH APP ACCOUNT"),
    };
  }
};

/**
 * for validate sent email code
 * @param {Object} params  user id {authId,emailcode} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const validateEmailCode = async (params) => {
  try {
    const { authId, emailCode } = params;

    //check if authId is valid
    const churchUser = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!churchUser) {
      return {
        status: false,
        message: "invalid authId",
      };
    }

    //check if user email code is valid
    const isEmailCodeValid = await ChurchAppUsers.findOne({
      [and]: [{ id: authId }, { emailCode: emailCode }],
    });

    if (!isEmailCodeValid) {
      return {
        status: false,
        message: "invalid email code",
      };
    }

    //const publicUserData = await generalHelperFunctions.formatRegistrationResult(isEmailCodeValid.dataValues.accountType, isEmailCodeValid.dataValues);

    //set is email verified to true
    const filter = { id: authId };
    const update = { isEmailVerified: true };
    await ChurchAppUsers.findOneAndUpdate(filter, update, {
      new: true,
    });

    const { accountType, email: _email, username, id } = churchUser;

    const serializeUserDetails = { accountType, _email, username, id };

    //authenticate the user if email code is valid
    jwt.sign(serializeUserDetails, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    //fetch updated details
    const churchAppUserDetails = await ChurchAppUsers.findOne({
      id: authId,
    });

    //const publicUserDatum = await generalHelperFunctions.formatRegistrationResult(churchAppUserDetails.dataValues.accountType, churchAppUserDetails.dataValues);

    return {
      status: true,
      message: "Email verification successful",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("EMAIL VERIFICATION"),
    };
  }
};

/**
 * for validate sent email code
 * @param {Object} params  user id {authId,emailcode} params needed.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const validatePhoneNumberCode = async (params) => {
  try {
    const { authId, phoneNumberCode } = params;

    //check if authId is valid
    const churchUser = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!churchUser) {
      return {
        status: false,
        message: "invalid authId",
      };
    }

    //check if user phone number code is valid
    const isPhoneNumberCodeValid = await ChurchAppUsers.findOne({
      [and]: [{ id: authId }, { phoneNumberCode: phoneNumberCode }],
    });

    if (!isPhoneNumberCodeValid) {
      return {
        status: false,
        message: "invalid phone number code",
      };
    }

    //check if phone number has already been confirmed
    // if (isPhoneNumberCodeValid.dataValues.isPhoneNumberVerified === true) {
    //     return {
    //         status: false,
    //         message: "Phone number is already verified",
    //     };
    // }

    //set is phone number verified to true

    const filter = { id: authId };
    const update = { isPhoneNumberVerified: true };
    await ChurchAppUsers.findOneAndUpdate(filter, update, {
      new: true,
    });

    //fetch updated details
    const churchAppUserDetails = await ChurchAppUsers.findOne({
      id: authId,
    });

    //const publicUserDatum = await generalHelperFunctions.formatRegistrationResult(churchAppUserDetails.dataValues.accountType, churchAppUserDetails.dataValues);

    return {
      status: true,
      message: "Phone number verification successful",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("PHONE NUMBER VERIFICATION ENDPOINT"),
    };
  }
};

const reSendEmailCode = async (params) => {
  try {
    const { email } = params;

    //generate email code
    const emailCode = generalHelperFunctions.generateEmailCode();
    console.log(emailCode);
    //check if email exist in the database

    const isEmailExisting = await ChurchAppUsers.findOne({
      email: email,
    });

    if (!isEmailExisting) {
      return {
        status: false,
        message: "Email not valid.",
      };
    }

    // If email is existing; update new email code in the database for this user
    const filter = { id: authId };
    const update = { emailCode: emailCode };
    await ChurchAppUsers.findOneAndUpdate(filter, update, {
      new: true,
    });

    //send emailCode to user's email
    const { status: EmailStatusCode } =
      await EmailService.sendEmailVerificationCode({
        user: email,
        code: emailCode,
      });

    return {
      status: true,
      EmailStatusCode: EmailStatusCode,
      message: "verification code sent successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("EMAIL CODE NOT SENT"),
    };
  }
};

const reSendPhoneNumberCode = async (params) => {
  try {
    const { phoneNumber } = params;

    //check if phone number exist in the database

    const isPhoneNumberExisting = await ChurchAppUsers.findOne({
      phoneNumber: phoneNumber,
    });

    if (!isPhoneNumberExisting) {
      return {
        status: false,
        message: "Phone number not valid.",
      };
    }

    // generate phone number code

    const phoneNumberCode = generalHelperFunctions.generatePhoneNumberCode();
    console.log("phone number code: " + phoneNumberCode);
    const message = "Otp number" + phoneNumberCode;

    //send otp to user phone number
    await SendOtp.sendOtpToPhone(phoneNumber, message);

    //If phone number is existing; update new phone number code in the database for this user
    await ChurchAppUsers.updateOne({
      phoneNumberCode: phoneCode, //phoneNumberCode },

      phoneNumber: phoneNumber,
    });

    //ToDo send phoneCode to user's phone number

    return {
      status: true,
      message: "Phone verification code sent successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("PHONE CODE NOT SENT"),
    };
  }
};

/**
 * Forgot password endpoint
 * @param {Object} params email.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const forgotPassword = async (params) => {
  try {
    const { email } = params;

    //generate email code
    const emailCode = generalHelperFunctions.generateEmailCode();
    //check if email exist in the database

    const isEmailExisting = await ChurchAppUsers.findOne({
      email: email,
    });

    if (!isEmailExisting) {
      return {
        status: false,
        message: "Email not valid.",
      };
    }

    // If email is existing; update new email code in the database for this user

    const filter = { email: email };
    const update = { emailCode: emailCode };
    await ChurchAppUsers.findOneAndUpdate(filter, update, {
      new: true,
    });

    //send emailCode to user's email
    const { status: EmailStatusCode } =
      await EmailService.sendEmailVerificationCode({
        user: email,
        code: emailCode,
      });

    return {
      status: true,
      EmailStatusCode: EmailStatusCode,
      message:
        "We have sent a code to your email. Please enter the code correctly. Didn't receive any email? Resend code",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("FORGOT PASSWORD EMAIL CODE NOT SENT"),
    };
  }
};

/**
 * Verify Forgot password code endpoint
 * @param {Object} params email and code.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const validateForgotPasswordCode = async (params) => {
  try {
    const { email, emailCode } = params;

    //check if email address is existing
    const isEmailExisting = await ChurchAppUsers.findOne({
      email: email,
    });

    if (!isEmailExisting) {
      return {
        status: false,
        message: "This email does not exist",
      };
    }
    //check if user forgot password code is valid
    const isEmailCodeValid = await ChurchAppUsers.findOne({
      email: email,
      emailCode: emailCode,
    });

    if (!isEmailCodeValid) {
      return {
        status: false,
        message: "invalid code",
      };
    }

    return {
      status: true,
      message: "Valid code",
    };
  } catch (e) {
    return {
      status: false,
      message: constants.SERVER_ERROR(
        "VALIDATE PASSWORD VERIFICATION ENDPOINT"
      ),
    };
  }
};

/**
 * Update password endpoint
 * @param {Object} params email and password.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const updatePassword = async (params) => {
  try {
    const { email, password } = params;

    //encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await ChurchAppUsers.updateOne(
      { email: email },
      {
        password: hashedPassword,
      }
    );

    return {
      status: true,
      message: "Password updated successfully. You may now login",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("UPDATE PASSWORD VERIFICATION ENDPOINT"),
    };
  }
};

/**
 * Update phone number endpoint
 * @param {Object} params email and phone number.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updatePhoneNumber = async (params) => {
  try {
    const { phoneNumber, authId } = params;

    //check if phone number exist in the database

    const isPhoneNumberExisting = await ChurchAppUsers.findOne({
      phoneNumber: phoneNumber,
    });

    if (isPhoneNumberExisting) {
      return {
        status: false,
        message: "Phone number is existing.",
      };
    }
    // generate phone number code

    const phoneNumberCode = generalHelperFunctions.generatePhoneNumberCode();
    console.log("phone number code: " + phoneNumberCode);
    const message = "Otp number" + phoneNumberCode;

    //send otp to user phone number
    await SendOtp.sendOtpToPhone(phoneNumber, message);

    // If phone number is not existing; update new phone number code in the database for this user
    await ChurchAppUsers.updateOne(
      { id: authId },
      {
        phoneNumberCode: phoneCode, //phoneNumberCode
      }
    );

    //update date users phone number
    await ChurchAppUsers.updateOne(
      { id: authId },
      {
        phoneNumber: phoneNumber,
      }
    );

    return {
      status: true,
      message: "Phone number updated successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("UPDATE PHONE NUMBER"),
    };
  }
};

/**
 * Update churches joined endpoint
 * @param {Object} params auth and churches joined
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const verifyChurchMember = async (params) => {
  try {
    const { authId } = params;

    //check if user is existing

    const getAUser = await ChurchAppUsers.findOne({ id: authId });

    if (!getAUser) {
      return {
        status: false,
        message: "No record found",
      };
    }

    //update users membership to a church to true

    const verifyMe = await ChurchAppUsers.updateOne(
      { id: authId },
      {
        memberVerified: true,
      }
    );

    if (verifyMe) {
      return {
        status: true,
        message: "Member verified successfully",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("CHURCHES MEMBERS VERIFICATION"),
    };
  }
};

/**
 * Update churches members count endpoint
 * @param {Object} params auth and memberCount
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateChurchMembersCount = async (params) => {
  try {
    const { churchId } = params;

    //check if church is existing

    const getAUser = await ChurchAppUsers.findOne({ churchId: churchId });

    if (!getAUser) {
      return {
        status: false,
        message: "No record found",
      };
    }

    //get the existing member count for this church
    let existingCount = 0;
    let count;
    existingCount = getAUser.membersCount;
    count = existingCount + 1;

    //update users church joined

    await ChurchAppUsers.updateOne(
      { churchId: churchId },
      {
        membersCount: count,
      }
    );

    return {
      status: true,
      message: "church count updated successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: constants.SERVER_ERROR("CHURCHES COUNT UPDATE"),
    };
  }
};

/**
 * for fetching all church admin members
 * @param {Object} params  page and church name
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const getChurchAdminMembers = async (params) => {
  try {
    const { page, authId } = params;

    const pageCount = 15;

    const isChurchExisting = await ChurchAppUsers.findOne({ id: authId });

    if (!isChurchExisting) {
      return {
        status: false,
        message: "No record found",
      };
    }

    const allChurchMembers = await ChurchAppUsers.findOne({
      accountType: "churchMember",
      churchId: authId,
    })
      .limit(pageCount)
      .skip(pageCount * (page - 1))
      .exec();

    if (allChurchMembers) {
      return {
        status: true,
        data: allChurchMembers,
      };
    }
    console.log(allChurchMembers);
    return {
      status: true,
      data: "No member found for this church",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("ALL ADMIN CHURCH MEMBERS"),
    };
  }
};

/**
 * for fetching all church admin members that have not been verified
 * @param {Object} params  page and church name
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const getUnverifiedMembers = async (params) => {
  try {
    const { page, authId } = params;

    const pageCount = 15;

    const unverifiedMembers = await ChurchAppUsers.find({
      accountType: "churchMember",
      churchId: authId,
      memberVerified: false,
    })
      .limit(pageCount)
      .skip(pageCount * (page - 1))
      .exec();

    if (unverifiedMembers) {
      return {
        status: true,
        data: unverifiedMembers,
      };
    }

    return {
      status: true,
      data: "No unverified member found for this church",
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("ALL ADMIN CHURCH MEMBERS"),
    };
  }
};

/**
 * for fetching all church within member city
 * @param {Object} params  page and country, state, city
 * @returns {Promise<Object>} Contains status, and returns data and message
 */
const getListOfChurches = async (params) => {
  try {
    const { page, country, state, city } = params;

    const pageCount = 15;

    const allChurchMembers = await ChurchAppUsers.find({
      country: country,
      state: state,
      city: city,
      accountType: "churchAdmin",
    })
      .limit(pageCount)
      .skip(pageCount * (page - 1))
      .exec();

    if (!allChurchMembers) {
      return {
        status: false,
        message: "No church found within this location",
      };
    }

    return {
      status: true,
      data: allChurchMembers,
    };
  } catch (e) {
    console.log(e);
    return {
      status: false,
      message: constants.SERVER_ERROR("ALL ADMIN CHURCH MEMBERS"),
    };
  }
};

/**
 * Update users church
 * @param {Object} params email and phone number.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateChurchName = async (params) => {
  try {
    const { churchName, authId } = params;

    //check if member exist in the database

    const isMemberExisting = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!isMemberExisting) {
      return {
        status: false,
        message: "Invalid user",
      };
    }

    // If church name is not existing; update new church name in the database for this user
    await ChurchAppUsers.updateOne(
      {
        id: authId,
      },
      {
        churchName: churchName,
      }
    );

    return {
      status: true,
      message: "Church name updated successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("UPDATE CHURCH NAME"),
    };
  }
};

/**
 * Update users email address
 * @param {Object} params email, authId.
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateEmailAddress = async (params) => {
  try {
    const { authId, email } = params;

    //check if user exist in the database

    const isMemberExisting = await ChurchAppUsers.findOne({
      id: authId,
    });

    if (!isMemberExisting) {
      return {
        status: false,
        message: "Invalid user",
      };
    }

    //check if email already exist in the database

    const isEmailExisting = await ChurchAppUsers.findOne({
      email: email,
    });

    if (isEmailExisting) {
      return {
        status: false,
        message: "Email already exist",
      };
    }

    // If email address is not existing; update new email address in the database for this user
    await ChurchAppUsers.updateOne(
      {
        email: email,
      },
      {
        id: authId,
      }
    );

    return {
      status: true,
      message: "Email updated successfully",
    };
  } catch (error) {
    return {
      status: false,
      message: constants.SERVER_ERROR("EMAIL ADDRESS"),
    };
  }
};

/**
 * Update meeting days
 * @param {Object} params meetingDays, authId and churchId
 * @returns {Promise<Object>} Contains status, and returns data and message
 */

const updateMeetingDays = async (params) => {
  try {
    const { authId, churchId, meetings } = params;
    //check if user is existing

    const getAUser = await ChurchAppUsers.findOne({
      id: authId,
      churchId: churchId,
      // [and]: [
      //     { id: authId },
      //     { churchId: churchId },
      // ],
    });

    if (!getAUser) {
      return {
        status: false,
        message: "No record found about this user",
      };
    }

    //update area of meeting days
    const filter = { id: authId };
    const update = { meetings: meetings };
    const updateMeetingDays = await ChurchAppUsers.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
      }
    );

    if (updateMeetingDays) {
      return {
        status: true,
        message: "Meeting days updated successfully",
      };
    }
    return {
      status: true,
      message: "Meeting days did not update successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: constants.SERVER_ERROR(
        "Error occured updating church MeetingDays"
      ),
    };
  }
};

module.exports = {
  welcomeText,
  generalLogin,
  churchAccountRegistration,
  validateUserToken,
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
  getChurchAdminMembers,
  updateChurchMembersCount,
  getListOfChurches,
  getUnverifiedMembers,
  updateChurchName,
  updateEmailAddress,
  updateMeetingDays,
};
