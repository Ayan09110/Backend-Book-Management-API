const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');


db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER,
        status TEXT NOT NULL CHECK (status IN ('to-read', 'reading', 'completed'))
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Books table ready');
    }
});


const app = express();

app.use(express.json());

// Basic route to test the server
app.get('/', (req, res) => {
    res.send('Express server is running on port 3000!');
});


//get all
app.get('/books', (req, res) => {
    let sql;
    let params = [];
    if(req.query.status){
        sql = `SELECT * FROM books WHERE status = ?;`;
        params = [req.query.status];
    }
    else sql = `SELECT * FROM books;`;
    db.all(sql, params, (err, rows) => {
        if(err) res.status(500).json({ error: err.message});
        else{
            res.json(rows);
        }
    });
});

//get id
app.get('/books/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM books WHERE id = ?;`;
    db.get(sql, [id], (err, row) => {
        if(err) res.status(500).json({ error: err.message});
        else if(!row) res.status(404).json({ error: "Book Not Found"});
        else{
            res.json(row);
        }
    });
});
//post
app.post('/books', (req,res) => {
    const { title, author, year, status} = req.body;
    if(!title || !author || !status){
        return res.status(400).json({ error: "title, author, and status are required"});
    }
    const allowedStatuses = ['to-read', 'reading', 'completed'];
    if(!allowedStatuses.includes(status)){
        return res.status(400).json({ error: "status must be to-read, reading, or completed"});
    }
    const sql = `INSERT INTO books (title, author, year, status)
    VALUES (?, ?, ?, ?);`;
    db.run(sql, [title, author, year || null, status], function(err){
        if(err){
            res.status(500).json({ error: err.message});
        } else{
            res.status(201).json({ id: this.lastID});
        }
    });
});
//put id
app.put('/books/:id', (req,res) => {
    const {id} = req.params;
    const { title, year, status} = req.body;
    if(status){
        const allowedStatuses = ['to-read', 'reading', 'completed'];
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({ error: "status must be to-read, reading, or completed"});
        }
    }
    const sql = `UPDATE books SET title = ?, year = ?, status = ?
    WHERE id = ?;`;
    db.run(sql, [title, year, status, id], function(err){
        if(err){
            res.status(500).json({ error: err.message});
        } else if(this.changes === 0){
            res.status(404).json({ error: "Book not found"});
        } else{
            res.json({ id, title, year, status});
        }
    });
});
//delete
app.delete('/books/:id', (req,res) => {
    const {id} = req.params;
    const sql = `DELETE FROM books WHERE id = ?;`;
    db.run(sql, [id], function(err){
        if(err) return res.status(500).json({ error: err.message});
        else if(this.changes === 0){
            res.status(404).json({ error: "Book not found"});
        }else{
            res.json({ message: "Book deleted successfully", id: parseInt(id) });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});