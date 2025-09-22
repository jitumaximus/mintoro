import { createServer } from '../server/index';

let appPromise: Promise<any>;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createServer().then(({ app }) => app);
  }
  const app = await appPromise;
  return app(req, res);
}