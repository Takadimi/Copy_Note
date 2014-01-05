// Background script to run persistently 
// while the browser is running.

var cnDB;
var request = indexedDB.open('cnDB', 1);
var notes = new Array();

/* TEMPLATE FOR NOTE OBJECTS */
// var note = {
// 	text: "",
// 	id: "",
// 	url: ""
// };

request.onsuccess = function(e) {
	cnDB = request.result;
	loadNotesFromDB();
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
};

function transError(e) {
	console.error("Error in cnDB transaction");
	console.log(e);
};

/************************************* 
  Functions for adding notes to the DB
**************************************/

function addNoteToDB(note) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.add(note);

	request.onsuccess = function(e) {
		// TODO: Potentially a bad idea, and maybe 
		//could be done more elegantly.
		notes.splice(0, 0, note);
		console.log("Note added");
	};

	request.onerror = function(e) {
		console.log("Error adding note");
	};

};

// Creates a note from the text area in popup.html
function createNoteFromPopup(text) {

	var note = {
		text: text,
		id: "",
		url: ""
	};

	addNoteToDB(note);

};

// Creates a note from right-clicking highlighted text
function createNoteFromWebPage(info, tab) {

	var note = {
		text: info.selectionText,
		id: "",
		url: tab.url
	};

	console.log(note);
	addNoteToDB(note);

};

/**************************************** 
  Functions for getting notes from the DB
****************************************/

function getNotes() {
	return notes;
};

function setNotes(e) { 

	var cursor = e.target.result;

	if (cursor) {

		cursor.value.id = cursor.key;

		notes.push(cursor.value);
		console.log(cursor.value);

		cursor.continue();

	}

};

function loadNotesFromDB() {

	var transaction = cnDB.transaction(['cnDBStore'], 'readonly');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	objectStore.openCursor(null, 'prev').onsuccess = setNotes;

};

// TODO: Create a remove/delete note function

chrome.contextMenus.create({id: 'cnID', title: 'Copy Note', contexts: ['selection']}, function() {
	console.log("Context Menu successfully created");
});

chrome.contextMenus.onClicked.addListener(createNoteFromWebPage);