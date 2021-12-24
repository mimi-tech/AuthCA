const Vonage = require('@vonage/server-sdk')


const sendOtpToPhone = async (to, text) => {

try{
if(process.env.SMS_PIPE === 'production'){
const vonage = new Vonage({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
})


const from = "Church app"


vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
        return {
            status: false,
            message: err,
        };
    } else {
        if(responseData.messages[0]['status'] === "0") {
           console.log("Otp has been sent to your phone");

        } else {
            `Message failed with error: ${responseData.messages[0]['error-text']}`
        }
    }
})
}
} catch (e) {
    console.log(e);
    return {e};
}

}

module.exports = {
    sendOtpToPhone
}