let listedTable = document.getElementById('listed-account-table-body');
let unlistedTable = document.getElementById('unlisted-account-table-body');
let statisticsDiv = document.getElementById('statistics-content');

let listedAccountCount = document.getElementById("listedAccountCount");
let unlistedAccountCount = document.getElementById("unlistedAccountCount");

let unlistedAccounts = [];

function toggleAccountListing(accountId) {
	let accountRow = document.getElementById(accountId);
	let table = accountRow.parentElement.id;

	if(table == 'listed-account-table-body') {
		unlistAccount(accountId);
		unlistedAccounts.push(accountId);
	}

	if(table == 'unlisted-account-table-body') {
		listAccount(accountId);
		var index = unlistedAccounts.indexOf(accountId);
		if (index !== -1) {
		    unlistedAccounts.splice(index, 1);
		}
	}
	
	localStorage.setItem("unlistedAccounts", JSON.stringify(unlistedAccounts));
	updateProgressBar(ownedAccounts)
}

function unlistAccount(accountId) {
	let accountRow = document.getElementById(accountId);

	unlistedTable.appendChild(accountRow);
	listedAccountCount.innerText = parseInt(listedAccountCount.innerText) - 1;
	unlistedAccountCount.innerText = parseInt(unlistedAccountCount.innerText) + 1;
	
}

function listAccount(accountId) {
	let accountRow = document.getElementById(accountId);

	listedTable.appendChild(accountRow);
	listedAccountCount.innerText = parseInt(listedAccountCount.innerText) + 1;
	unlistedAccountCount.innerText = parseInt(unlistedAccountCount.innerText) - 1;
}

function initializeUnlistedAccounts() {
	if (localStorage.getItem("unlistedAccounts") === null) {
		localStorage.setItem("unlistedAccounts", JSON.stringify([]));
	}
	unlistedAccounts = JSON.parse(localStorage.getItem("unlistedAccounts"));
	unlistedAccounts.forEach(function(accountId) {
		unlistAccount(accountId);
	});
}