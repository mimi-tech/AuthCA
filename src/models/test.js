const mongoose = require('mongoose');



const churchAppAccount = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: [true, 'user must have  auth id'],
    },

    email: { 
        type: String,
        allowNull: false,
        required: [true,'user must have email'], 
    },
    
    password: { 
           type: String,
           allowNull: false,
           required: [true,'user must have a password'], 
        },

    accountType: { 
        type: String, 
        allowNull: false,
        required: [true,'user must be either an admin or a member'], 
    
    },
    isEmailVerified: { 
         type: Boolean,
         default: false,
        
        },


    profileImageUrl: { 
        type: String,
         allowNull: true
        
        },

    username: { 
         type: String,
         allowNull:false, 
         unique: true,
         required: [true,'user must have a username'],
        },

    emailCode: { 
        type: Number,
         allowNull: false,
         required: [true,'Email code s required'],
        },

    phoneNumberCode: { 
        type: Number,
         allowNull: false,
         required: [true,'Phone number code s required'],
        },  
        
    domination: { 
            type: String,
            allowNull:true,
            required:false,
           
           },

           DOB: { 
            type: String,
            allowNull:true, 
            required:false,
           },

           gender: { 
            type: String,
            allowNull:true, 
            required:false,
           
           },

           country: { 
            type: String,
            required:[true,'Country is required'],
           
           },

           state: { 
            type: String,
            required:[true,'State is required'],
           
           },

           city: { 
            type: String,
            required:[true,'City is required'],
           
           },

           town: { 
            type: String,
            required:false
           
           },


           roadName: { 
            type: String,
            required:false
           
           },

           roadNumber: { 
            type: String,
            required:false
           
           },

           phoneNumber: { 
            type: String,
            unique: true,
            required: [true,'user must have a phone number'],
           },

           isPhoneNumberVerified: { 
            type: Boolean,
            default: false,
           
           },

           fullName: {
        type: String,
        required: [true, 'user must have full name'],
        
    },
    churchName: {
        type: String,
        required: false,
    },

    churchAddress: {
        type: String,
        required:false,
    },
    foundedDate: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },

    churchMotto: {
        type: String,
        required: false,
    },
    meetings: {
        type: Array,
        required: false,
    },

    churchesJoined: {
        type: String,
        required: false,
    },
    memberVerified: {
        type: Boolean,
        default: false,
    },
    videoIntroUrl: {
        type: String,
        required: false
    },
    membersCount: {
        type: Number,
        required: false
    },
    churchId: {
        type: String, 
        required: false,
        unique: true,
    },

    
  

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



const ChurchAppAccount = mongoose.model('ChurchApp', churchAppAccount);

module.exports = ChurchAppAccount;