import { http, createConfig } from "wagmi";
import {
  mainnet,
  optimism,
  base,
  arbitrum,
  scroll,
  linea,
  polygon,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ArcanaConnector } from "@arcana/auth-wagmi"
import { AuthProvider } from "@arcana/auth/esm";

const auth = new AuthProvider(`xar_live_adad629c14269c2cb330abf87f0d0cbc5ff73fbc`)
const connector = ArcanaConnector({
    auth: auth as any
})

export const config = createConfig({
  chains: [mainnet, optimism, arbitrum, base, scroll, linea, polygon],
  connectors: [injected(), connector],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [scroll.id]: http(),
    [linea.id]: http(),
    [polygon.id]: http(),
  },
});
