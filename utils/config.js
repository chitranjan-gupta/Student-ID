export const port = process.env.PORT ? Number(process.env.PORT) : 5000;
export const frontpoint = process.env.URL
  ? `https://${process.env.URL}`
  : `http://localhost:${port}`;
