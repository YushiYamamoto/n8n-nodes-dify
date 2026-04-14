# n8n-nodes-dify

[![npm version](https://img.shields.io/npm/v/n8n-nodes-dify.svg)](https://www.npmjs.com/package/n8n-nodes-dify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-ready n8n community node for integrating with [Dify](https://dify.ai/) – the LLM application development platform.

This node is designed with strict governance and security in mind, allowing you to securely connect n8n workflows to Dify APIs using centralized credentials, with provenance-backed npm publishing.

## Features

This package provides a dedicated node for Dify with the following operations:

- **Chat Message** (`POST /chat-messages`): Send a query to a Dify Chat App and receive the AI's response.
- **Run Workflow** (`POST /workflows/run`): Trigger a Dify Workflow App.
- **Text Completion** (`POST /completion-messages`): Execute a Text Generator App for tasks like summarization or translation.
- **Get App Info** (`GET /info`): Retrieve the metadata and configuration of the connected Dify application.

## Installation

### Community Nodes UI (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance.
2. Click **Install**.
3. Enter `n8n-nodes-dify` and click **Install**.

### Manual Installation

Run the following command in your n8n custom nodes directory (e.g., `~/.n8n/custom/`):

```bash
npm install n8n-nodes-dify
```

## Credentials

To use the node, you need to configure the Dify API credentials in n8n:

- **API Key** (_required_): Your Dify API key (from Dify App -> API Access).
- **Base URL** (_required_):
  - For Dify Cloud: Leave as the default `https://api.dify.ai/v1`.
  - For Self-Hosted Dify: Change this to your local or private Dify instance URL (e.g., `http://your-dify-server/v1`).

## ⚠️ Important Limitations & Usage Notes

Please read the following constraints carefully before using this node in a production environment:

- **Streaming is NOT supported**: Currently, all operations force `response_mode: "blocking"`. n8n's internal execution engine relies on batched JSON arrays, making Server-Sent Events (SSE) streaming inherently incompatible with the standard n8n node execution model.
- **AI Tool Usage is Experimental (v1)**: While the node compiles with `usableAsTool: true` to satisfy internal n8n linter requirements, using this package directly as an AI Tool within n8n's Advanced AI nodes is **not officially supported in v1**. n8n requires the `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` environment variable to be set, and the integration remains unstable in the community ecosystem. Use it as a standard standard action node for the best stability.

## Security & Provenance

This package is built and published exclusively via GitHub Actions with **npm provenance**. This ensures full transparency and auditability of the software supply chain. No local publishes or long-lived npm tokens are used in the deployment pipeline.

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Lint code
npm run lint
```

## Package Information

- **Repository**: [https://github.com/YushiYamamoto/n8n-nodes-dify](https://github.com/YushiYamamoto/n8n-nodes-dify)
- **npm**: [https://www.npmjs.com/package/n8n-nodes-dify](https://www.npmjs.com/package/n8n-nodes-dify)

## License

[MIT](LICENSE)
