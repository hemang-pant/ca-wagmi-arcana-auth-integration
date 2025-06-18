import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./utils/config";
import { CAProvider } from "@arcana/ca-wagmi";
import { CA } from "@arcana/ca-sdk";

const queryClient = new QueryClient();
const ca = new CA();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CAProvider client={ca}>
          <App />
        </CAProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
