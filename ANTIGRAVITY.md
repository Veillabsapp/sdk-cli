# Veildex SDK & CLI: Analysis and Design

This document provides a detailed blueprint for the **Veildex SDK** (TypeScript/JavaScript library) and the **Veildex CLI** (Command Line Interface). These tools are designed to provide developers and power users with seamless, private, and efficient access to the Veildex ecosystem.

---

## 1. Requirement Analysis & API Mapping

The Veildex SDK and CLI will interface with the following core API modules as defined in the [API Documentation](file:///Users/billlaxcode/Projects/Eki/veildex/API_DOCUMENTATION.md).

### API to SDK/CLI Mapping Table

| Feature Area | API Endpoint | SDK Method | CLI Command |
| :--- | :--- | :--- | :--- |
| **Market Data** | `GET /api/currencies` | `client.market.getCurrencies()` | `veildex market currencies` |
| | `GET /api/pairs/:t/:n` | `client.market.getPairs(ticker, net)` | `veildex market pairs <t> <n>` |
| | `GET /api/estimates` | `client.market.getEstimate(params)` | `veildex market estimate` |
| | `GET /api/ranges` | `client.market.getRanges(params)` | `veildex market ranges` |
| **Private Swap** | `POST /api/exchanges` | `client.swap.create(params)` | `veildex swap create` |
| | `GET /api/exchanges/:id` | `client.swap.getStatus(id)` | `veildex swap status <id>` |
| **Private Seed** | `POST /api/seed/create` | `client.seed.create(params)` | `veildex seed create` |
| | `GET /api/seed/status/:id` | `client.seed.getStatus(id)` | `veildex seed status <id>` |
| **Proxy Transfer** | `POST /api/transfer` | `client.transfer.single(params)` | `veildex transfer single` |
| | `POST /api/transfer/multi`| `client.transfer.multi(params)` | `veildex transfer multi` |
| **Universal** | `GET /api/tracking/:id` | `client.track(id)` | `veildex track <id>` |
| | `GET /api/volume` | `client.stats.getVolume()` | `veildex stats volume` |

---

## 2. Veildex SDK Design (TypeScript)

The SDK will be built as a modular TypeScript library, ensuring type safety and ease of integration for both frontend and backend applications.

### Architecture Overview
- **Main Client Class**: `VeildexClient` – The entry point for all operations.
- **Namespaced Sub-clients**: `market`, `swap`, `seed`, `transfer`, `stats`.
- **Request Engine**: Uses `axios` or `fetch` with built-in retry logic and error handling.
- **Models/Types**: Standardized interfaces for request payloads and responses.

### SDK Usage Example

```typescript
import { VeildexClient } from '@veillabs/sdk';

const client = new VeildexClient({
  baseUrl: 'https://veildex.io/api', // Default
  // No auth required for most endpoints
});

// 1. Get Market Data
const currencies = await client.market.getCurrencies();

// 2. Create a Private Swap
const swap = await client.swap.create({
  tickerFrom: 'eth',
  networkFrom: 'eth',
  tickerTo: 'btc',
  networkTo: 'btc',
  amount: '0.1',
  addressTo: 'bc1q...',
});

console.log(`Tracking ID: ${swap.id}`);

// 3. Track Progress
const status = await client.track(swap.id);
console.log(`Current Status: ${status.status}`);
```

---

## 3. Veildex CLI Design (Node.js)

The CLI will be a binary tool (`veildex`) built using `commander.js` and `enquirer` for interactive prompts. It will favor privacy and streamline the "swap and forget" workflow.

### CLI Command Structure

> [!TIP]
> Use `--json` flag on any command to output raw JSON data for scripting.

#### Market Commands
- `veildex market currencies`: List all supported tokens.
- `veildex market estimate <from> <to> <amount>`: Quick rate check.

#### Transaction Commands
- `veildex swap <from> <to> <amount> <address>`: Initiate a quick swap.
- `veildex seed <from> <to> <amount>`: Starts an interactive wizard to configure multi-destination distribution.
- `veildex track <id>`: Live-polls the status of a transaction with a progress bar.

#### Privacy/Proxy Commands
- `veildex transfer <to> <amount> --network bsc --token bnb`: Obfuscated transfer.
- `veildex transfer-multi`: Wizard-based multi-distribution for proxy transfers.

### CLI Interaction Mockup

```bash
$ veildex swap eth btc 0.5 bc1q...

[Veildex] Initiating Private Swap: 0.5 ETH -> BTC
[Veildex] Internal Tracking ID: V31L-XM29-K8L1
[Veildex] Please deposit 0.5 ETH to: 0x9876...5432

Waiting for deposit... [████░░░░░░░░] 33% (Confirming)
```

---

## 4. Security & Privacy Guidelines

### Sensitive Data Handling
> [!WARNING]
> The `Proxy Transfer` feature requires a `privateKey`. 
> - **SDK Users**: Ensure `privateKey` is handled via environment variables and never hardcoded or logged.
> - **CLI Users**: Use the `--prompt-key` flag to enter the private key securely without it appearing in command history.

### Privacy Integration
- **Zero Storage**: The CLI should clear its local cache (if any) after a transaction reaches a terminal state (`finished` or `failed`).
- **Endpoint Privacy**: All SDK requests will be designed to mask user metadata (e.g., custom headers) when communicating with the Veildex API.

---

## 5. Development Roadmap

1.  **Phase 1 (Core SDK)**: Build the base `VeildexClient` and Market/Swap modules.
2.  **Phase 2 (CLI Foundation)**: Implement core CLI commands (`currencies`, `swap`, `track`).
3.  **Phase 3 (Advanced Features)**: Add Private Seed and Proxy Transfer support to both SDK and CLI.
4.  **Phase 4 (Packaging)**: NPM publication (`@veillabs/sdk`) and binary distribution.

---

## 6. Analysis Summary

The current Veildex API is well-structured and follows a clean RESTful pattern, making it highly suitable for SDK/CLI abstraction. The separation of **Intake** (Swap/Seed) and **Execution** (Status/Tracking) allows the CLI to provide a high-quality "Live Dashboard" experience even in a terminal environment.

Implementing these tools will significantly lower the barrier for developers building on Veildex and provide power users with an alternative to the web UI.
