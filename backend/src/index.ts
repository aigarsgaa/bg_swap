import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bggRoutes from './routes/bgg';

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/bgg', bggRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Board Game Swap API is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
