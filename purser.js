var ownedAccounts = [];
var list = document.getElementById('content');

// Update UI after succesful sign in
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    searchMessages('Thank you for registering', getMessages);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

// Add account entry to the HTML list
function addAccountEntry(message) {
  var messageEntry = document.createTextNode(message.from + '\n');
  list.appendChild(messageEntry);
}

// Search for messages in your inbox
function searchMessages(query, callback) {
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

// Get message details
function getMessages(messages) {
  messages.forEach(function(message) {
     var request = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': message.id,
      });
      request.execute(addMessage);
  });
}

// Add a formatted message to ownedAccounts
function addMessage(message) {
  var messageObject = {
    'title': message.payload.headers.find(headerItem => headerItem.name === 'Subject').value,
    'body': message.snippet,
    'from': '',
    'fromEmail': '',
  }  

  // Process sender details
  var sender = message.payload.headers.find(headerItem => headerItem.name === 'From').value;
  messageObject.fromEmail = (sender.substring( sender.indexOf( '<' ) + 1, sender.indexOf( '>' ))).trim();
  messageObject.from = (sender.replace('<' + messageObject.fromEmail + '>', '').replace('"', '').replace('"', '')).trim();
  if(messageObject.from == ""){ 
    messageObject.from = messageObject.fromEmail 
  }

  // Remove message if its a duplicate
  var isDuplicate = ownedAccounts.find(item => item.from === messageObject.from);
  if(!isDuplicate) {
    addAccountEntry(messageObject);
    ownedAccounts.push(messageObject);
  }
  
}
