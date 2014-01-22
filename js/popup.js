// Allows for access to BG script
// Keeps DB transactions in one place
var bgPage = chrome.extension.getBackgroundPage();

function onCreateNoteButtonClicked(e) {
	changeHeaderView('submit');
}

function onSubmitButtonClicked(e) {

	var noteTextArea = document.getElementById('noteInput');
	bgPage.createNoteFromPopup(noteTextArea.value);

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

function createClearButton() {

	var clearButton = document.createElement('i');
	clearButton.setAttribute('class', 'fa fa-trash-o');
	clearButton.setAttribute('id', 'clearButton');
	clearButton.setAttribute('title', 'Delete');

	clearButton.addEventListener('click', onClearButtonClicked, false);

	return clearButton;

}

function onTextManipButtonClicked(e) {

	if (e.target.id == 'more') {
		e.target.parentElement.children[0].style.display = "block";
		e.target.parentElement.children[1].style.display = "none";
		e.target.className = 'fa fa-chevron-up';
		e.target.id = 'less';
	} else if (e.target.id == 'less') {
		e.target.parentElement.children[1].style.display = "block";
		e.target.parentElement.children[0].style.display = "none";
		e.target.className = 'fa fa-chevron-down';
		e.target.id = 'more';
	}

}

function createTextManipButton(buttonClass, type) {

	var manipBtn = document.createElement('i');
	manipBtn.setAttribute('class', buttonClass);
	manipBtn.setAttribute('id', type);

	manipBtn.addEventListener('click', onTextManipButtonClicked, false);

	return manipBtn;

}

function onEditButtonClicked(e) {
	changeHeaderView('edit');

	var noteTextArea = document.getElementById('editInput');
	noteTextArea.value = e.target.parentElement.firstChild.innerText;
	noteTextArea.setAttribute('data-noteid', e.target.parentElement.id);

}

function createEditButton(buttonClass) {

	var editBtn = document.createElement('i');
	editBtn.setAttribute('class', buttonClass);
	editBtn.setAttribute('title', 'Edit');

	editBtn.addEventListener('click', onEditButtonClicked, false);

	return editBtn;

}

function onLinkClicked(e) {
	bgPage.openLinkClickedInPopup(e.target.href);
}

function createSourceLink(url) {

	var link = document.createElement('a');
	link.setAttribute('href', url);

	if (url.length > 25) {
		link.innerHTML = (url.substr(0, 25) + "...");
	} else {
		link.innerHTML = url;
	}

	link.addEventListener('click', onLinkClicked, false);

	return link;

}

function changeHeaderView(state) {

	var header = document.getElementById('header');

	if (state === "submit") {

		document.getElementById('createNoteButton').style.display = "none";
		document.getElementById('noteInputContainer').style.display = "block";
		document.getElementById('noteInput').focus();

	} else if (state === "edit") {

		document.getElementById('createNoteButton').style.display = "none";
		document.getElementById('noteInputContainer').style.display = "none";
		document.getElementById('noteEditContainer').style.display = "block";
		document.getElementById('editInput').focus();

	} else if (state === "home") {
		document.getElementById('createNoteButton').style.display = "block";
		document.getElementById('noteInputContainer').style.display = "none";
		document.getElementById('noteEditContainer').style.display = "none";
		document.getElementById('noteInput').value = "";
		document.getElementById('editInput').value = "";
	}

}

function removeNoteFromView(id) {

	var parentDiv = document.getElementById('parentDiv');
	var divToRemove = document.getElementById(id);

	parentDiv.removeChild(divToRemove);

}

function createNotePara(text, noteTextClass) {

	var noteText = document.createElement('p');
	noteText.setAttribute('class', noteTextClass);

	noteText.appendChild(document.createTextNode(text));

	return noteText;

}

function createNote(id, text, shortText, url) {

	var noteContainer = document.createElement('div');
	noteContainer.setAttribute('id', id);
	noteContainer.setAttribute('class', 'noteContainer');

	var tagSpan = document.createElement('span');
	tagSpan.setAttribute('class', 'linkTag');
	tagSpan.innerHTML = 'Source: ';

	var sourceLinkLiContainer = document.createElement('li');
	var sourceLink = createSourceLink(url);
	sourceLinkLiContainer.appendChild(sourceLink);

	var noteFull;
	var noteShort;

	noteFull = createNotePara(text, 'noteFull');
	noteFull.style.display = "none";
	noteContainer.appendChild(noteFull);

	noteShort = createNotePara(shortText, 'noteShort');
	noteShort.style.display = "block";
	noteContainer.appendChild(noteShort);

	noteContainer.appendChild(createClearButton());
	noteContainer.appendChild(createEditButton('fa fa-pencil-square-o', 'editButton'));
	noteContainer.appendChild(createTextManipButton('fa fa-chevron-down', 'more'))

	if (url !== "") {
		noteContainer.appendChild(tagSpan);
		noteContainer.appendChild(sourceLinkLiContainer);
	}

	return noteContainer;

}

function addNoteToView(note) {

	var parentDiv = document.getElementById('parentDiv');
	var currentNote = createNote(note.id, note.text, note.shortText, note.url);

	parentDiv.insertBefore(currentNote, parentDiv.firstChild);

	formatNoteHTML(note.id);

}

function replaceNoteInView(note) {

	var noteDiv = document.getElementById(note.id);

	noteDiv.firstChild.innerText = note.text;
	noteDiv.firstChild.nextSibling.innerText = note.shortText;

	formatNoteHTML(note.id);

}

function formatNoteHTML(id) {

	var noteDiv = document.getElementById(id);

	noteDiv.firstChild.innerHTML = noteDiv.firstChild.innerHTML.replace(/\n/g, '<br/>');
	noteDiv.firstChild.nextSibling.innerHTML = noteDiv.firstChild.nextSibling.innerHTML.replace(/\n/g, '<br/>');

	noteDiv.firstChild.innerHTML = noteDiv.firstChild.innerHTML.replace(/\s\s+/g, '<br/><br/>');
	noteDiv.firstChild.nextSibling.innerHTML = noteDiv.firstChild.nextSibling.innerHTML.replace(/\s\s+/g, '<br/><br/>');

}

function resetNotesView() {

	var parentDiv = document.getElementById('parentDiv');
	parentDiv.innerHTML = "";

}

function init() {
	document.getElementById('createNoteButton').addEventListener('click', onCreateNoteButtonClicked, false);
	document.getElementById('submitButton').addEventListener('click', onSubmitButtonClicked, false);
	document.getElementById('cancelSubmitButton').addEventListener('click', onCancelButtonClicked, false);
	document.getElementById('saveEditButton').addEventListener('click', onSaveButtonClicked, false);
	document.getElementById('cancelEditButton').addEventListener('click', onCancelButtonClicked, false);
	bgPage.getPopupView();
	bgPage.loadNotesFromDB();
}

document.onload = init();