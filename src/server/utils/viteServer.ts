import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from '../app';

const PORT = parseInt(process.env.PORT || '3000', 10);

export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`logweb Express server running on port ${PORT}`);
  });
}
