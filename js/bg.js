// Background script to run persistently
// while the browser is running.

var cnDB;
var request = indexedDB.open('cnDB', 1);
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

	var objectStore = db.createObjectStore('cnDBStore', {autoIncrement: true});

};

function transComplete(e) {
	console.log("cnDB transaction complete");
}

function transError(e) {
	console.error("Error in cnDB transaction");
	console.log(e);
}

/*Functions for adding/remove notes to the DB*/

function addNoteToDB(note) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.add(note);

	request.onsuccess = function(e) {
		console.log("Note added");
		loadNotesFromDB();
	};

	request.onerror = function(e) {
		console.log("Error adding note");
	};

}

function removeNoteFromDB(id, index) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.delete(Number(id));

	request.onsuccess = function(e) {
		console.log("Note " + id + " removed");
		loadNotesFromDB();
	};

	request.onerror = function(e) {
		console.log("Error removing note " + id);
	};

}

function shortenText(fullText) {

	var shortText = fullText.substr(0, 150) + "...";

	return shortText;

}

// Creates a note from the textarea in popup.html
function createNoteFromPopup(text) {

	var note = {
		text: text,
		shortText: "",
		url: "",
		timeStamp: new Date().getTime()
	};

	if (text.length > 150) {
		shortText = shortenText(text);
	}

	console.log(note);
	addNoteToDB(note);

}

// Creates a note from right-clicking highlighted text
function createNoteFromWebPage(info, tab) {

	var note = {
		text: info.selectionText,
		shortText: "",
		url: info.pageUrl,
		timeStamp: new Date().getTime()
	};

	if (info.selectionText.length > 150) {
		shortText = shortenText(text);
	}

	console.log(note);
	addNoteToDB(note);

}

/*Functions for getting notes from the DB*/

function setNotes(e) {

	var cursor = e.target.result;

	if (cursor) {

		cursor.value.id = cursor.key;
		popupPage.addNoteToView(cursor.value);

		cursor.continue();

	}

}

function loadNotesFromDB() {

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