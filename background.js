const console = chrome.extension.getBackgroundPage().console;

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blobToDataUrl);

const saveAsDataUrl = srcUrl => {
  if (isDataURL(srcUrl)) {
    copy(srcUrl, 'text/plain');
    alert(chrome.i18n.getMessage("copiedToClipboard"));
  } else {
    toDataURL(srcUrl)
      .then(dataUrl => {
        copy(dataUrl, 'text/plain');
        alert(chrome.i18n.getMessage("copiedToClipboard"));
      }).catch(console.error);
  }
};

let saveSvgUriMenuId = false;
let svg = false;

chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }) => {
  if (menuItemId === saveSvgUriMenuId) {
    if (!srcUrl && !svg) return alert(chrome.i18n.getMessage('error'));
    else if (srcUrl) {
      saveAsDataUrl(srcUrl);
    } else {
      svgXmlToDataUri(svg).then(saveAsDataUrl);
    }
  } else {
    return alert(chrome.i18n.getMessage('error'));
  }
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.ACTION === "CONTEXTMENU") {
    const visible = msg.visible;
    if (saveSvgUriMenuId && !visible) {
      chrome.contextMenus.remove(saveSvgUriMenuId);
      saveSvgUriMenuId = false;
      xml = false;
      svg = false;
    } else if (visible) {
      svg = msg.svg;
      if (!saveSvgUriMenuId) {
        svg = msg.svg;
        saveSvgUriMenuId = chrome.contextMenus.create({
          title: "Copy data url",
          contexts: ['all'],
          id: "svg-svg-uri-contextmenu-1"
        });
      }
    }
  }
  sendResponse("Gotcha!");
});

const copy = (str, mimetype) => {
  document.oncopy = function (event) {
    event.clipboardData.setData(mimetype, str);
    event.preventDefault();
  };
  document.execCommand("Copy", false, null);
}

const isDataURL = s => {
  return !!s.match(isDataURL.regex);
}
isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

// 

const svgXmlToDataUri = async xmlSource => {
  if (!xmlSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    xmlSource = xmlSource.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!xmlSource.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    xmlSource = xmlSource.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  // add xml declaration
  xmlSource = `<?xml version="1.0" standalone="no"?>\r\n${xmlSource}`;

  const svg64 = encodeURIComponent(xmlSource);
  const b64Start = 'data:image/svg+xml;charset=utf-8,';

  const imgEl = new Image();
  const image64 = b64Start + svg64;
  imgEl.src = image64;

  const blobResp = await fetch(imgEl.src);
  return await blobResp.blob().then(blobToDataUrl);
}
