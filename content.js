document.addEventListener("mousedown", function (e) {
    const element = e.target.closest('svg') || e.target.tagName === 'IMG';
    chrome.runtime.sendMessage({
        ACTION: 'CONTEXTMENU',
        visible: !!element,
        svg: element.tagName === 'svg' 
            ? new XMLSerializer().serializeToString(e.target.closest('svg'))
            : null
    }, function (response) {
    });
});
