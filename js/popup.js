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
	location.reload(false);

}

function onClearButtonClicked(e) {

	var parent = e.target.parentElement;
	bgPage.removeNoteFromDB(parent.id, parent.attributes.index.value);
	location.reload(false);

}

function createClearButton() {

	var button = document.createElement('input');
	button.setAttribute('type', 'button');
	button.setAttribute('id', 'clearButton');

	button.addEventListener('click', onClearButtonClicked, false);

	return button;

}

function onTextManipButtonClicked(e) {

	if (e.target.id == 'expand') {
		e.target.parentElement.firstChild.innerText = notes[e.target.parentElement.id].text;
		e.target.src = 'Images/minusButton.png';
		e.target.id = 'subtract';
	} else if (e.target.id == 'subtract') {
		e.target.parentElement.firstChild.innerText = notes[e.target.parentElement.id].text.substr(0, 150) + "...";
		e.target.src = 'Images/addButton.png';
		e.target.id = 'expand';
	}

}

function createTextManipButton(src, type) {

	var image = document.createElement('img');
	image.setAttribute('src', src);
	image.setAttribute('id', type);

	console.log(image);

	image.addEventListener('click', onTextManipButtonClicked, false);

	return image;

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

function createNotePara(text, exceedsTextLimit) {

	var noteText = document.createElement('p');
	noteText.setAttribute('class', 'note');

	if (exceedsTextLimit) {
		noteText.appendChild(document.createTextNode(text.substr(0, 150) + "..."));
	} else {
		noteText.appendChild(document.createTextNode(text));
	}

	return noteText;

}

function createNote(id, text, url, index) {

	var noteContainer = document.createElement('div');
	noteContainer.setAttribute('id', id);
	noteContainer.setAttribute('index', index);
	noteContainer.setAttribute('class', 'noteContainer');

	var tagSpan = document.createElement('span');
	tagSpan.setAttribute('class', 'linkTag');
	tagSpan.innerHTML = 'Source: ';
	
	var sourceLinkLiContainer = document.createElement('li');
	var sourceLink = createSourceLink(url);
	sourceLinkLiContainer.appendChild(sourceLink);

	var noteText;

	if (text.length > 153) {
		noteText = createNotePara(text, true);
		noteContainer.appendChild(noteText);
		noteContainer.appendChild(tagSpan);
		noteContainer.appendChild(sourceLinkLiContainer);
		noteContainer.appendChild(createClearButton());
		noteContainer.appendChild(createTextManipButton('Images/addButton.png', 'expand'));
	} else {
		noteText = createNotePara(text, false);
		noteContainer.appendChild(noteText);
		noteContainer.appendChild(tagSpan);
		noteContainer.appendChild(sourceLinkLiContainer);
		noteContainer.appendChild(createClearButton());
	}

	return noteContainer;

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

function init() {
	document.getElementById('createNoteButton').addEventListener('click', onCreateNoteButtonClicked, false);
	document.getElementById('submitButton').addEventListener('click', onSubmitButtonClicked, false);
	addNotesToView();
}

document.onload = init();