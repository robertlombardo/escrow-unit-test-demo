import {InitGenesisAccount, GenesisAccount, Account, AccountType} from './Account';
import {EscrowBuyer, EscrowSeller, EscrowTrusteeAgent, EscrowTransferContract} from './EscrowContract';
import InternalStorage from 'internal-storage';

const symbols = InternalStorage<symbol, Account>();

const now = new Date();
const aMonthFromNow = new Date();
aMonthFromNow.setMonth(now.getMonth() + 1);

const systemOwner = Symbol('System');
InitGenesisAccount(100, systemOwner);

const agreement = new EscrowTransferContract({
    start: now,
    end: aMonthFromNow,
    amount: 100,
});

const userOwners = [] as symbol[];
const users = [] as Account[];

for (let index = 0; index < 4; index++){
    userOwners.push(Symbol());
    users.push(new Account(AccountType.User, userOwners[index]));
}

GenesisAccount.transferFunds(users[0], 100)(systemOwner);

// Example Flow

const buyer = new EscrowBuyer(users[0], agreement);
const seller = new EscrowSeller(users[1], agreement);
const trustee = new EscrowTrusteeAgent(users[2], agreement);
const finder = users[3];

users[0].transferFunds(buyer, 100)(userOwners[0]);
buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners[0]);
seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners[1]);
buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners[0]);

seller.transferFunds(users[1], 100)(userOwners[1]);

/*
TODO build tests for each of the "Valid State Transitions" from EscrowContract.ts
Pay attention to testing the timeout function as it requires some mocking of the Dates.
IDEA 1) You can replace the Date object that is used by EscrowContract with a version that supports
mocking. You can do this by passing the Date in or making a module that supports mocking.
IDEA 2) You can override the global Date module with a mocked one. 
*/

console.log("Done");
