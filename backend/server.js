const express = require('express');
const cors = require('cors');
const db = require('./database'); // Import the database module

// Initializing app
const app = express();

// App has to be connected to frontend
app.use(cors());
app.use(express.json());
//in this code, we are getting all info
//from the db and giving it to the frontend
//...row is the spread operator, which gives us
//all the values in the row object, like getting all 
//values of a dict in python. after that, we are parsing
// parents id because sqllite does not support
// arrays
app.get('/api/nodes', (req,res) => {
    console.log('Frontend asked for nodes!');
//What is []? It's a "Parameter Substitution Array"
//not necessary but good practice, helps sometimes
//eg db.all('SELECT * FROM books WHERE id = ?', [123],...)
//here, only the book ids which are 123 will be shown
    db.all('SELECT * FROM nodes', [], (err, rows) => {
        if (err) {
            console.error('Failed to retrieve nodes:', err);
            return res.status(500).json({ error: 'Failed to retrieve nodes' });
        }
        else {
            const nodes = rows.map(row => ({
                ...row,
                phase: parseInt(row.phase, 10),
                categories: row.categories ? JSON.parse(row.categories) : [],
                parentIds: row.parentIds ? JSON.parse(row.parentIds) : []
            }));
            console.log(`Retrieved ${nodes.length} nodes from database.`);
            res.json(nodes);
        }
    });
});

app.post('/api/nodes', (req, res) => {
    const newNodes = req.body;
    console.log(`Received ${newNodes.length} nodes to update.`);

    // Use db.serialize to ensure operations happen in order
    db.serialize(() => {
        // Step 1: Delete all existing nodes
        db.run('DELETE FROM nodes', (err) => {
            if (err) {
                console.error('Failed to clear existing nodes:', err);
                return res.status(500).json({ error: 'Failed to clear existing nodes' });
            }

            // Step 2: Insert all new nodes in a single transaction
            const stmt = db.prepare(`
                INSERT INTO nodes (id, name, phase, categories, parentIds)
                VALUES (?, ?, ?, ?, ?)
            `);

            let completed = 0;
            const total = newNodes.length;

            // Insert each node
            newNodes.forEach((node) => {
                stmt.run(
                    node.id,
                    node.name,
                    node.phase,
                    JSON.stringify(node.categories || []),
                    JSON.stringify(node.parentIds || []),
                    (err) => {
                        if (err) {
                            console.error('Failed to insert node:', err);
                        }
                        completed++;
                        
                        // Only finalize when ALL inserts are done
                        if (completed === total) {
                            stmt.finalize(() => {
                                console.log(`Successfully saved ${completed} nodes to database`);
                                res.json({ message: 'Nodes updated successfully!' });
                            });
                        }
                    }
                );
            });
        });
    });
});

//delete stuff
//good practice to use the url for which we
// have to delete
app.delete('/api/nodes/:id', (req, res) => {
    const nodeToDelete = req.params.id;
    console.log(`attempting to delete id ${nodeToDelete}`);
    //here, have to use function to use this
    db.run(`DELETE FROM nodes WHERE id = ?`, [nodeToDelete], function(err) {
        if (err) {
            console.error('Failed to delete node:', err);
            res.status(500).json({ error: 'Failed to delete node' });
            return ;
        }

    //sql property, changes, used with
    //java this
        if(this.changes === 0) {
            console.log(`No node found with id ${nodeToDelete}`);
            res.status(404).json({ error: 'Node not found' });
            return ;
        }
        console.log(`Node with id ${nodeToDelete} deleted successfully`);
        res.json({ message: 'Node deleted successfully!' });
    });
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log('💾 Connected to SQLite database (nodes.db)');
});