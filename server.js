const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Ruta al archivo de la base de datos
const dbPath = path.join(__dirname, 'registros.sqlite');

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error al conectar con SQLite:', err.message);
  else console.log('Conectado a SQLite');
});

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      estante TEXT,
      hora_inicio TEXT,
      hora_fin TEXT,
      tiempo_transcurrido INTEGER
    )
  `);
});

app.use(bodyParser.json());
app.use(express.static(__dirname)); // sirve index.html

// Endpoint para guardar registros
app.post('/guardar', (req, res) => {
  const { nombre, estante, horaInicio, horaFin, tiempoTranscurrido } = req.body;

  if (!nombre || !horaInicio || !horaFin || !estante || tiempoTranscurrido == null) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  // Convertir las fechas a objetos Date y luego a ISO string
  const horaInicioISO = new Date(horaInicio).toISOString();
  const horaFinISO = new Date(horaFin).toISOString();

  // Insertar en la base de datos
  const sql = `INSERT INTO registros (nombre, estante, hora_inicio, hora_fin, tiempo_transcurrido) VALUES (?, ?, ?, ?, ?)`;
  const params = [nombre, estante, horaInicioISO, horaFinISO, tiempoTranscurrido];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error al insertar registro:', err.message);
      return res.status(500).json({ success: false, message: 'Error al guardar datos' });
    }
    res.json({ success: true, message: 'Datos guardados correctamente.', id: this.lastID });
  });
});


// Endpoint para consultar registros (opcional)
app.get('/registros', (req, res) => {
  db.all('SELECT * FROM registros ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error al consultar:', err.message);
      return res.status(500).send('Error al consultar datos');
    }

    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

const { stringify } = require('csv-stringify/sync'); // npm install csv-stringify

app.get('/exportar-csv', (req, res) => {
  const { nombre, fechaInicio, fechaFin } = req.query;

  let query = 'SELECT * FROM registros WHERE 1=1';
  const params = [];

  if (nombre) {
    query += ' AND nombre = ?';
    params.push(nombre);
  }

  if (fechaInicio) {
    const fechaInicioMenosUno = new Date(new Date(fechaInicio).getTime())
      .toISOString()
      .slice(0, 10);
    query += ' AND datetime(hora_inicio) >= datetime(?)';
    params.push(fechaInicioMenosUno); // sin cambio aquí
  }

  if (fechaFin) {
    // sumo 1 día para incluir toda la fechaFin
    const fechaFinMasUno = new Date(new Date(fechaFin).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    query += ' AND datetime(hora_fin) < datetime(?)';
    params.push(fechaFinMasUno);
  }

  query += ' ORDER BY id ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al leer datos para CSV:', err.message);
      return res.status(500).send('Error al generar CSV');
    }

    const rowsLocal = rows.map(row => ({
      ...row,
      hora_inicio: new Date(row.hora_inicio).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
      hora_fin: new Date(row.hora_fin).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
    }));

    const csv = stringify(rowsLocal, {
      header: true,
      columns: {
        id: 'ID',
        nombre: 'Nombre',
        estante: 'Estante',
        hora_inicio: 'Hora Inicio',
        hora_fin: 'Hora Fin',
        tiempo_transcurrido: 'Tiempo (seg)'
      }
    });

    res.setHeader('Content-disposition', 'attachment; filename=registros_filtrados.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  });
});


