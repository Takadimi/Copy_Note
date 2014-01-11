// Allows for access to BG script
// Keeps DB transactions in one place
var bgPage = chrome.extension.getBackgroundPage();
var notes;

function onImageClicked(e) {
	// TODO: Consider changing these to html buttons instead of images
	// It might look better...
	console.log(e);

	if (e.target.id == 'expand') {
		e.target.parentElement.firstChild.innerText = notes[e.target.parentElement.id].text;
		e.target.src = 'Images/minusButton.png';
		e.target.id = 'subtract';
	} else if (e.target.id == 'subtract') {
		e.target.parentElement.firstChild.innerText = notes[e.target.parentElement.id].text.substr(0, 150);
		e.target.src = 'Images/addButton.png';
		e.target.id = 'expand';
	}

}

function createTextManipButton(src, type) {

	var image = document.createElement('img');
	image.setAttribute('src', src);
	image.setAttribute('id', type);

	console.log(image);

	image.addEventListener('click', onImageClicked, false);

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

function createNote(text, exceedsTextLimit) {

	var note = document.createElement('p');
	note.setAttribute('class', 'note');

	if (exceedsTextLimit) {
		note.appendChild(document.createTextNode(text.substr(0, 150) + "..."));
	} else {
		note.appendChild(document.createTextNode(text));
	}

	return note;

}

function createNoteContainer(id) {

	var div = document.createElement('div');
	div.setAttribute('id', id);
	div.setAttribute('class', 'noteContainer');

	return div;

}

function addNoteToContainer(id, text, url) {

	var parentDiv = document.getElementById('parentDiv');

	var childDiv = createNoteContainer(id);
	var note;
	var tagSpan = document.createElement('span');
	tagSpan.setAttribute('class', 'tag');
	tagSpan.innerHTML = 'Source: ';
	var sourceLinkLiContainer = document.createElement('li');
	var sourceLink = createSourceLink(url);
	sourceLinkLiContainer.appendChild(sourceLink);

	// TODO: Think about moving this logic to 'createNoteContainer'
	// It might make more sense there...
	if (text.length > 153) {
		note = createNote(text, true);
		childDiv.appendChild(note);
		childDiv.appendChild(tagSpan);
		childDiv.appendChild(sourceLinkLiContainer);
		childDiv.appendChild(createTextManipButton('Images/addButton.png', 'expand'));
	} else {
		note = createNote(text, false);
		childDiv.appendChild(note);
		childDiv.appendChild(tagSpan);
		childDiv.appendChild(sourceLinkLiContainer);
	}

	parentDiv.appendChild(childDiv);
	parentDiv.appendChild(document.createElement('hr'));

}

function addNotesToView() {

	notes = bgPage.getNotes();

	for (var i = 0; i < notes.length; i++) {
		notes[i].id = i;
		addNoteToContainer(notes[i].id, notes[i].text, notes[i].url);
	}

}

function init() {
	addNotesToView();
}

document.onload = init();