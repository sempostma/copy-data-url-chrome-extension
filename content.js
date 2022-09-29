document.addEventListener("mousedown", function (e) {
    const element = e.target.closest('svg') || e.target.tagName === 'IMG';
    chrome.runtime.sendMessage({
        ACTION: 'CONTEXTMENU',
        visible: !!element,
        svg: element.tagName === 'svg'
            ? new XMLSerializer().serializeToString(e.target.closest('svg'))
            : null
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.ACTION === 'COPY') {
        navigator.clipboard.writeText(message.text).then(() => {
            alert(chrome.i18n.getMessage('copiedToClipboard'))
        }, () => {
            alert(chrome.i18n.getMessage('error'))
        });    
    }
})




