import React from "react";
import { ActionType } from "@/constants/transferSteps";
import PropTypes from "prop-types";

import { Alert } from "@realms-world/ui";

const TransactionSubmittedModalBody = ({ transfer }: { transfer: any }) => {
  const { type, l2hash, l1hash } = transfer;
  const isTransferCompleted = l1hash && l2hash;

  const textMessage =
    type === ActionType.TRANSFER_TO_L2
      ? "Your transaction has been successfully sent to StarkNet!"
      : isTransferCompleted
        ? "Your transfer is completed on Ethereum!"
        : "Your transaction is now being processing on StarkNet.";

  const messageComponent =
    type === ActionType.TRANSFER_TO_L2 ? (
      <Alert
        message={
          "Completing a Ethereum → StarkNet transfer may take up to several hours depending on the congestion. It may take a while for your wallet balance to update."
        }
        title={"This is an Alpha version"}
        variant="warning"
      />
    ) : !isTransferCompleted ? (
      <Alert
        message={
          "The StarkNet → Ethereum transfer divided into two stages:\n• A waiting period of several hours is expected between the stages.\n• At the end of the first step, you will be required to sign in order to complete the transfer."
        }
        title={"This is an Alpha version"}
        variant="warning"
      />
    ) : null;

  return (
    <div className="mb-6 flex flex-col items-center px-2 text-center ">
      <div className="mb-4 w-2/3  text-sm">{textMessage}</div>
      {messageComponent}
    </div>
  );
};

TransactionSubmittedModalBody.propTypes = {
  transfer: PropTypes.object,
};

export default TransactionSubmittedModalBody;
