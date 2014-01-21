// Background script to run persistently
// while the browser is running.

var cnDB;
var request = indexedDB.open('cnDB', 2);
var popupPage;

/* TEMPLATE FOR NOTE OBJECTS */
// var note = {
//  text: "",
//  shortText: "",
//  id: "",
//  url: "",
// };

request.onsuccess = function(e) {
	cnDB = request.result;
	console.log(cnDB);
};

request.onerror = function(e) {
	console.log(e.srcElement.error.message);
};

request.onupgradeneeded = function(e) {

	var db = e.target.result;
	console.log(db);

	if (db.objectStoreNames.contains('cnDBStore')) {
		db.deleteObjectStore('cnDBStore');
	}

	var objectStore = db.createObjectStore('cnDBStore', {autoIncrement: true, keyPath: 'id'});

};

function transComplete(e) {
	console.log("cnDB transaction complete");
}

function transError(e) {
	console.error("Error in cnDB transaction");
	console.log(e);
}

/*Functions for adding/remove notes to the DB*/

function addNoteToDB(note, sourceOfNote) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.add(note);

	request.onsuccess = function(e) {
		console.log("Note added");
	};

	request.onerror = function(e) {
		console.log("Error adding note");
	};

}

function removeNoteFromDB(id) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.delete(Number(id));

	request.onsuccess = function(e) {
		console.log("Note " + id + " removed");
	};

	request.onerror = function(e) {
		console.log("Error removing note " + id);
	};

}

function updateNoteInDB(id, updatedText) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.get(Number(id));

	request.onerror = function(e) {
		console.log("Error retrieving note" + id);
	};

	request.onsuccess = function(e) {

		var note = request.result;
		note.fullText = updatedText;
		note.shortText = updatedText;

		if (updatedText.length > 70) {
			note.shortText = shortenText(updatedText);
		}

		var requestUpdate = objectStore.put(note);

		requestUpdate.onsuccess = function(e) {
			console.log("Note updated");
		};

		requestUpdate.onerror = function(e) {
			console.log("Error updating note");
		};

	};

}

function shortenText(fullText) {

	var shortText = fullText.substr(0, 70) + "...";

	return shortText;

}

// Creates a note from the textarea in popup.html
function createNoteFromPopup(text) {

	var note = {
		text: text,
		shortText: text,
		url: "",
		id: new Date().getTime()
	};

	if (text.length > 70) {
		note.shortText = shortenText(text);
	}

	console.log(note);
	addNoteToDB(note, 'popup');
	popupPage.addNoteToView(note);

}

// Creates a note from right-clicking highlighted text
function createNoteFromWebPage(info, tab) {

	var note = {
		text: info.selectionText,
		shortText: info.selectionText,
		url: info.pageUrl,
		id: new Date().getTime()
	};

	if (info.selectionText.length > 70) {
		note.shortText = shortenText(info.selectionText);
	}

	console.log(note.shortText);
	console.log(note);
	addNoteToDB(note, 'webPage');

}

/*Functions for getting notes from the DB*/

function setNotes(e) {

	var cursor = e.target.result;

	if (cursor) {

		console.log(cursor.value);
		// cursor.value.id = cursor.key;
		popupPage.addNoteToView(cursor.value);

		cursor.continue();

	}

}

function loadNotesFromDB() {

	popupPage.resetNotesView();

	var transaction = cnDB.transaction(['cnDBStore'], 'readonly');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	objectStore.openCursor(null, 'prev').onsuccess = setNotes;

}

function openLinkClickedInPopup(url) {

	chrome.tabs.create({url: url}, function(tab) {
		console.log("Opened new tab from popup ");
		console.log(tab);
	});

}

function getPopupView() {

	popupPage = chrome.extension.getViews({type: "popup"})[0];
	console.log(popupPage);

}

chrome.contextMenus.create({id: 'cnID', title: 'Copy Note', contexts: ['selection']}, function() {
	console.log("Context Menu successfully created");
});

chrome.contextMenus.onClicked.addListener(createNoteFromWebPage);