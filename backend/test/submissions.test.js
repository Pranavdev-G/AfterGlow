import test from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import { Submission } from '../src/models/index.js';
import { applySubmissionReview, submissionView } from '../src/services/submissions.js';

test('persistent submission responses expose a routeable id and do not expose Mongo _id',()=>{
 const record=new Submission({
  _id:new Types.ObjectId(),title:'Sample release',productionCompany:'Sample Studio',
  releaseDate:'2027-01-01',status:'Pending Review',genre:'Sci-Fi',
  language:'English',duration:120,sample:true,
 });
 const raw=JSON.parse(JSON.stringify(record));
 assert.equal(raw.id,undefined,'the raw model JSON does not provide the client id');
 const view=submissionView(record);
 assert.equal(view.id,String(record._id));
 assert.equal(view._id,undefined);
 assert.equal(view.status,'Pending Review');
});

test('approval links the created content and rejection or return-to-review revokes schedule eligibility',async()=>{
 const item={title:'A Sample Release',releaseDate:'2027-03-02',sample:true,status:'Pending Review',contentId:undefined,save:async()=>{}};
 let content=null;
 const created=await applySubmissionReview({item,status:'Approved',findContent:async()=>content,createContent:async()=>{content={slug:'a-sample-release-test',approvedForScheduling:false,save:async()=>{}};return content;}});
 assert.equal(created.item.status,'Approved');
 assert.equal(created.item.contentId,'a-sample-release-test');
 assert.equal(created.content.approvedForScheduling,true);
 await applySubmissionReview({item,status:'Rejected',findContent:async()=>content,createContent:async()=>{throw new Error('should not create another record');}});
 assert.equal(item.status,'Rejected');
 assert.equal(content.approvedForScheduling,false,'rejected content must not be schedulable');
 await applySubmissionReview({item,status:'Pending Review',findContent:async()=>content,createContent:async()=>{throw new Error('should not create another record');}});
 assert.equal(item.status,'Pending Review');
 assert.equal(content.approvedForScheduling,false,'pending content must not be schedulable');
});
