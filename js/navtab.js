let activeTab = "listed-accounts";

function changeTab(targetTab) {
	if(activeTab != targetTab) {
		document.getElementById(activeTab + '-content').style.display = "none";
		document.getElementById(activeTab + '-tab').classList.remove('active');

		document.getElementById(targetTab + '-content').style.display = "block";
		document.getElementById(targetTab + '-tab').classList.add('active');
		activeTab = targetTab;
	}
}