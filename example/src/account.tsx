import {
  useAccount,
  useDisconnect,
  useEnsName,
  useSwitchChain,
  // useSendTransaction
} from "wagmi";
import {
  useSendTransaction,
  useWriteContract,
  useBalanceModal,
  useBalance,
} from "@arcana/ca-wagmi";
import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";

import { useState } from "react";
import Decimal from "decimal.js";
import { erc20Abi } from "viem";
const toaster = createToaster({
  placement: "top-end",
  overlap: false,
  gap: 24,
  duration: 10000,
});

const createSuccessToast = (chain: number, hash: `0x${string}`) => {
  toaster.create({
    title: "Success",
    description: "Transaction submitted!",
    type: "info",
    action: {
      label: "Show in explorer",
      onClick: () => {
        const base = idToExplorer[chain];
        if (base) {
          window.open(new URL(`/tx/${hash}`, base), "_blank");
        }
      },
    },
  });
};

export function Account() {
  const { sendTransaction } = useSendTransaction();
  const [allLoading, setLoading] = useState(false);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { showModal } = useBalanceModal();
  const { loading } = useBalance({ symbol: "ETH" });
  const { switchChainAsync } = useSwitchChain();
  const { writeContract } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);

      const toFV = formData.get("to");
      const chainFV = formData.get("chain");
      const assetFV = formData.get("asset");
      const amountFV = formData.get("amount");
      if (!toFV || !chainFV || !assetFV || !amountFV) {
        throw new Error("missing params");
      }
      const to = toFV as `0x${string}`;
      const chain = Number(chainFV);
      const asset = assetFV as "usdc" | "usdt" | "eth";
      await switchChainAsync({ chainId: chain });

      let amount = new Decimal(amountFV as string);
      if (asset.toLowerCase() === "ETH".toLowerCase()) {
        amount = amount.mul(new Decimal(10).pow(18));
        const value = BigInt(amount.toString());
        sendTransaction(
          {
            to,
            value,
          },
          {
            onSuccess(hash) {
              createSuccessToast(chain, hash);
              form.reset();
              setLoading(false);
              console.log("success");
            },
            onSettled() {
              console.log("settled");
            },
            onError(error) {
              console.log({ error });
              form.reset();
              setLoading(false);
            },
          }
        );
      } else {
        const chainData = chainToCurrency[chain];
        const s = chainData[asset === "usdc" ? 0 : 1];
        if (!s) {
          throw new Error("asset not supported");
        }

        writeContract(
          {
            address: s,
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, BigInt(amount.mul(new Decimal(10).pow(6)).toString())],
          },
          {
            onSuccess(hash) {
              createSuccessToast(chain, hash);
              form.reset();
              setLoading(false);
              console.log("success");
            },
            onError(error) {
              form.reset();
              setLoading(false);
              console.log({ error });
            },
          }
        );
      }
    } catch (e) {
      form.reset();
      console.log({ e });
      setLoading(false);
    }
  };
  return (
    <>
      <Toaster toaster={toaster} className="w-full">
        {(toast) => (
          <Toast.Root className="flex items-center w-full max-w-md p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800">
            <Toast.Description className="basis-3/6 flex items-center">
              <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="sr-only">Check icon</span>
              </div>
              <div className="ms-3 text-sm font-normal">
                {toast.description}
              </div>
            </Toast.Description>
            {toast.action && (
              <Toast.ActionTrigger className="cursor-pointer basis-2/6 text-sm font-medium text-blue-600 p-1.5 hover:bg-blue-100 rounded-lg dark:text-blue-500 dark:hover:bg-gray-700">
                {toast.action?.label}
              </Toast.ActionTrigger>
            )}
            <Toast.CloseTrigger className="basis-1/6">
              <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                data-dismiss-target="#toast-danger"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
      {loading ? (
        <div role="status" className="flex items-center justify-center">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-center p-4 mb-4 font-bold leading-none tracking-tight text-gray-900 border-2 border-gray-200 rounded-lg dark:text-white">
            {address && ensName ? `${ensName} (${address})` : address}
          </p>
          <div className="mb-4 m-auto flex justify-center">
            <button
              className="cursor-pointer text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
            <button
              className="cursor-pointer text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
              onClick={() => showModal()}
            >
              Show balances
            </button>
          </div>
          <div className="mb-4 m-auto"></div>
          <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                To
              </label>
              <input
                name="to"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="0x..."
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Destination Chain
              </label>
              <select
                required
                name="chain"
                id="chain"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                defaultValue={""}
              >
                <option value="" disabled>
                  Select a chain
                </option>

                <option value="42161">Arbitrum One</option>
                <option value="59144">Linea</option>
                <option value="534352">Scroll</option>
                <option value="10">Optimism</option>
                <option value="8453">Base</option>
                <option value="1">Ethereum</option>
                <option value="137">Polygon POS</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Asset
              </label>
              <select
                name="asset"
                id="asset"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                defaultValue={""}
              >
                <option value="" disabled>
                  Select an asset
                </option>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
                <option value="eth">ETH</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Amount
              </label>
              <input
                name="amount"
                type="text"
                id="amount"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={allLoading}
              className="cursor-pointer text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {allLoading && (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              Submit
              <svg
                className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </form>
        </>
      )}
    </>
  );
}

const chainToCurrency: {
  [k: number]: [`0x${string}` | null, `0x${string}` | null];
} = {
  10: [
    "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  ],
  137: [
    "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  ],
  42161: [
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  ],
  1: [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  ],
  8453: ["0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", null],
  534352: [
    "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
    "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
  ],
  59144: [
    "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
    "0xa219439258ca9da29e9cc4ce5596924745e12b93",
  ],
};

const idToExplorer: { [k: number]: string } = {
  1: "https://etherscan.io/",
  10: "https://optimistic.etherscan.io/",
  137: "https://polygonscan.com/",
  42161: "https://arbiscan.io/",
  8453: "https://basescan.org/",
  534352: "https://scrollscan.com/",
  59144: "https://lineascan.build/",
};
