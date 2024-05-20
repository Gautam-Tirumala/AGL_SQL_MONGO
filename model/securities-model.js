
const mongoose=require('mongoose');


// how our document look like
const securitiesSchema = mongoose.Schema({
    
    security_id: {type:Number,required: true},
    admin_name: {type:String,required: true},
    admin_email: {type:String,required: true},
    admin_mobile: {type:String,required: true},
    address: {type:String,required: true},
    admin_password:{type:String,required: true},
    status:{type:String,required: true},
    role_id:{type:String,required: true},
    security_type:{type:String,required: true},
    access_status:{type:String,required: true},
    org_id:{type:String,required:true},
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    created_date_time:{ type : String },
    old_security_id:{type:String},

});


const securitiesModel = mongoose.model('securities', securitiesSchema);

module.exports=securitiesModel;