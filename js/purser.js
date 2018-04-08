var ownedAccounts = [];
var list = document.getElementById('messageTable');
var accountCount = document.getElementById("accountCount");
var processedMessages = 0;
var resultMessages = [];
var loadingText = document.getElementById('loadingText');
var loadingAnimation = document.getElementById('loadingAnimation');
var app = document.getElementById('app');
var dropzone = document.getElementById('drop_zone');

// Reset list and perform searches again.
function refreshList() {
  list.innerHTML = '';
  ownedAccounts = [];
  formatMessagesQueue();
}

// Update UI after succesful sign in
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    loadingAnimation.style.display = 'block';
    app.style.display = 'block';

    searchMessages(searchQueries, getMessages);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    app.style.display = 'none';
  }
}

// Search for messages in your inbox
function searchMessages(queries, callback) {
  var processedQueries = 0;

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
          processedQueries++;
          loadingText.innerText = "Find accounts.. " + Math.round((processedQueries / queries.length) * 100) + "%";
          resultMessages = resultMessages.concat(result);
          if(processedQueries == queries.length) {
            getMessages(resultMessages);
          }
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

var rawMessages = [];

// Get message details
function getMessages(messages) {
  loadingText.innerText = "Getting account details..";
  var processedRequests = 0;

  messages.forEach(function(message) {
    if(message === undefined) {
      processedRequests++;
      if(processedRequests >= resultMessages.length) {
        formatMessagesQueue();
      }
      return;
    }

    var request = gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': message.id,
    });

    request.execute(function(message) {
      rawMessages.push(message);

      processedRequests++;
      if(processedRequests >= resultMessages.length) {
        formatMessagesQueue();
      }
    });

  });
}

function formatMessagesQueue() {
  loadingText.innerText = "Formatting account data..";
  let messageQueue = rawMessages.reduce((promiseChain, message) => {
    return promiseChain.then(() => new Promise((resolve) => {
      formatMessage(message, resolve);
    }));
  }, Promise.resolve());

  messageQueue.then(() => generateTable())
}

// Add a formatted message to ownedAccounts
function formatMessage(message, callback) {
  
  var messageObject = {
    'title': '',
    'body': message.snippet,
    'to': '',
    'from': '',
    'fromEmail': '',
    'website': '',
    'stored': false
  }
  // Get the subject
  try {
    messageObject.title = message.payload.headers.find(headerItem => headerItem.name === 'Subject' || headerItem.name === 'subject').value
  } catch (error) {
    callback();
  }
  
  // Get the retriever email address
  try {
    messageObject.to = message.payload.headers.find(headerItem => headerItem.name === 'Delivered-To').value;
  } catch (error) {
    callback();
  }

  // Get the name and email of the sender
  try {
    var sender = message.payload.headers.find(headerItem => headerItem.name === 'From' || headerItem.name == "from").value;
  } catch (error) {
    callback();
  }

  messageObject.fromEmail = (sender.substring( sender.indexOf( '<' ) + 1, sender.indexOf( '>' ))).trim();
  messageObject.from = (sender.replace('<' + messageObject.fromEmail + '>', '').replace('"', '').replace('"', '')).trim();

  // Get the website of the sender, based on the email address or name
  messageObject.website = (messageObject.fromEmail).split('@')[1];
  if(!messageObject.website) { 
    messageObject.website = (messageObject.from).split('@')[1]; 
  }
  
  // If the sender name is empty or an email: retrieve name based on email
  if(messageObject.from.indexOf('@') > -1 || messageObject.from == ""){ 
    websiteName = (messageObject.website).split('.')[0];
    messageObject.from = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);
  }

  // Check if account is stored in password manager
  if(passwords) {
    if(messageObject.website) {
      if(passwords.search((messageObject.website).toLowerCase()) > 0) { messageObject.stored = true };
    }
    
    if(messageObject.from) {
      if(passwords.search((messageObject.from).toLowerCase()) > 0) { messageObject.stored = true };
    }
  }

  // Remove message if it's a duplicate
  // !ownedAccounts.find(item => item.website === messageObject.website)
  if(!ownedAccounts.find(item => item.from === messageObject.from)) {
    ownedAccounts.push(messageObject);
  }

  callback();
}

// Show message on click
function showMessage(element) {
  event.preventDefault();
  alert(element.dataset.title + ': ' + element.dataset.body + '..');
}

function generateTable() {
  loadingAnimation.style.display = 'none';
  dropzone.style.display = 'block';
  accountCount.innerText = ownedAccounts.length;

  // Add account rows
  ownedAccounts.forEach(function(account, index) {

    var tableClass = "none";
    var storedString = "No file dropped.";

    if(passwords != "") {
      if(account.stored) {
        tableClass = "success";
        storedString = "Yes";
      } else {
        tableClass = "danger";
        storedString = "No";
      }
    }

    // Add row HTML to table
    var accountRow = document.createElement('tr');
    accountRow.innerHTML =  
      '<th scope="row">' + index + '</th>' + 
      '<td> <a href="#" class="mr-2">' +
              '<img style="opacity: 0.2; height: 18px" src="/img/mail.svg" data-title="' + account.title + '" data-body="' + account.body + '" onclick="showMessage(this)">' +
            '</a> ' + account.from + '</td>' + 
      '<td>' + account.to + '</td>' + 
      '<td><a target="_blank" href="http://' + account.website + '">' + account.website + '</a></td>' +
      '<td class="text-' + tableClass +'  table-' + tableClass + '">' + storedString + '</td>';

    list.appendChild(accountRow);
  });

  if(passwords) {
    updateProgressBar(ownedAccounts);
  }
  
}

// Show percentage of stored accounts
function updateProgressBar(accounts) {
  var progressBar = document.getElementById('progressBarStored');
  document.getElementById('progressBar').style.display = "block";
  var percentageStored = (accounts.filter(item => item.stored)).length;

  if(!percentageStored) {
    percentageStored = 0;
  } else {
    percentageStored = ((percentageStored / accounts.length) * 100).toFixed(2);
  }
  
  progressBar.style.width = percentageStored + "%";
  progressBar.innerHTML = percentageStored + "% stored";
}
