
var stickerpipe = null;

function setupStickerPipe() {

		var stickerpipeConfig = config.stickerpipe,

				$stickersBtn = $('#' + stickerpipeConfig.elId + ' i'),
				$messageText = $('#message_text');

		stickerpipeConfig.userId = currentUser.id;

		stickerpipe = new Stickers(stickerpipeConfig);

		stickerpipe.render(function() {

				this.stickerpipe.onClickSticker((function(stickerCode) {
						sendMessage(stickerCode, null);
				}).bind(this));

				this.stickerpipe.onClickEmoji(function(emoji) {
						console.log('click on emoji', emoji);
						$messageText.focus();
						pasteHtmlAtCaret(stickerpipe.parseEmojiFromText(emoji));
				});

		});

		stickerpipe.onPurchase((function(packName, packTitle, pricePoint) {

			try {
				// do purchase transaction ...
				if (confirm('Do you want buy pack "' + packName + '"?')) {
					stickerpipe.purchaseSuccess(packName, pricePoint);
				} else {
					stickerpipe.purchaseFail();
				}
			} catch (e) {
				stickerpipe.purchaseFail();
			}
		}).bind(this));

		window.addEventListener('sp:popover:shown', function() {
				$stickersBtn.addClass('active');
		});

		window.addEventListener('sp:popover:hidden', function() {
				$stickersBtn.removeClass('active');
		});

}

function pasteHtmlAtCaret(html) {
		var sel, range;
		if (window.getSelection) {
				// IE9 and non-IE
				sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
						range = sel.getRangeAt(0);
						range.deleteContents();

						// Range.createContextualFragment() would be useful here but is
						// only relatively recently standardized and is not supported in
						// some browsers (IE9, for one)
						var el = document.createElement("div");
						el.innerHTML = html;
						var frag = document.createDocumentFragment(), node, lastNode;
						while ( (node = el.firstChild) ) {
								lastNode = frag.appendChild(node);
						}
						var firstNode = frag.firstChild;
						range.insertNode(frag);

						// Preserve the selection
						if (lastNode) {
								range = range.cloneRange();
								range.setStartAfter(lastNode);
								range.collapse(true);
								sel.removeAllRanges();
								sel.addRange(range);
						}
				}
		} else if ( (sel = document.selection) && sel.type != "Control") {
				// IE < 9
				var originalRange = sel.createRange();
				originalRange.collapse(true);
				sel.createRange().pasteHTML(html);
		}
}