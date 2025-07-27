// mcp-servers/clerk-mcp/src/index.ts
import http from 'http';
import { getUserTool } from './tools/clerk-user-reader';

const PORT = process.env.PORT || 3001;

const tools = {
  [getUserTool.name]: getUserTool,
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
  console.log(`Clerk MCP Server listening on port ${PORT}`);
  console.log('Available tools:', Object.keys(tools));
});
