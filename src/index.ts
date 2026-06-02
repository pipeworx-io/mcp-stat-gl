interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Statistics Greenland (Grønlands Statistik) PxWeb MCP.
 *
 * Keyless PxWeb API. NOTE the database path is /Greenland after /en.
 * Tree nodes have type "l" (folder) or "t" (table). Table IDs carry a
 * ".px"/".PX" suffix (case as returned by the API — pass it through verbatim).
 * PxWeb enforces a per-query cell limit; an empty query ({query: []}) returns
 * the full table, which large tables may reject — narrow with selections.
 */


const BASE = 'https://bank.stat.gl/api/v1/en/Greenland';
const UA = 'pipeworx-mcp-stat-gl/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'subjects',
    description: 'Navigate the subject tree. Nodes are type "l" (folder) or "t" (table).',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Sub-path under /Greenland/ (default empty = root). e.g. "BE/BE01"' } },
    },
  },
  {
    name: 'table_meta',
    description: 'Table definition (dimensions, valid values). Keep the .px/.PX suffix on the table id.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'e.g. "BE/BE01/BEXSAT1.PX"' } },
      required: ['path'],
    },
  },
  {
    name: 'query_table',
    description: 'Pull data from a table. body is a PxWeb query object. PxWeb enforces a per-query cell limit; narrow selections for large tables.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'e.g. "BE/BE01/BEXSAT1.PX"' },
        body: { type: 'object', description: '{query: [{code, selection: {filter, values}}], response: {format: "json-stat2"}}' },
      },
      required: ['path', 'body'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'subjects': {
      const path = (args.path as string | undefined)?.replace(/^\/+|\/+$/g, '') ?? '';
      return statGet(path ? `/${path}` : '/');
    }
    case 'table_meta':
      return statGet(`/${reqStr(args, 'path', '"BE/BE01/BEXSAT1.PX"').replace(/^\/+|\/+$/g, '')}`);
    case 'query_table': {
      const path = reqStr(args, 'path', '"BE/BE01/BEXSAT1.PX"').replace(/^\/+|\/+$/g, '');
      const body = args.body;
      if (!body || typeof body !== 'object') throw new Error('body must be a PxWeb query object.');
      const res = await fetch(`${BASE}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Statistics Greenland: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function statGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Statistics Greenland: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
