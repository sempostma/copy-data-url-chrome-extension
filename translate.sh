set -o allexport
source ./.env
set +o allexport
if [[ -z "$API_KEY" ]]; then
    echo "Please create a .env file with an API_KEY=<google translate api key> entry." >&2;
    echo "You can create an api key here: https://console.cloud.google.com/apis/api/translate.googleapis.com/credentials" >&2;
    exit 1;
else
    npm i -g chrome-extension-translate
    chrome-extension-translate "$API_KEY" ar am bg bn ca cs da de el en es et fa fi fil fr gu he hi hr hu id it ja kn ko lt lv ml mr ms nl no pl ro ru sk sl sr sv sw ta te th tr uk vi
fi