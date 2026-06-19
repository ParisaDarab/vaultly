import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

await connectDB(process.env.MONGO_URI as string);

app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
