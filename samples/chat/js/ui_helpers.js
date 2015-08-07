// build html for messages
function buildMessageHTML(messageText, messageSenderId, messageDateSent, attachmentFileId){
  var messageAttach;
  if(attachmentFileId){
      messageAttach = "<img src='http://api.quickblox.com/blobs/"+attachmentFileId+"/download.xml?token="+token+"' alt='attachment' class='attachments img-responsive' />"
  }

  var messageHtml = '<div class="list-group-item">'+'<time datetime="'+messageDateSent+'" class="pull-right">'+jQuery.timeago(messageDateSent)+
                    '</time>'+'<h4 class="list-group-item-heading">'+messageSenderId+'</h4>'+'<p class="list-group-item-text">'+
                    (messageAttach ? messageAttach : messageText)+'</p>'+'</div>';
  return messageHtml;
}

// build html for dialogs
function buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage) {
  var UnreadMessagesCountShow = '<span class="badge">'+dialogUnreadMessagesCount+'</span>';
      UnreadMessagesCountHide = '<span class="badge" style="display: none;">'+dialogUnreadMessagesCount+'</span>';

  var dialogHtml = '<a href="#" class="list-group-item inactive" id='+'"'+dialogId+'"'+' onclick="triggerDialog(this, '+"'"+dialogId+"'"+')">'+ 
                   (dialogUnreadMessagesCount == 0 ? UnreadMessagesCountHide : UnreadMessagesCountShow)+'<h4 class="list-group-item-heading">'+
                   dialogIcon+'&nbsp;&nbsp;&nbsp;'+dialogName+'</h4>'+'<p class="list-group-item-text last-message">'+
                   (dialogLastMessage === null ?  "" : dialogLastMessage)+'</p>'+'</a>';
  return dialogHtml;
}

// build html for typing status
function buildTypingUserHtml(userId) {
  var typingUserHtml = '<div id="'+userId+'_typing" class="list-group-item typing">'+'<time class="pull-right">writing now</time>'+'<h4 class="list-group-item-heading">'+
                       userId+'</h4>'+'<p class="list-group-item-text"> . . . </p>'+'</div>';

  return typingUserHtml;
}

// build html for users list
function buildUserHtml(userLogin, userId) {
  var userHtml = "<a href='#' id='"+userId+"' class='col-md-12 col-sm-12 col-xs-12 users_form' onclick='clickToAdd("+userId+")'>"+userLogin+"</a>";
  return userHtml;
}