const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const pg = require('pg');
const cors = require('cors');

app.set('view engine', 'ejs');
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Database configuration
const dbConfig = {
    user: 'analytics_user',
    password: '8sJb9nizLYv6h!@BiN7k',
    host: 'analytic-nub78-solution.cluster-cdntcvzvcppw.us-east-1.rds.amazonaws.com',
    database: 'zendatawarehouse',
    port: 5432,
    ssl: false
};

// Create a new PostgreSQL client
const client = new pg.Client(dbConfig);

// Connect to the database
client.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});
const employee_data = null;

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: false }));

// Define a route to handle the form submission
app.post('/employee_data', (req, res) => {
    const id_employee = req.body.id_empelado;
    console.log(id_employee)
    const query = `
        SELECT e.id_employee, e.first_name, e.last_name, e.job_title, c.city_name, s.state_name, c2.country_name
        FROM employee e
        JOIN employee_location el ON e.id_employee = el.id_employee 
        JOIN city c ON c.id_city = el.id_city 
        JOIN state s ON s.id_state = el.id_state 
        JOIN country c2 ON c2.id_country = el.id_country 
        WHERE e.id_employee = `+id_employee;
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(result.rows[0])
        const data = result.rows[0];
        res.send({ employee_data: data });
    });
});

app.post('/country', (req, res) => {
    const query = `select id_country, country_name  from country c`;
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(result.rows)
        const data = result.rows;
        res.send({ countries: data });
    });
});

app.post('/state', (req, res) => {
    const id_country = req.body.id_country;
    console.log(id_country)
    const query = `select id_state, state_name  from state s where id_country =`+id_country;
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(result.rows)
        const data = result.rows;
        res.send({ states: data });
    });
});

app.post('/city', (req, res) => {
    const id_state = req.body.id_state;
    console.log(id_state)
    const query = `select id_city, city_name  from city c where id_state =`+id_state;
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(result.rows)
        const data = result.rows;
        res.send({ cities: data });
    });
});

app.put('/update', (req, res) => {
    const {id_employee,id_state,id_country,id_city} = req.body;
    const query = `UPDATE employee_location SET id_country = `+id_country+`, id_state = `+id_state+ `, id_city = `+id_city+ ` WHERE id_employee =`+id_employee;
    console.log(query)
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(`Employee with ID ${id_employee} updated`);
        res.send(`Employee with ID ${id_employee} updated`);
    });
});

app.get('/all', (req, res) => {
    const query = `select  * from employee e `;
    console.log(query)
    client.query(query, (err, result) => {
        if (err) throw err;
        console.log(result.rows)
        const data = result.rows;
        res.send({ employees: data });
    });
});


/* app.get("/",(req,res)=>{
    res.render('page', { employee_data });
}); */

app.listen(PORT, function () { console.log(`Servidor corriendo en el puerto ${PORT}`) });