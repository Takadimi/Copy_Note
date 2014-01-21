// Allows for access to BG script
// Keeps DB transactions in one place
var bgPage = chrome.extension.getBackgroundPage();
var notes;

function onCreateNoteButtonClicked(e) {

	var createNoteButton = document.getElementById('createNoteButton');
	createNoteButton.style.display = "none";

	var noteInputContainer = document.getElementById('noteInputContainer');
	noteInputContainer.style.display = "block";

}

function onSubmitButtonClicked(e) {

	var noteTextArea = document.getElementById('noteInput');
	bgPage.createNoteFromPopup(noteTextArea.value);

	noteTextArea.value = "";

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
	console.log("Edit button clicked");
}

function createEditButton(buttonClass) {

	var editBtn = document.createElement('i');
	editBtn.setAttribute('class', buttonClass);

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

	parentDiv.appendChild(currentNote);

}

function addNotesToView() {

	notes = bgPage.getNotes();
	var parentDiv = document.getElementById('parentDiv');
	var note;

	for (var i = 0; i < notes.length; i++) {
		notes[i].index = i;
		console.log(notes[i]);
		note = createNote(notes[i].id, notes[i].text, notes[i].url, notes[i].index);
		parentDiv.appendChild(note);
		parentDiv.appendChild(document.createElement('hr'));
	}

}

function resetNotesView() {

	var parentDiv = document.getElementById('parentDiv');

	parentDiv.innerHTML = "";

}

function init() {
	document.getElementById('createNoteButton').addEventListener('click', onCreateNoteButtonClicked, false);
	document.getElementById('submitButton').addEventListener('click', onSubmitButtonClicked, false);
	bgPage.getPopupView();
	bgPage.loadNotesFromDB();
}

document.onload = init();