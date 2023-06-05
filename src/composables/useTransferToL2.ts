
import { useCallback } from 'react';
//import { constants } from 'starknet';
import { EventName } from '@starkware-industries/commons-js-enums';
import { useAccount as useL2Account } from "@starknet-react/core";
import { useAccount as useL1Account, useWaitForTransaction } from "wagmi";

//import { useSelectedToken } from '../providers/TransferProvider';
import { useBridgeContract } from './useBridgeContract';
import { useTokenContractAPI } from './useTokenContract';
/*import { useTransferToL2Tracking } from './useTracking';
import { useTransfer } from './useTransfer';
import { useIsMaxTotalBalanceExceeded } from './useIsMaxTotalBalanceExceeded';
import { useTransfersLog } from '../providers/TransfersLogProvider';*/

import { ChainType, tokens } from '@/constants/tokens';
import { TransferStep, TransferToL2Steps } from '@/constants/transferSteps';
import { useTransfer } from './useTransfer';
import { useTransferProgress } from './useTransferProgress';
import { useTransfersLog } from '@/app/providers/TransfersLogProvider';

export const ActionType = {
    TRANSFER_TO_L2: 1,
    TRANSFER_TO_L1: 2
};

export const stepOf = (step: any, steps: any) => {
    return steps.indexOf(step);
};

export const useTransferToL2 = () => {
    //onst [trackInitiated, trackSuccess, trackError, trackReject] = useTransferToL2Tracking();
    const { deposit, depositReceipt } = useBridgeContract();
    const { allowance, approve } = useTokenContractAPI();
    // const { account: l1Account, config: configL1 } = useL1Wallet();

    const { address: l1Account } = useL1Account();
    const { address: l2Account } = useL2Account();

    const { handleProgress, handleData, handleError } = useTransfer(TransferToL2Steps);
    //const selectedToken = useSelectedToken();
    const progressOptions = useTransferProgress();
    //const isMaxTotalBalanceExceeded = useIsMaxTotalBalanceExceeded();

    //TODO refactor for wagmi/SN-react
    const { addTransfer } = useTransfersLog();
    const network =
        process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "GOERLI" : "MAIN";
    const tokenAddressL2 = tokens.L2.LORDS.tokenAddress?.[ChainType.L2[network]]
    const l1BridgeAddress = tokens.L1.LORDS.bridgeAddress?.[ChainType.L1[network]] as `0x${string}`

    return useCallback(
        async (amount: any) => {

            const onTransactionHash = (error: any, transactionHash: string) => {
                if (!error) {
                    console.log('Tx signed', { transactionHash });
                    handleProgress(
                        progressOptions.deposit(amount, 'Lords', stepOf(TransferStep.DEPOSIT, TransferToL2Steps))
                    );
                }
            };

            const onDeposit = (event: any) => {
                console.log('Deposit event dispatched', event);
                //trackSuccess(event.transactionHash);
                const transferData = {
                    type: ActionType.TRANSFER_TO_L2,
                    sender: l1Account,
                    recipient: l2Account,
                    l1hash: event.transactionHash,
                    name,
                    symbol: 'Lords',
                    amount,
                    event
                };
                addTransfer(transferData);
                handleData(transferData);
            };

            /* const maybeAddToken = async () => {
                 const [, error] = await promiseHandler(addToken(tokenAddressL2));
                 if (error) {
                     console.warn(error.message);
                 }
             };*/

            try {
                console.log('TransferToL2 called');
                /*const { exceeded, currentTotalBalance, maxTotalBalance } = await isMaxTotalBalanceExceeded(
                    amount
                );
                if (exceeded) {
                    const error = progressOptions.error(TransferError.MAX_TOTAL_BALANCE_ERROR, null, {
                        maxTotalBalance,
                        symbol,
                        currentTotalBalance,
                        amount
                    });
                    console.error(`Prevented ${symbol} deposit due to maxTotalBalance exceeded`);
                    trackReject(error);
                    handleError(error);
                } else {*/
                console.log('Token needs approval');
                console.log(handleProgress)
                handleProgress(
                    progressOptions.approval('Lords', stepOf(TransferStep.APPROVE, TransferToL2Steps))
                );

                console.log('Current allow value', { allowance });
                if (Number(allowance) < Number(amount)) {
                    console.log('Allow value is smaller then amount, sending approve tx...', { amount });
                    await approve({
                        args: [l1BridgeAddress, amount],
                    })
                }
                handleProgress(
                    progressOptions.waitForConfirm(
                        l1Account || '0x',
                        stepOf(TransferStep.CONFIRM_TX, TransferToL2Steps)
                    )
                );
                console.log('Calling deposit');
                const { hash } = await deposit({
                    args: [BigInt(amount), BigInt(l2Account || "0x"), BigInt(1)],
                    value: BigInt(1),
                });

                console.log(depositReceipt)
                onDeposit(depositReceipt?.logs/*[EventName.L1.LOG_DEPOSIT]*/);
                //await maybeAddToken(tokenAddressL2);

            } catch (ex: any) {
                //trackError(ex);
                console.error(ex?.message, ex);
                //handleError(progressOptions.error(TransferError.TRANSACTION_ERROR, ex));
            }
        },
        [deposit, l2Account, progressOptions, l1Account, allowance, approve, l1BridgeAddress]
    );
};