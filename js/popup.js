// Allows for access to BG script
// Keeps DB transactions in one place
var bgPage = chrome.extension.getBackgroundPage();
var notes;

function onImageClicked(e) {
	console.log(e);
}

function createTextManipImage(src) {

	var image = document.createElement('img');
	image.setAttribute('src', src);

	image.onClicked.addListener(onImageClicked);

	return image;

}

function createNote(text) {

	var note = document.createElement('p');
	note.setAttribute('class', 'note');
	note.appendChild(document.createTextNode(text));

	return note;

}

function createNoteContainer(id) {

	var div = document.createElement('div');
	div.setAttribute('id', id);
	div.setAttribute('class', 'noteContainer');

	return div;

}

function addNoteToView(id, text) {

	var parentDiv = document.getElementById("parentDiv");

	var childDiv = createNoteContainer(id);
	var note = createNote(text);

	childDiv.appendChild(note);
	parentDiv.appendChild(childDiv);

}

function addNotesToView() {

	// bgPage.loadNotesFromDB();
	notes = bgPage.getNotes();

	for (var i = 0; i < notes.length; i++) {
		addNoteToView(notes[i].id, notes[i].text);
	}

}

document.onload = addNotesToView();