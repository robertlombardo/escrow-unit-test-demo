import {InitGenesisAccount, GenesisAccount, Account, AccountType} from '../../Account';
import {EscrowBuyer, EscrowSeller, EscrowTrusteeAgent, EscrowTransferContract} from '../../EscrowContract';
import InternalStorage from 'internal-storage';

const symbols = InternalStorage<symbol, Account>();
const systemOwner = Symbol('MockupSystem');
InitGenesisAccount( 999999999, systemOwner );

export default function() {
    const now = new Date();
    const anHourFromNow = new Date();
    anHourFromNow.setHours( now.getHours()+1 );
    const aMonthFromNow = new Date();
    aMonthFromNow.setMonth( now.getMonth()+1 );

    var mockup = {
    	agreement: undefined,
    	buyer: undefined,
    	seller: undefined,
    	trustee: undefined,
    	finder: undefined,
    	userOwners: {
    		buyer: undefined,
    		seller: undefined,
    		trustee: undefined,
    		finder: undefined
    	}
    };

    var agreement = mockup.agreement = new EscrowTransferContract({
        start: anHourFromNow,
        end: aMonthFromNow,
        amount: 100,
    });

    var userOwners = [] as symbol[];
    var users = [] as Account[];

    for (let index = 0; index < 4; index++){
        userOwners.push(Symbol());
        users.push(new Account(AccountType.User, userOwners[index]));
    }

    GenesisAccount.transferFunds(users[0], 10000)(systemOwner);

    mockup.buyer = new EscrowBuyer(users[0], agreement);
    mockup.seller = new EscrowSeller(users[1], agreement);
    mockup.trustee = new EscrowTrusteeAgent(users[2], agreement);
    mockup.finder = users[3];

    users[0].transferFunds(mockup.buyer, 10000)(userOwners[0]);

    mockup.userOwners.buyer = userOwners[0];
    mockup.userOwners.seller = userOwners[1];
    mockup.userOwners.trustee = userOwners[2];
    mockup.userOwners.finder = userOwners[3];

    return mockup;
}