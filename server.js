const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
     console.log(`Server is up on port ${port}: http://localhost:${port}/`);
});
app.use(express.static('public'));
