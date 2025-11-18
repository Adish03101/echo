// npm init -y done in backend to initialize to a new node project

//npm install express cors, express is for server running, cosr is for connection between 
//backend and frontend. now, backend is at other server and fortend is at another server
const express = require('express');
const cors = require('cors');

//initializing app
const app = express();

//app has to be connected to frontend
app.use(cors());

//to parse json data
app.use(express.json());

//initializing empty array to store stuff
let nodes = [];  // ← Changed 'node' to 'nodes' to match frontend

//either get stuff by giving info or post stuff by asking for info
app.get('/api/nodes', (req, res) => {
    console.log('frontend asked for nodes!', nodes.length, 'nodes');  // ← Fixed typo
    res.json(nodes); //sending response from backend - the nodes data
});

//request is what is sent to the backend
//we are using its body to update our nodes
//later will be saved in db
app.post('/api/nodes', (req, res) => {  // ← Fixed parenthesis
    const newNodes = req.body;
    nodes = newNodes;
    res.json({message: 'Nodes updated successfully!'});
});

//server config - start listening
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//curl and url to test the backend in a new 
//terminal , after running this one