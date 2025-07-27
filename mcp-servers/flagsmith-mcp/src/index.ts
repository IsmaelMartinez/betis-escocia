// mcp-servers/flagsmith-mcp/src/index.ts
import http from 'http';
import { getFlagTool } from './tools/flagsmith-reader';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env.local') });

const PORT = process.env.PORT || 3002;

const tools = {
  [getFlagTool.name]: getFlagTool,
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST' && req.url === '/mcp') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { toolName, params } = JSON.parse(body);
        const tool = tools[toolName];

        if (tool) {
          const result = await tool.execute(params);
          res.statusCode = 200;
          res.end(JSON.stringify({ result }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Tool not found' }));
        }
      } catch (error: any) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Flagsmith MCP Server listening on port ${PORT}`);
  console.log('Available tools:', Object.keys(tools));
});
