const mongoose = require('mongoose');



const churchAppAccount = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: [true, 'user must have  auth id'],
    },

    email: { 
        type: String,
        
        required: [true,'user must have email'], 
    },
    
    password: { 
           
           type: String,
           required: [true,'user must have a password'], 
        },

    accountType: { 
        type: String, 
       
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
         
         unique: true,
         required: [true,'user must have a username'],
        },

        coverImageUrl: { 
            type: String,
            allowNull: true
           },

    emailCode: { 
        select:false,
        type: Number,
         
         required: [true,'Email code s required'],
        },

    phoneNumberCode: { 
        select:false,
        type: Number,
         allowNull: false,
         required: [true,'Phone number code s required'],
        },  
        
    domination: { 
            type: String,
            
            required:false,
           
           },

           DOB: { 
            type: String,
            
            required:false,
           },

           gender: { 
            type: String,
            
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
        required: false,
    },
    videoIntroUrl: {
        type: String,
        required: false
    },
    membersCount: {
        type: Number,
        required: false
    },
    unverifiedMembersCount: {
        type: Number,
        required: false
    },
    churchId: {
        type: String, 
        required: false,
    

    },
    churchJoinedId: {
        type: String, 
        required: false,
        // index:true,
        // unique:true,
       
    },

    
  

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



const ChurchAppUsers = mongoose.model('ChurchApp', churchAppAccount);

module.exports = ChurchAppUsers;