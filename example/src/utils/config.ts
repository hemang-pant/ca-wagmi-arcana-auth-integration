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

const auth = new AuthProvider(`xar_test_58eeafa5256e97d4e58e872b283551b655104e1f`)
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
