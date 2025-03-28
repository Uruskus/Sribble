console.log('Starte Server...'); // Debugging-Ausgabe

try {
  const express = require('express');
  const app = express();
  app.use(express.json());

  // CORS erlauben
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    next();
  });

  // Transkripte im Speicher halten (temporäre Lösung)
  let transcripts = [];

  // Alle Transkripte und Notizen abrufen
  app.get('/transcripts', (req, res) => {
    try {
      res.json(transcripts);
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
    }
  });

  // Neues Transkript und Notizen speichern
  app.post('/transcripts', (req, res) => {
    const { transcript, notes } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transkript fehlt' });
    }

    try {
      transcripts.push({ transcript, notes, timestamp: new Date().toISOString() });
      res.json({ message: 'Gespeichert!' });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      res.status(500).json({ error: 'Fehler beim Speichern' });
    }
  });

  // Transkript löschen (nach Index)
  app.delete('/transcripts/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    try {
      if (index >= 0 && index < transcripts.length) {
        transcripts.splice(index, 1);
        res.json({ message: 'Gelöscht!' });
      } else {
        res.status(400).json({ error: 'Ungültiger Index' });
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      res.status(500).json({ error: 'Fehler beim Löschen' });
    }
  });

  // Verwende den von Render zugewiesenen Port
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
} catch (error) {
  console.error('Fehler beim Starten des Servers:', error);
  process.exit(1);
}