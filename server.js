const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const config = {
    server: '127.0.0.1',    
    database: 'young_professionals_db',  
    user: 'my_user',            
    password: 'my_password',    
    options: {
        encrypt: true,         
        trustServerCertificate: true,  
    },
    port: 1433                  
};

// Create a connection pool
let pool;

sql.connect(config)
    .then((poolInstance) => {
        pool = poolInstance;
        console.log('Connected to the database!');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

// API endpoint to handle form submission
app.post('/api/submit', (req, res) => {
  const { wing, division, status, dateVacancyArise, dateVacancyAdvertised, dateAppointment } = req.body;
  console.log(req.body);

  const query = `
    INSERT INTO young_professionals (wing, division, status, date_vacancy_arise, date_vacancy_advertised, date_appointment)
    VALUES (@wing, @division, @status, @dateVacancyArise, @dateVacancyAdvertised, @dateAppointment)
  `;

  pool.request()
    .input('wing', sql.NVarChar, wing)
    .input('division', sql.NVarChar, division)
    .input('status', sql.NVarChar, status)
    .input('dateVacancyArise', sql.Date, dateVacancyArise || null)
    .input('dateVacancyAdvertised', sql.Date, dateVacancyAdvertised || null)
    .input('dateAppointment', sql.Date, dateAppointment || null)
    .query(query)
    .then(() => {
      res.status(200).send('Data saved successfully!');
    })
    .catch((err) => {
      console.error('Error inserting data:', err); 
  res.status(500).send(`Error saving data to the database: ${err.message}`);
    });
});


app.get('/api/professionals', (req, res) => {
  const query = `
    SELECT id, wing, division, status, date_vacancy_arise, date_vacancy_advertised, date_appointment
    FROM young_professionals
  `;

  pool.request()
    .query(query)
    .then((result) => {
      const response = {
        data: result.recordset,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
      res.status(500).send('Error retrieving data from the database.');
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
