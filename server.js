console.log('Starte Server...'); // Debugging-Ausgabe

try {
  const express = require('express');
  const fs = require('fs').promises;
  const path = require('path');

  const app = express();
  app.use(express.json());

  // CORS erlauben
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    next();
  });

  // Datei, in der die Daten gespeichert werden
  const DATA_FILE = path.join(__dirname, 'data.json');

  // Initialisiere die Datei, falls sie nicht existiert
  async function initDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch (error) {
      console.log('Erstelle neue data.json...');
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
  }
  initDataFile();

  // Alle Transkripte und Notizen abrufen
  app.get('/transcripts', async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      res.status(500).json({ error: 'Fehler beim Abrufen der Daten' });
    }
  });

  // Neues Transkript und Notizen speichern
  app.post('/transcripts', async (req, res) => {
    const { transcript, notes } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transkript fehlt' });
    }

    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const transcripts = JSON.parse(data);
      transcripts.push({ transcript, notes, timestamp: new Date().toISOString() });
      await fs.writeFile(DATA_FILE, JSON.stringify(transcripts, null, 2));
      res.json({ message: 'Gespeichert!' });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      res.status(500).json({ error: 'Fehler beim Speichern' });
    }
  });

  // Transkript löschen (nach Index)
  app.delete('/transcripts/:index', async (req, res) => {
    const index = parseInt(req.params.index, 10);
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const transcripts = JSON.parse(data);
      if (index >= 0 && index < transcripts.length) {
        transcripts.splice(index, 1);
        await fs.writeFile(DATA_FILE, JSON.stringify(transcripts, null, 2));
        res.json({ message: 'Gelöscht!' });
      } else {
        res.status(400).json({ error: 'Ungültiger Index' });
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      res.status(500).json({ error: 'Fehler beim Löschen' });
    }
  });

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
} catch (error) {
  console.error('Fehler beim Starten des Servers:', error);
  process.exit(1);
}