// Allows for access to BG script
// Keeps DB transactions in one place
var bgPage = chrome.extension.getBackgroundPage();

function createClearButton() {

	var clearButton = document.createElement('i');
	clearButton.setAttribute('class', 'fa fa-trash-o');
	clearButton.setAttribute('id', 'clearButton');
	clearButton.setAttribute('title', 'Delete');

	clearButton.addEventListener('click', onClearButtonClicked, false);

	return clearButton;

}

function createTextManipButton(buttonClass, type) {

	var manipBtn = document.createElement('i');
	manipBtn.setAttribute('class', buttonClass);
	manipBtn.setAttribute('id', type);

	manipBtn.addEventListener('click', onTextManipButtonClicked, false);

	return manipBtn;

}

function createEditButton(buttonClass) {

	var editBtn = document.createElement('i');
	editBtn.setAttribute('class', buttonClass);
	editBtn.setAttribute('title', 'Edit');

	editBtn.addEventListener('click', onEditButtonClicked, false);

	return editBtn;

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

// Alters the display state of certain elements in the header
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

function createNote(id, text, url) {

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
	noteFull.style.display = "block";
	noteContainer.appendChild(noteFull);

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
	var currentNote = createNote(note.id, note.text, note.url);

	parentDiv.insertBefore(currentNote, parentDiv.firstChild);

	formatNoteHTML(note.id);

}

// Takes an existing note div and updates it after it's been edited
function replaceNoteInView(note) {

	var noteDiv = document.getElementById(note.id);

	noteDiv.firstChild.innerText = note.text;

	formatNoteHTML(note.id);

}

// Replaces common string interpretations of new lines with break statements
function formatNoteHTML(id) {

	var noteDiv = document.getElementById(id);

	noteDiv.firstChild.innerHTML = noteDiv.firstChild.innerHTML.replace(/\n/g, '<br/>');
	noteDiv.firstChild.nextSibling.innerHTML = noteDiv.firstChild.nextSibling.innerHTML.replace(/\n/g, '<br/>');

	noteDiv.firstChild.innerHTML = noteDiv.firstChild.innerHTML.replace(/\s\s+/g, '<br/><br/>');
	noteDiv.firstChild.nextSibling.innerHTML = noteDiv.firstChild.nextSibling.innerHTML.replace(/\s\s+/g, '<br/><br/>');

}
// Cleans the div that holds all of the individual notes any time
// there is a call to load the notes from the DB
function resetNotesView() {

	var parentDiv = document.getElementById('parentDiv');
	parentDiv.innerHTML = "";

}

function init() {
	event_init();
	bgPage.getPopupView();
	bgPage.loadNotesFromDB();
}

document.onload = init();