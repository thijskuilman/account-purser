/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listMessages(query, callback) {
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'q': query
  });
  getPageOfMessages(initialRequest, []);
}

function retrieveContent(messages) {
  messages.forEach(function(message) {
     var request = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': message.id,
        // 'format': 'minimal'
      });
      request.execute(addToMessageArray);
  });
}

var messagesArray = [];

function getSender(headerItem) { return headerItem.name === 'From';}
function getSubject(headerItem) { return headerItem.name === 'Subject';}

function addToMessageArray(message) {
  var senderName = message.payload.headers.find(getSender).value;
  var senderNameCopy = senderName;
  var senderEmail = senderNameCopy.substring( senderNameCopy.indexOf( '<' ) + 1, senderNameCopy.indexOf( '>' ) );
  senderName = senderName.replace('<' + senderEmail + '>', '');
  senderName = senderName.replace('"', '').replace('"', '');
  if(senderName == ""){ 
    senderName = senderEmail 
  }

  var subject = message.payload.headers.find(getSubject).value;

  appendPre(senderName);

  messagesArray.push({'title': subject , 'body': message.snippet, 'senderName': senderName, 'senderEmail': senderEmail });
  console.log(messagesArray);
}
