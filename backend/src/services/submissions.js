export function submissionView(value){
 const row=value?.toObject?value.toObject():value||{};
 return {...row,id:String(row.id||row._id||''),_id:undefined};
}

export async function applySubmissionReview({item,status,findContent,createContent}){
 let content=item.contentId?await findContent(item.contentId):null;
 if(status==='Approved'&&!content){
  content=await createContent(item);
  item.contentId=content.slug;
 }
 item.status=status;
 if(status!=='Approved'&&content){
  content.approvedForScheduling=false;
  await content.save();
 }
 await item.save();
 if(status==='Approved'&&content){
  content.approvedForScheduling=true;
  await content.save();
 }
 return {item,content};
}
