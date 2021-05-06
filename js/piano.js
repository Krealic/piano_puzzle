requirejs.config({
    baseUrl: 'js/lib',
});


// Variable which tell us what step of the game we're on.
// We'll use this later when we parse noteOn/Off messages
var currentStep = 0;

// Lock 1 variables
var correctNoteSequence = [69, 67, 64, 62, 71, 64, 64, 65]; // AGEDBEEF
var activeNoteSequence = [];
var highlightNums = "51740"

function readRandNums() {
    var file = new XMLHttpRequest();
    file.onreadystatechange = function() {
      if (file.readyState === 4) {  // Makes sure the document is ready to parse
        if (file.status === 200) {  // Makes sure it's found the file
          text = file.responseText;
          document.getElementById("code").textContent = text;
        }
      }
    }
    file.open("GET", "./data_files/rand.txt");
    file.send();
}

window.onLoad = readRandNums();


if (navigator.requestMIDIAccess) {
	console.log('This browser supports WebMIDI!');

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

} else {
	console.log('WebMIDI is not supported in this browser.');
	document.querySelector('.step1').innerHTML = 'Error: This browser does not support WebMIDI.';
}

function onMIDISuccess(midiAccess) {
	var inputs = midiAccess.inputs;
	var outputs = midiAccess.outputs;

	for (var input of midiAccess.inputs.values()) {
		input.onmidimessage = getMIDIMessage;
	}
}

function onMIDIFailure() {
	document.querySelector('.step1').innerHTML = 'Error: Could not access MIDI devices. Connect a device and refresh to try again.';
}

function getMIDIMessage(message) {
	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

	switch (command) {
		case 144: // noteOn
			if (velocity > 0) {
				noteOnListener(note, velocity);
				// console.log(note); // Uncomment to send note values to the console
			}
		// we could easily expand this switch statement to cover other types of commands such as controllers or sysex
	}
}


function noteOnListener(note, velocity) {

	switch(currentStep) {

		// The first lock - playing a correct sequence
		case 0:
			// add the note to the array
			activeNoteSequence.push(note);

			// show the requisite number of note placeholders
			for (var i = 0; i < activeNoteSequence.length; i++) {
				document.querySelector('.step1 .note:nth-child(' + (i + 1) + ')').classList.add('on');
			}

			// when the array is the same length as the correct sequence, compare the two
			if (activeNoteSequence.length == correctNoteSequence.length) {
				var match = true;
				for (var index = 0; index < activeNoteSequence.length; index++) {
					if (activeNoteSequence[index] != correctNoteSequence[index]) {
						match = false;
						break;
					}
				}

				if (match) {
					// Run the next sequence and increment the current step
					runSequence('lock1');
					currentStep++;
				} else {
					// Clear the array and start over
					activeNoteSequence = [];

					var lockInput = document.querySelector('.step1 .lock-input');

					lockInput.classList.add('error');
					window.setTimeout(function(){
						lockInput.classList.remove('error');
						for (var note of lockInput.querySelectorAll('.note')) {
							note.classList.remove('on');
						}
					}, 500);

				}
			}
			break;
	}
}

function runSequence(sequence) {
	switch(sequence) {

		case 'lock1':
			// code to trigger animations and give clue for the next lock
			advanceScreen();
			successFlicker();
			highLighter();
			break;
	}
}

function advanceScreen() {
    document.querySelector('body').dataset.step++;
}

function successFlicker() {
	var b = document.querySelector('body')
	b.classList.add('success');
	window.setTimeout(function(){
		b.classList.remove('success');
	}, 2500);
}

function highLighter() {
    requirejs(['mark'],
    function (Mark) {
        var code = new Mark(document.getElementById("code"));
        code.mark(highlightNums, {
            "accuracy": "partially"
        });
    });
}
