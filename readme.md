# Chain Abstraction (Wagmi PnP)

The Arcana `ca-wagmi` SDK simplifies Web3 apps built with the Wagmi library by providing a unified balance across blockchains through easy-to-use `useBalance` and `useBalanceModal` hooks. It also replaces the Wagmi hooks `useSendTransaction` and `useWriteContract` to support chain-abstracted transactions. 

## Quick start

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { CAProvider } from '@arcana/ca-wagmi'
import { App } from "./App"

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CAProvider>
          <App />
        </CAProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

```ts
App.jsx

// import { useSendTransaction } from 'wagmi'
import { useSendTransaction } from '@arcana/ca-wagmi'
import { parseEther } from 'viem'

function App() {
  const { sendTransaction } = useSendTransaction()

  return (
    <button
      onClick={() =>
        sendTransaction({
          to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
          value: parseEther('0.01'),
        })
      }
    >
      Send transaction
    </button>
  )
}
```

## Hooks

There are two kinds of hooks implemented by the `ca-wagmi` SDK. 

* Wagmi hooks (Re-implemented / Replaced)
* Arcana `ca-wagmi` hooks to enable unified balance and chain abstracted transactions

### Wagmi Hooks

Following Wagmi hooks have been replaced by the Arcana `ca-wagmi` SDK to ensure chain abstraction is enabled automatically in the transaction flow with no changes to the app code.

```ts
import { useSendTransaction, useWriteContract } from "@arcana/ca-wagmi"

// Replaces `wagmi` hook: `useSendTransaction`
const { sendTransaction, sendTransactionAsync } = useSendTransaction() 

// Replaces `wagmi` hook: `useWriteContract`
const { writeContract, writeContractAsync } = useWriteContract() 
```

### Arcana `ca-wagmi` Hooks

The following hooks allow developers to access unified balance and enable chain abstracted bridge and transfer operations in a Wagmi app.

* [useBalance](#usebalance)
* [useBalances](#usebalances)
* [useBalanceModal](#usebalancemodal)
* [useCAFn](#usecafn)

#### useBalance
<hr>
Get the unified balance across all supported chains associated with the EoA for the specified token symbol. 

##### Usage

`useBalance({ symbol: string })`

| Parameter | Required | Type | Description |
| :-------- | :------- | :--- | :---------- |
| symbol | yes | string | Should be one of the supported currencies |

```javascript
import { useBalance } from "@arcana/ca-wagmi"

const balance = useBalance({ symbol: "eth" })
```

##### Response

| Field | Type |
| :-----| :--- |
| loading | `boolean` |
| data | `{ symbol: string, decimals: number, formatted: string, value: bigint} \| null` |
| error | `Error \| null` |

**Sample Response**

```js
{
    loading: false,
    data: {
      symbol: "ETH",
      decimals: 18,
      formatted: "0.000785657313049966"
      value: 785657313049966n
    },
    error: null
} 
```

#### useBalances
<hr>

Get the unified balances across all supported chains associated with the EoA for every supported token type.  

##### Usage

`useBalances()`

```javascript
import { useBalances } from "@arcana/ca-wagmi"

const balances = useBalances()
```

##### Response

| Parameter | Type |
| :-------- | :--- |
| loading   | `boolean` |
| data      | `UseBalanceValue[] \| null` |
| error     | `Error \| null` |

**Sample Response**

```js
{
  loading: false,
  data: [{
    symbol: "ETH",
    decimals: 18,
    formatted: "0.000785657313049966"
    value: 785657313049966n,
    breakdown: [{
      chain: {
        id: 1,
        name: "Ethereum",
        logo: "..."
      },
      formatted: "0.000785657313049966",
      address: "0x0000000000000000000000000000000000000000",
      value: 785657313049966n
    }]
  }],
  error: null
} 
```

#### useBalanceModal
<hr>

Display or hide the popup displaying the unified balance in the context of the user EoA.

##### Usage

`useBalanceModal()`

```javascript
import { useBalanceModal } from "@arcana/ca-wagmi"

const { showModal, hideModal } = useBalanceModal()
```

##### Response

| Field | Type |
| :-------- | :-------- |
| showModal | `() => void` |
| hideModal | `() => void` |

#### useCAFn
<hr>

Initiate a chain abstracted `bridge` or `transfer` function in the context of the user EoA.

##### Usage

`useCAFn()`

```javascript
import { useCAFn } from "@arcana/ca-wagmi"

const { bridge, transfer } = useCAFn()
 
await bridge({
  token: "usdt",
  amount: "1.5",
  chain: 42161
})

const hash = await transfer({
  to: "0x80129F3d408545e51d051a6D3e194983EB7801e8",
  token: "usdt",
  amount: "1.5",
  chain: 10
})
```

##### Response

| Field | Type |
| :---- | :-------- |
| bridge | `({ token: string, amount: string, chain: number }) => Promise<unknown>` |
| transfer | `({ token: string, amount: string, chain: number, to: "0x${string}" }) => Promise<unknown>` |
