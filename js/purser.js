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
    let resultMessages = [];
    searchQueries.forEach(function(query) {
      performQuery(query, function(result) {
        // result.forEach(function(resultObject) { resultObject.search_query = query; });

        processedQueries++;
        updateLoadingText(processedQueries, searchQueries.length);
        resultMessages = resultMessages.concat(result);
        if(processedQueries == searchQueries.length) {
          resultMessages = removeDuplicatesBy(x => x.id, resultMessages);
          resultMessages = removeDuplicatesBy(x => x.threadId, resultMessages);
          getMessages(resultMessages);
        }
      });
    });
    
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    app.style.display = 'none';
  }
}

function removeDuplicatesBy(keyFn, array) {
  var mySet = new Set();
  return array.filter(function(x) {
    var key = keyFn(x), isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

let processedQueries = 0;

/**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Messages listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
function performQuery(query, callback) {
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

function updateLoadingText(current, max) {
  loadingText.innerText = "Find accounts.. " + Math.round((current / max) * 100) + "%";
}

var rawMessages = [];

// Get message details
function getMessages(messages) {
  loadingText.innerText = "Getting account details..";
  var processedRequests = 0;

  messages.forEach(function(message) {

    if(message === undefined) {
      processedRequests++;
      if(processedRequests >= messages.length) {
        formatMessagesQueue();
      }
      return;
    }

    var request = gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': message.id,
    });

    request.execute(function(messageDetails) {
      messageDetails.search_query = message.search_query;
      rawMessages.push(messageDetails);

      processedRequests++;

      loadingText.innerText = "Getting account details.. " + Math.round((processedRequests / messages.length) * 100) + "%";
      if(processedRequests >= messages.length) {
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

  messageQueue.then(function() {
      generateTable()
  })
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
    'date': '',
    'stored': false,
    'search_query': message.search_query,
  }

  try {
    messageObject.date = message.payload.headers.find(headerItem => headerItem.name === 'Date').value;
  } catch (error) {
    callback();
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
  
  if (sender.indexOf('<') > -1 && sender.indexOf('>') > -1) {
    messageObject.fromEmail = (sender.substring( sender.indexOf( '<' ) + 1, sender.indexOf( '>' ))).trim();
    messageObject.from = (sender.replace('<' + messageObject.fromEmail + '>', '').replace('"', '').replace('"', '')).trim();
  } else {
    messageObject.fromEmail = sender;
    messageObject.from = sender;
  }

  // Get the website of the sender, based on the email address or name
  messageObject.website = (messageObject.fromEmail).split('@')[1];
  if(!messageObject.website) { 
    messageObject.website = (messageObject.from).split('@')[1]; 
  }

  if(messageObject.website == "gmail.com") {
    messageObject.website = (messageObject.fromEmail).split('@')[0];
    if(!messageObject.website) { 
      messageObject.website = (messageObject.from).split('@')[0]; 
    }
  }
  
  // If the sender name is empty or an email: retrieve name based on email
  if(messageObject.from.indexOf('@') > -1 || messageObject.from == ""){ 
    websiteName = (messageObject.website).split('.')[0];
    messageObject.from = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);
  }

  // Set website to empty string if undefined
  if (!messageObject.website) {
    messageObject.website = '';
  }

  // Check if account is stored in password manager
  if(passwords) {
    if(messageObject.website) {
      if(passwords.search((messageObject.website).toLowerCase()) > 0) { 
        messageObject.stored = true;
        passwords = passwords.replace((messageObject.website).toLowerCase(), "ISPROCESSED");
      };
    }
    
    if(messageObject.from) {
      if(passwords.search((messageObject.from).toLowerCase()) > 0) { 
        messageObject.stored = true;
        passwords = passwords.replace((messageObject.from).toLowerCase(), "ISPROCESSED");
      };
    }
  }

  // Remove message if it's a duplicate 
  var isDuplicate = false;
  duplicateCheck = ['from', 'website']

  duplicateCheck.forEach(function(key) {
    if(ownedAccounts.find(item => (item[key]).toLowerCase() === (messageObject[key]).toLowerCase())) {
      isDuplicate = true;
    }
  });

  if(!isDuplicate) {
    ownedAccounts.push(messageObject);
  }

  callback();
}

function checkDuplicate() {

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
      '<td class="text-' + tableClass +'  table-' + tableClass + '">' + storedString + '</td>'
      // + '<td>' + account.date + '</td>'
      // + '<td>' + account.fromEmail + '</td>'
      // + '<td>' + account.body + '</td>';
      // '<strong>' + account.search_query + "</strong>: " + account.title + '" | | "' + account.body;

    list.appendChild(accountRow);
  });

  if(passwords) {
    updateProgressBar(ownedAccounts);
    getNonStoredPasswords();
  }
  
}

function getNonStoredPasswords() {
  var nonStored = passwords;
  var processedStrings = passwords.match(/.*ISPROCESSED.*/gm);
  processedStrings.forEach(function (processedString) {
    nonStored = nonStored.replace(processedString, "");
  });

  var formattedNonStored = passwords.match(/.*ISPROCESSED.*/gm);
  formattedNonStored.forEach(function (processedString) {
    nonStored = nonStored.replace(processedString, "");
  });

  var websiteNames = nonStored.match(/website=.*/gm);
  var titles = nonStored.match(/title=.*/gm);

  console.log(websiteNames);
  console.log(titles);
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
