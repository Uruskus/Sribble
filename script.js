let isRecording = false;
let recognition;
let fullTranscript = '';

// Backend-URL (lokal oder gehostet)
const BACKEND_URL = 'https://scribble-harc.onrender.com'; // Deine Render-URL

function toggleRecording() {
  const transcriptBox = document.querySelector('.box:first-child'); // Wähle die erste Box (Transkript-Bereich)
  if (!isRecording) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function(event) {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        fullTranscript += finalText;
      }
      document.getElementById('transcript').innerText = fullTranscript + interimText;
    };

    recognition.onend = function() {
      if (isRecording) {
        recognition.start();
      }
    };

    recognition.start();
    isRecording = true;
    document.querySelector('button').innerText = 'Stop';
    transcriptBox.classList.add('active'); // Füge die .active-Klasse hinzu
  } else {
    recognition.stop();
    isRecording = false;
    document.querySelector('button').innerText = 'Start';
    transcriptBox.classList.remove('active'); // Entferne die .active-Klasse
  }
}

function clearTranscript() {
  fullTranscript = '';
  document.getElementById('transcript').innerText = 'Noch nichts aufgezeichnet...';
}

function clearNotes() {
  document.getElementById('notes').value = '';
}

async function saveContent() {
  const transcript = fullTranscript;
  const notes = document.getElementById('notes').value;
  if (!transcript || transcript === 'Noch nichts aufgezeichnet...') {
    alert('Kein Transkript zum Speichern!');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/transcripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, notes }),
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert('Gespeichert!');
      loadTranscripts(); // Liste aktualisieren
      clearTranscript();
      clearNotes();
    }
  } catch (error) {
    console.error(error);
    alert('Fehler beim Speichern – ist der Server gestartet?');
  }
}

async function loadTranscripts() {
  try {
    const response = await fetch(`${BACKEND_URL}/transcripts`);
    const transcripts = await response.json();
    const list = document.getElementById('transcriptList');
    list.innerHTML = '<h2>Gespeicherte Vorlesungen</h2>';
    transcripts.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'transcript-item';
      div.innerHTML = `
        <div>
          <p><strong>Transkript:</strong> ${item.transcript}</p>
          <p><strong>Notizen:</strong> ${item.notes || 'Keine Notizen'}</p>
          <p><strong>Datum:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
        </div>
        <button onclick="deleteTranscript(${index})">Löschen</button>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    alert('Fehler beim Laden der Transkripte');
  }
}

async function deleteTranscript(index) {
  try {
    const response = await fetch(`${BACKEND_URL}/transcripts/${index}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.error) {
      alert(data.error);
    } else {
      loadTranscripts(); // Liste aktualisieren
    }
  } catch (error) {
    console.error(error);
    alert('Fehler beim Löschen');
  }
}

// Transkripte beim Laden der Seite anzeigen
window.onload = loadTranscripts;