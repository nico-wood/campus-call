import { emptyLedger, type LedgerState } from "../lib/ledger";

export type ExampleConfirmResult = {
  ledger: LedgerState;
  wrote: false;
  debited: 0;
  requested: false;
};

/** Example confirms return the same ledger. They do not write, debit, or send a request. */
export function confirmExample(ledger: LedgerState): ExampleConfirmResult {
  return { ledger, wrote: false, debited: 0, requested: false };
}

export function runExampleConfirm(ledger: LedgerState = emptyLedger({ example: 1000 })): LedgerState {
  const result = confirmExample(ledger);
  if (result.wrote || result.debited !== 0 || result.requested || result.ledger !== ledger) {
    throw new Error("example confirm wrote");
  }
  return ledger;
}
