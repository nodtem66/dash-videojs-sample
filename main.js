/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
from: https://github.com/samdutton/simpl/blob/gh-pages/eme/clearkey/index.html
*/

'use strict';

// Define a key: hardcoded in this example
// This corresponds to the key used for encryption
// 0xccc0f2b3b279926496a7f5d25da692f6
var KEY = new Uint8Array([
  0xcc, 0xc0, 0xf2, 0xb3, 0xb2, 0x79, 0x92, 0x64,
  0x96, 0xa7, 0xf5, 0xd2, 0x5d, 0xa6, 0x92, 0xf6
]);

var config = [{
  initDataTypes: ['cenc'],
  videoCapabilities: [{
    contentType: 'video/mp4;codecs="avc1.4d401e"'
  }]
}];

var player = videojs('my-player');
var video = player.$('video');
video.addEventListener('encrypted', handleEncrypted, false);
document.getElementById('playbtn').addEventListener('click', handlePlay, false);

navigator.requestMediaKeySystemAccess('org.w3.clearkey', config).then(
  function(keySystemAccess) {
    return keySystemAccess.createMediaKeys();
  }
).then(
  function(createdMediaKeys) {
    return video.setMediaKeys(createdMediaKeys);
  }
).catch(
  function(error) {
    console.error('Failed to set up MediaKeys', error);
  }
);

function handlePlay() {
  player.src({
    src: "gpac/enc_dash.mpd",
    type: "application/dash+xml",
    keySystemOptions: [
    {
      name: 'org.w3.clearkey',
      options: {
        serverURL: 'http://m.widevine.com/proxy'
      }
    }
  ]
  });

  player.play();
}

function handleEncrypted(event) {
  //console.log('encrypted event:', event);
  var session = video.mediaKeys.createSession();
  session.addEventListener('message', handleMessage, false);
  session.generateRequest(event.initDataType, event.initData).catch(
    function(error) {
      console.error('Failed to generate a license request', error);
    }
  );
}

function handleMessage(event) {
  // If you had a license server, you would make an asynchronous XMLHttpRequest
  // with event.message as the body.  The response from the server, as a
  // Uint8Array, would then be passed to session.update().
  // Instead, we will generate the license synchronously on the client, using
  // the hard-coded KEY at the top.
  var license = generateLicense(event.message);
  //console.log('license: ', license);

  var session = event.target;
  session.update(license).catch(
    function(error) {
      console.error('Failed to update the session', error);
    }
  );
}

// Convert Uint8Array into base64 using base64url alphabet, without padding.
function toBase64(u8arr) {
  return btoa(String.fromCharCode.apply(null, u8arr)).
    replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/, '');
}

function parseHexString(str) { 
  var result = [];
  while (str.length >= 2) { 
      result.push(parseInt(str.substring(0, 2), 16));

      str = str.substring(2, str.length);
  }

  return result;
}

// This takes the place of a license server.
// kids is an array of base64-encoded key IDs
// keys is an array of base64-encoded keys
function generateLicense(message) {
  // Parse the clearkey license request.
  var request = JSON.parse(new TextDecoder().decode(message));
  // We only know one key, so there should only be one key ID.
  // A real license server could easily serve multiple keys.
  console.assert(request.kids.length >= 1);

  var keyStr = parseHexString(document.getElementById("mykey").value);
  console.log(keyStr);
  console.assert(keyStr.length > 0);
  var resultKeys = [];
  request.kids.forEach(function (kid) {
    var keyObj = {
      kty: 'oct',
      alg: 'A128KW',
      kid: kid,
      k: toBase64(new Uint8Array(keyStr))
    };
    resultKeys.push(keyObj);
  });
  return new TextEncoder().encode(JSON.stringify({
    keys: resultKeys
  }));
  return result
}