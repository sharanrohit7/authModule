require('dotenv').config()
import { app } from './app';
import { db } from './config/db';

const port = process.env.PORT || 8080;
(async () => {
    try {
      const connection = await db();
      // Use the connection object to execute queries, etc.
      console.log('Connection acquired successfully!');
      
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  })();
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});