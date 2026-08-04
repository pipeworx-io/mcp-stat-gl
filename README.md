# mcp-stat-gl

Statistics Greenland (Grønlands Statistik) PxWeb MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `subjects` | Browse the Statistics Greenland (Grønlands Statistik) PxWeb subject tree under the /Greenland database. Empty path returns root folders (type 'l') and tables (type 't'); supply a sub-path like 'BE/BE01' to drill deeper. Table IDs carry a '.px' or '.PX' suffix — pass verbatim to table_meta or query_table. |
| `table_meta` | Fetch dimension definitions and valid coded values for a Statistics Greenland PxWeb table. Path must be the full sub-path ending in '.px'/'.PX' (e.g. 'BE/BE01/BEXSAT1.PX'). Returns dimensions with codes and value lists — use these to build the selection body for query_table. |
| `query_table` | POST a PxWeb query to a Statistics Greenland table and return observations as json-stat2. body must be {query:[{code, selection:{filter,values}}], response:{format:'json-stat2'}}. An empty query ({query:[]}) requests the full table but may be rejected for large tables — narrow selections using codes from table_meta. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "stat-gl": {
      "url": "https://gateway.pipeworx.io/stat-gl/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Stat Gl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
