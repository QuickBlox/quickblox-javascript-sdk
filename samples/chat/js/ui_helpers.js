// build html for messages
function buildMessageHTML(messageText, messageSenderId, messageDateSent, attachmentFileId, messageId, status){
  var messageAttach;
  if(attachmentFileId){
      messageAttach = '<img src="' + QB.content.publicUrl(attachmentFileId) + '/' + '/download.xml?token='+token+'" alt="attachment" class="attachments img-responsive" />';
  }

	var isMessageSticker = stickerpipe.isSticker(messageText);

  var delivered = '<img class="icon-small" src="images/delivered.jpg" alt="" id="delivered_'+messageId+'">';
  var read = '<img class="icon-small" src="images/read.jpg" alt="" id="read_'+messageId+'">';

	var messageTextHtml = messageText;
	if (messageAttach) {
		messageTextHtml = messageAttach;
	} else if (isMessageSticker) {
		messageTextHtml = '<div class="message-sticker-container"></div>';

		stickerpipe.parseStickerFromText(messageText, function(sticker, isAsync) {
			if (isAsync) {
				$('#' + messageId + ' .message-sticker-container').html(sticker.html);
			} else {
				messageTextHtml = sticker.html;
			}
		});
	}

  var messageHtml =
			'<div class="list-group-item" id="'+messageId+'">'+
				'<time datetime="'+messageDateSent+ '" class="pull-right">'
					+jQuery.timeago(messageDateSent)+
				'</time>'+

				'<h4 class="list-group-item-heading">'+messageSenderId+'</h4>'+
				'<p class="list-group-item-text">'+
					messageTextHtml +
				'</p>'
				+delivered+read+
			'</div>';
  return messageHtml;
}

// build html for dialogs
function buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage) {
  var UnreadMessagesCountShow = '<span class="badge">'+dialogUnreadMessagesCount+'</span>';
      UnreadMessagesCountHide = '<span class="badge" style="display: none;">'+dialogUnreadMessagesCount+'</span>';

  var isMessageSticker = stickerpipe.isSticker(dialogLastMessage);

  var dialogHtml =
      '<a href="#" class="list-group-item inactive" id='+'"'+dialogId+'"'+' onclick="triggerDialog('+"'"+dialogId+"'"+')">'+
                   (dialogUnreadMessagesCount === 0 ? UnreadMessagesCountHide : UnreadMessagesCountShow)+
        '<h4 class="list-group-item-heading">'+ dialogIcon+'&nbsp;&nbsp;&nbsp;' +
            '<span>'+dialogName+'</span>' +
        '</h4>'+
        '<p class="list-group-item-text last-message">'+
            (dialogLastMessage === null ?  "" : (isMessageSticker ? 'Sticker' : dialogLastMessage))+
        '</p>'+
      '</a>';
  return dialogHtml;
}

// build html for typing status
function buildTypingUserHtml(userId, userLogin) {
  var typingUserHtml =
      '<div id="'+userId+'_typing" class="list-group-item typing">'+
        '<time class="pull-right">writing now</time>'+
        '<h4 class="list-group-item-heading">'+ userLogin+'</h4>'+
        '<p class="list-group-item-text"> . . . </p>'+
      '</div>';

  return typingUserHtml;
}

// build html for users list
function buildUserHtml(userLogin, userId, isNew) {
  var userHtml = "<a href='#' id='" + userId;
  if(isNew){
    userHtml += "_new'";
  }else{
    userHtml += "'";
  }
  userHtml += " class='col-md-12 col-sm-12 col-xs-12 users_form' onclick='";
  userHtml += "clickToAdd";
  userHtml += "(\"";
  userHtml += userId;
  if(isNew){
    userHtml += "_new";
  }
  userHtml += "\")'>";
  userHtml += userLogin;
  userHtml +="</a>";

  return userHtml;
}
