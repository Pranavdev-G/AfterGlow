import mongoose from 'mongoose';
const {Schema,model,models}=mongoose;

const UserSchema=new Schema({
 name:{type:String,required:true,trim:true,maxlength:100},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 passwordHash:{type:String,required:true,select:false},
 role:{type:String,enum:['user','admin'],default:'user',required:true},
 watchlist:[{type:Schema.Types.ObjectId,ref:'Content'}],
 favourites:[{type:Schema.Types.ObjectId,ref:'Content'}],
},{timestamps:true});
const ContentSchema=new Schema({
 slug:{type:String,index:true,unique:true,sparse:true},title:{type:String,required:true,trim:true,maxlength:150},
 type:{type:String,enum:['movie','show'],required:true},year:{type:Number,required:true,min:1888,max:2200},
 language:{type:String,required:true,trim:true},genre:{type:String,required:true,trim:true},
 rating:{type:Number,min:0,max:10,default:null},duration:{type:Number,required:true,min:1,max:1000},
 seasons:{type:Number,min:1},description:{type:String,required:true,maxlength:2000},director:{type:String,maxlength:150},
	cast:{type:String,maxlength:300},status:{type:String,default:'Available'},sampleOnly:{type:Boolean,default:false},
	approvedForScheduling:{type:Boolean,default:true},
	posterUrl:{type:String,maxlength:2048},posterTitle:{type:String,maxlength:200},
	posterSourceUrl:{type:String,maxlength:2048},posterCredit:{type:String,maxlength:160},
},{timestamps:true});
const TheatreSchema=new Schema({
	name:{type:String,required:true,unique:true},slug:{type:String,required:true,unique:true,index:true},location:{type:String,required:true},
 operationalStatus:{type:String,default:'Operational'},fictional:{type:Boolean,default:true},sampleData:{type:Boolean,default:true},
},{timestamps:true});
const ScreenSchema=new Schema({
 screenId:{type:String,required:true,unique:true},theatreId:{type:Schema.Types.ObjectId,ref:'Theatre',required:true,index:true},
 name:{type:String,required:true},number:{type:Number,required:true},capacity:{type:Number,required:true,min:1},
 type:{type:String,enum:['Standard','3D','IMAX-style'],default:'Standard'},operationalStatus:{type:String,default:'Operational'},
 maintenanceWindows:[{date:String,startTime:String,endTime:String,reason:String}],
},{timestamps:true});
const ScreeningSchema=new Schema({
 screenId:{type:String,required:true,index:true},theatreId:{type:Schema.Types.ObjectId,ref:'Theatre',required:true,index:true},
 contentId:{type:Schema.Types.ObjectId,ref:'Content',default:null},date:{type:String,required:true,index:true},
 startTime:{type:String,required:true},endTime:{type:String,required:true},startAt:{type:Date,required:true},endAt:{type:Date,required:true},
 duration:{type:Number,required:true},maintenance:{type:Boolean,default:false},sampleData:{type:Boolean,default:false},
},{timestamps:true});
ScreeningSchema.index({screenId:1,startAt:1,endAt:1});
const SubmissionSchema=new Schema({
 title:{type:String,required:true},productionCompany:{type:String,required:true},releaseDate:{type:String,required:true},
 status:{type:String,enum:['Pending Review','Approved','Rejected'],default:'Pending Review'},genre:{type:String,required:true},
 language:{type:String,required:true},duration:{type:Number,required:true},description:{type:String,default:''},
 contentId:{type:String},sample:{type:Boolean,default:true},
},{timestamps:true});
export const User=models.User||model('User',UserSchema);
export const Content=models.Content||model('Content',ContentSchema);
export const Theatre=models.Theatre||model('Theatre',TheatreSchema);
export const Screen=models.Screen||model('Screen',ScreenSchema);
export const Screening=models.Screening||model('Screening',ScreeningSchema);
export const Submission=models.Submission||model('Submission',SubmissionSchema);
