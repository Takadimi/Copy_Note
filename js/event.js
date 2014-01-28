// All event handler functions are stored here

function onCreateNoteButtonClicked(e) {
	changeHeaderView('submit');
}

function onSubmitButtonClicked(e) {

	var noteTextArea = document.getElementById('noteInput');
	bgPage.createNoteFromPopup(noteTextArea.value);
	changeHeaderView('home');

}

function onSaveButtonClicked(e) {

	var noteTextArea = document.getElementById('editInput');
	bgPage.updateNoteInDB(noteTextArea.getAttribute('data-noteid'), noteTextArea.value);
	changeHeaderView('home');

}

function onCancelButtonClicked(e) {
	changeHeaderView('home');
}

function onClearButtonClicked(e) {

	var parent = e.target.parentElement;
	bgPage.removeNoteFromDB(parent.id);

	removeNoteFromView(parent.id);

}

function onLinkClicked(e) {
	bgPage.openLinkClickedInPopup(e.target.href);
}

function onTextManipButtonClicked(e) {

	var noteText = e.target.parentElement.firstChild;

	if (e.target.id == 'more') {
		noteText.style.height = "100%";
		e.target.className = 'fa fa-chevron-up';
		e.target.id = 'less';
		e.target.parentElement.style.backgroundColor = "rgba(245, 232, 198, 0.3)";
	} else if (e.target.id == 'less') {
		noteText.style.height = "17px";
		e.target.className = 'fa fa-chevron-down';
		e.target.id = 'more';
		e.target.parentElement.style.backgroundColor = "";
	}

}

function onEditButtonClicked(e) {

	changeHeaderView('edit');

	var noteTextArea = document.getElementById('editInput');
	noteTextArea.value = e.target.parentElement.firstChild.innerText;
	noteTextArea.setAttribute('data-noteid', e.target.parentElement.id);

}

function event_init() {

	document.getElementById('createNoteButton').addEventListener('click', onCreateNoteButtonClicked, false);
	document.getElementById('submitButton').addEventListener('click', onSubmitButtonClicked, false);
	document.getElementById('cancelSubmitButton').addEventListener('click', onCancelButtonClicked, false);
	document.getElementById('saveEditButton').addEventListener('click', onSaveButtonClicked, false);
	document.getElementById('cancelEditButton').addEventListener('click', onCancelButtonClicked, false);

}