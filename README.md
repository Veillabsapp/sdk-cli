# Veil Labs SDK & CLI

[![NPM Version](https://img.shields.io/npm/v/veillabs-cli.svg)](https://www.npmjs.com/package/veillabs-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)

Veil Labs provides a privacy-first SDK and CLI for cross-chain swaps, multi-destination distribution (Private Seed), and anonymous transfers.

---

## 🚀 Features

- **Privacy-First**: No registration or tracking. All operations are designed to maximize user anonymity.
- **Cross-Chain Swaps**: Seamlessly exchange assets between different blockchains.
- **Private Seed**: Distribute a single deposit to multiple destination wallets with different assets and networks in one go.
- **Live Tracking**: Built-in real-time status monitoring for all transactions.
- **Optimized for Bun**: High-performance execution using the Bun runtime.

---

## 📦 Installation

### As a Global CLI
Install globally to use the `veillabs` command anywhere:
```bash
npm install -g veillabs-cli
# or using bun
bun add -g veillabs-cli
```

### One-off Usage (No Install)
Run directly without installing using `npx` or `bunx`:
```bash
npx veillabs-cli market currencies
# or using bun
bunx veillabs-cli market currencies
```

### As an SDK Dependency
Add to your project to build on top of the Veil Labs API:
```bash
npm install veillabs-cli
# or using bun
bun add veillabs-cli
```

---

## 🛠 CLI Usage

The CLI provides a "live dashboard" experience directly in your terminal.

### Market Data
List supported tokens and networks:
```bash
veillabs market currencies
```

Get a rate estimate:
```bash
veillabs market estimate eth:eth btc:btc 0.5
```

### Private Swaps
Initiate a quick 1-to-1 swap:
```bash
veillabs swap create eth:eth btc:btc 0.5 <destination_address>
```

### Private Seed (Multi-distribution)
Start the interactive wizard to set up a multi-destination flow:
```bash
veillabs seed create
```
*Follow the on-screen prompts to define destinations and percentages.*

### Universal Tracking
Monitor the progress of any transaction:
```bash
veillabs track <id>
```

---

## 🧑‍💻 SDK Usage

The SDK is built with TypeScript, providing full type safety and a modular design.

```typescript
import { VeilLabsClient } from 'veillabs-cli';

const client = new VeilLabsClient({
  baseUrl: 'https://trade.veillabs.app/api'
});

// 1. Get supported currencies
const currencies = await client.market.getCurrencies();
console.log(currencies);

// 2. Create a private swap
const swap = await client.swap.create({
  tickerFrom: 'eth',
  networkFrom: 'eth',
  tickerTo: 'btc',
  networkTo: 'btc',
  amount: '0.1',
  addressTo: '0x...',
});

console.log(`Tracking ID: ${swap.id}`);
console.log(`Please deposit to: ${swap.addressFrom}`);

// 3. Track status
const status = await client.swap.getStatus(swap.id);
console.log(`Current Status: ${status.status}`);
```

---

## ⚙️ Configuration

By default, the SDK and CLI communicate with `https://trade.veillabs.app/api`. You can override this using the `--base-url` flag in the CLI or the `baseUrl` property in the `VeilLabsClient` configuration.

---

## 📄 License

MIT © [Veil Labs](https://veillabs.app)
