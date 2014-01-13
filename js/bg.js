// Background script to run persistently 
// while the browser is running.

var cnDB;
var request = indexedDB.open('cnDB', 1);
var notes = new Array();

/* TEMPLATE FOR NOTE OBJECTS */
// var note = {
// 	text: "",
// 	id: "",
// 	url: "",
//  key: ""
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

/*Functions for adding/remove notes to the DB*/

function addNoteToDB(note) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.add(note);

	request.onsuccess = function(e) {
		// This is a bit of a hack to make sure the two notes
		// arrays are synced up.
		notes.splice(0, 0, note);
		console.log("Note added");
	};

	request.onerror = function(e) {
		console.log("Error adding note");
	};

};

function removeNoteFromDB(id, index) {

	var transaction = cnDB.transaction(['cnDBStore'], 'readwrite');

	transaction.oncomplete = transComplete;
	transaction.onerror = transError;

	var objectStore = transaction.objectStore('cnDBStore');
	var request = objectStore.delete(Number(id));

	request.onsuccess = function(e) {
		console.log("Note " + id + " removed");
		// Same as the hack for adding notes, just in reverse
		notes.splice(Number(index), 1);
	}

	request.onerror = function(e) {
		console.log("Error removing note " + id);
	}

}

// Creates a note from the textarea in popup.html
function createNoteFromPopup(text) {

	var note = {
		text: text,
		id: "",
		url: "",
		index: ""
	};

	console.log(note);
	addNoteToDB(note);

};

// Creates a note from right-clicking highlighted text
function createNoteFromWebPage(info, tab) {

	var note = {
		text: info.selectionText,
		id: "",
		url: info.pageUrl,
		index: ""
	};

	console.log(note);
	addNoteToDB(note);

};

/*Functions for getting notes from the DB*/

function getNotes() {
	return notes;
};

function setNotes(e) { 

	var cursor = e.target.result;

	if (cursor) {

		cursor.value.id = cursor.key;
		notes.push(cursor.value);

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

function openLinkClickedInPopup(url) {

	chrome.tabs.create({url: url}, function(tab) {
		console.log("Opened new tab from popup ");
		console.log(tab);
	});

};

chrome.contextMenus.create({id: 'cnID', title: 'Copy Note', contexts: ['selection']}, function() {
	console.log("Context Menu successfully created");
});

chrome.contextMenus.onClicked.addListener(createNoteFromWebPage);