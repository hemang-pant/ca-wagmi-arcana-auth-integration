import "./App.css";
import { useAccount } from "wagmi";

import { Account } from "./account";
import { WalletOptions } from "./wallet-options";
function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      <div className=" align-center m-auto min-w-md max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <ConnectWallet />
      </div>
    </div>
  );
}

export default App;
