var express = require('express');
const app = express();
const port = 300;

app.get('/hello', (req, res) =>{
    res.send("Hello World! Rea")
});
app.get('/', (req, res) =>{
    res.send("Hello World! Rea")
});

app.listen(port, () => {
    console.log('Example app listening on port');
})

