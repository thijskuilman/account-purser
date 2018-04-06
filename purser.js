var ownedAccounts = [];
var list = document.getElementById('messageTable');
var tableCount = 0;
var accountCount = document.getElementById("accountCount");

// Update UI after succesful sign in
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    searchMessages(searchQueries, getMessages);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

// Add account entry to the HTML list
function addAccountEntry(message) {
  tableCount++;
  var messageEntry = document.createElement('tr');
  messageEntry.innerHTML =  '<th scope="row">' + tableCount + '</th>' + 
                            '<td>' + message.from + '</td>' + 
                            '<td>' + message.to + '</td>' + 
                            '<td><a target="_blank" href="http://' + message.website + '">' + message.website + '</a></td>'
                            // '<td class="text-success table-success">Yes</td>'
                            ;
  list.appendChild(messageEntry);
  accountCount.innerText = tableCount;
}

// Search for messages in your inbox
function searchMessages(queries, callback) {
  queries.forEach(function(query) {
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
          console.log(result.length + " results for " + query)
          callback(result);
        }
      });
    };
    var initialRequest = gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'q': query
    });
    getPageOfMessages(initialRequest, []);
  });
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
    'to': message.payload.headers.find(headerItem => headerItem.name === 'Delivered-To').value,
    'from': '',
    'fromEmail': '',
    'website': '',
  }  

  // Process sender details
  var sender = message.payload.headers.find(headerItem => headerItem.name === 'From').value;
  messageObject.fromEmail = (sender.substring( sender.indexOf( '<' ) + 1, sender.indexOf( '>' ))).trim();
  messageObject.from = (sender.replace('<' + messageObject.fromEmail + '>', '').replace('"', '').replace('"', '')).trim();
  if(messageObject.from == ""){ 
    messageObject.from = messageObject.fromEmail 
  }
  var website = (messageObject.fromEmail).split('@')[1];
  if(website) { 
    messageObject.website = website; 
  } else {
    messageObject.website = (messageObject.from).split('@')[1]; 
  }

  // Remove message if its a duplicate
  var isDuplicate = ownedAccounts.find(item => item.from === messageObject.from);
  if(!isDuplicate) {
    addAccountEntry(messageObject);
    ownedAccounts.push(messageObject);
  }
}
