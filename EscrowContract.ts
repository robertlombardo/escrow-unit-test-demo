import InternalStorage from 'internal-storage';
import {Account, AccountType} from './Account';

export enum EscrowPartyRole {
    None,
    Buyer,
    Seller,
    TrusteeAgent,
    Finder
}

export enum EscrowState {
    Init = "INIT",
    BuyerFunded = "BUYER_FUNDED",
    SellerTransferredAsset = "SELLER_TRANSFERRED_ASSET",
    BuyerReturnedAsset = "BUYER_RETURNED_ASSET",
    BuyerDisputed = "BUYER_DISPUTED",
    SellerDisputed = "SELLER_DISPUTED",
    Closed = "CLOSED",
    Timedout = "TIMEDOUT",
    Transfer = "TRANSFER" // NOTE Transfer does not have to been as a state
}

export interface IEscrowAgreement {
    start: Date;
    end: Date;
    amount: number;
}

interface IEscrowPartyStorage {
    contract: EscrowTransferContract;
    role: EscrowPartyRole;
    user: Account;
    owner: symbol;
}

export interface IEscrowTransferContractEvent {
    accountId: string;
    party: EscrowPartyRole;
    event: EscrowState;
    message?: string;
}

interface IContractSharedStorage extends IEscrowAgreement {
    owner: symbol;
    seller: EscrowSeller;
    buyer: EscrowBuyer;
    trustee: EscrowTrusteeAgent;
    finder: Account;
    state: EscrowState;
    log: IEscrowTransferContractEvent[];
}

const internal = InternalStorage<EscrowParty, IEscrowPartyStorage>();
const shared = InternalStorage<EscrowTransferContract, IContractSharedStorage>();

function assertValidStateChange(party: EscrowPartyRole, contract: EscrowTransferContract, newState: EscrowState){
    if(!party || !contract || !newState){
        throw new Error("Invalid State Change");
    }
    /*
        TODO make sure the state transfer is valid based on:
        The previous state, the party who is allowed to change a state, the next state, the current time.
        Throw errors if the state change is not possible.
    */
    /*
    NOTE Valid State Transitions are as follows:

    (Buyer) Init -> BuyerFunded
        (Seller) BuyerFunded -> SellerTransferredAsset

            (Buyer) SellerTransferredAsset -> Closed

            (Seller) SellerTransferredAsset -> SellerDisputed

            (Buyer) SellerTransferredAsset -> BuyerReturnedAsset

                (Seller) BuyerReturnedAsset -> Closed

                (Seller) BuyerReturnedAsset -> SellerDisputed

            (Finder) SellerTransferredAsset -> Timedout

        (Finder) BuyerFunded -> Timedout

        (Buyer) BuyerFunded -> BuyerDisputed

            (Trustee) BuyerDisputed -> Closed

    (Trustee) SellerDisputed -> Closed
    */

    var valid = false;
    switch( party ) {
        case EscrowPartyRole.Buyer:
            if( contract.state===EscrowState.Init && newState===EscrowState.BuyerFunded ) {
                valid = true;
            } else if( contract.state===EscrowState.SellerTransferredAsset ) {
                if( newState===EscrowState.Closed || newState===EscrowState.BuyerReturnedAsset ) {
                    valid = true;
                }
            } else if( contract.state===EscrowState.BuyerFunded && newState===EscrowState.BuyerDisputed ) {
                valid = true;
            }
            break;

        case EscrowPartyRole.Seller:
            if( contract.state===EscrowState.BuyerFunded && newState===EscrowState.SellerTransferredAsset ) {
                valid = true;
            } else if( contract.state===EscrowState.SellerTransferredAsset && newState===EscrowState.SellerDisputed ) {
                valid = true;
            } else if( contract.state === EscrowState.BuyerReturnedAsset ) {
                if( newState===EscrowState.Closed || newState===EscrowState.SellerDisputed ) {
                    valid = true;
                }
            }
            break;

        case EscrowPartyRole.Finder:
            if( newState===EscrowState.Timedout ) {
                if( contract.state===EscrowState.BuyerFunded || contract.state===EscrowState.SellerTransferredAsset ) {
                    valid = true;
                }
            }
            break;

        case EscrowPartyRole.TrusteeAgent:
            if( newState===EscrowState.Closed ) {
                if( contract.state===EscrowState.BuyerDisputed || contract.state===EscrowState.SellerDisputed ) {
                    valid = true;
                }
            }
            break;
    }

    if( !valid ) {
        throw new Error("Invalid State Change");
    }
}

export abstract class EscrowParty extends Account{
    constructor(user: Account, contract: EscrowTransferContract, role: EscrowPartyRole){
        const owner = Symbol('EscrowPartyContract Owner');
        super(AccountType.Contract, owner);
        internal(this).owner = owner;
        internal(this).user = user;
        internal(this).contract = contract;
        internal(this).role = role;
    }
    get type(){
        return AccountType.User;
    }
    public transferFunds(to: Account, amount: number){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id && callerId !== this.id){
                throw new Error("Invalid Caller");
            }
            super.transferFunds(to, amount)(internal(this).owner);
        });
    }
    get role(){
        return internal(this).role;
    }
    get user(){
        return internal(this).user;
    }

}

export class EscrowBuyer extends EscrowParty {
    constructor(account: Account, contract: EscrowTransferContract){
        super(account, contract, EscrowPartyRole.Buyer);
        shared(contract).buyer = this;
    }
    public enterFundsIntoEscrow(amount: number, message = ''){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            assertValidStateChange(this.role, contract, EscrowState.BuyerFunded);
            this.transferFunds(contract, amount)(internal(this).owner);
            contract.changeStateAndLog(
                this.role, EscrowState.Transfer,
                `[Transferred: ${amount}]`
            )(shared(contract).owner);
            contract.changeStateAndLog(this.role, EscrowState.BuyerFunded, message)(shared(contract).owner);
        });
    }
    public releaseEscrowedFundsToSeller(message?: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            const seller = shared(contract).seller;
            assertValidStateChange(this.role, contract, EscrowState.Closed);
            contract.transferFunds(seller, contract.balance)(shared(contract).owner);
            contract.changeStateAndLog(this.role, EscrowState.Closed, message)(shared(contract).owner);
        });
    }
    public reportAssetReturnToSeller(message?: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            assertValidStateChange(this.role, contract, EscrowState.BuyerReturnedAsset);
            contract.changeStateAndLog(this.role, EscrowState.BuyerReturnedAsset, message)(shared(contract).owner);
        });
    }
    public dispute(message?: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            assertValidStateChange(this.role, contract, EscrowState.BuyerDisputed);
            contract.changeStateAndLog(this.role, EscrowState.BuyerDisputed, message)(shared(contract).owner);
        });
    }
}

export class EscrowSeller extends EscrowParty {
    constructor(account: Account, contract: EscrowTransferContract){
        super(account, contract, EscrowPartyRole.Seller);
        shared(contract).seller = this;
    }
    public reportAssetTransferToBuyer(message: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            assertValidStateChange(this.role, contract, EscrowState.SellerTransferredAsset);
            contract.changeStateAndLog(this.role, EscrowState.SellerTransferredAsset, message)(shared(contract).owner);
        });
    }
    public reportBuyerReturnedAsset(message: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            const buyer = shared(contract).buyer;
            assertValidStateChange(this.role, contract, EscrowState.Closed);
            contract.transferFunds(buyer, contract.balance)(shared(contract).owner);
            contract.changeStateAndLog(this.role, EscrowState.Closed, message)(shared(contract).owner);
        });
    }
    public dispute(message: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            assertValidStateChange(this.role, contract, EscrowState.SellerDisputed);
            contract.changeStateAndLog(this.role, EscrowState.SellerDisputed, message)(shared(contract).owner);
        });
    }
}

export class EscrowTrusteeAgent extends EscrowParty {
    constructor(account: Account, contract: EscrowTransferContract){
        super(account, contract, EscrowPartyRole.TrusteeAgent);
        shared(contract).trustee = this;
    }
    public resolveDispute(inFavorOf: EscrowPartyRole, message?: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.user.id){
                throw new Error("Invalid Caller");
            }
            const contract = internal(this).contract;
            let reciever: EscrowSeller | EscrowBuyer;
            switch(inFavorOf){
                case EscrowPartyRole.Seller:
                    reciever = shared(contract).seller;
                    break;
                case EscrowPartyRole.Buyer:
                    reciever = shared(contract).buyer;
                    break;
                default:
                    throw new Error("Cannot resolve a dispute in favor of no one or the trustee");
            }
            assertValidStateChange(this.role, contract, EscrowState.Closed);
            contract.transferFunds(reciever, contract.balance)(shared(contract).owner);
            contract.changeStateAndLog(this.role, EscrowState.Closed, message)(shared(contract).owner);
        });
    }
}

export class EscrowTransferContract extends Account{
    constructor(agreementConfig: IEscrowAgreement){
        const owner = Symbol('EscrowTransferContract Owner');
        super(AccountType.Contract, owner);
        shared(this).owner = owner;
        shared(this).log = [];
        
        /*
            TODO throw RangeErrors
            agreementConfig.start should be at least one hour after now
            agreementConfig.start cannot be in the past
            agreementConfig.end should be at least one day after agreemntConfig.start
            agreementConfig.end cannot be less more than one month after agreemntConfig.start <--- typo in the directions - is it less or more?
        */
        const startTime = agreementConfig.start.getTime();
        const endTime = agreementConfig.end.getTime();
        const now = new Date().getTime();
        if( startTime-now > 60*60*1000 ) {
            throw new RangeError("agreementConfig.start should be at least one hour after now");
        }
        if( startTime < now ) {
            throw new RangeError("agreementConfig.start cannot be in the past");
        }
        if( endTime-startTime < 24*60*60*1000 ) {
            throw new RangeError("agreementConfig.end should be at least one day after agreemntConfig.start");
        }

        shared(this).end = agreementConfig.end;
        shared(this).start = agreementConfig.start;
        shared(this).amount = agreementConfig.amount;
        shared(this).state = EscrowState.Init;
    }
    public changeStateAndLog(party: EscrowPartyRole, event: EscrowState, message?: string){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.id){
                throw new Error("Invalid Caller");
            }
            let accountId: string;
            switch(party){
                case EscrowPartyRole.Buyer:
                    accountId = shared(this).buyer.id;
                    break;
                case EscrowPartyRole.Seller:
                    accountId = shared(this).seller.id;
                    break;
                case EscrowPartyRole.TrusteeAgent:
                    accountId = shared(this).trustee.id;
                    break;
                case EscrowPartyRole.None:
                    accountId = this.id;
                    break;
                case EscrowPartyRole.Finder:
                    accountId = shared(this).finder.id;
                    break;
                default:
                    throw new TypeError("Expecting a EscrowState enum");
            }
            if(event !== EscrowState.Transfer){
                shared(this).state = event;
            }
            shared(this).log.push({
                accountId,
                party,
                event,
                message
            });
        });
    }
    public transferFunds(to: Account, amount: number){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.id){
                throw new Error("Invalid Caller");
            }
            super.transferFunds(to, amount)(shared(this).owner);
            this.changeStateAndLog(
                EscrowPartyRole.None,
                EscrowState.Transfer,
                `[Transferred: ${amount}]`
            )(shared(this).owner);
        });
    }
    public timeout(finder: Account, message?: string, currentDateOverride: Date=null){
        if( currentDateOverride && process.env.NODE_ENV!=="test" ) {
            throw new Error( "Date overrides only allowed in test mode." );
        }

        /*
            TODO Only can be called if the agreement is not disputed and not settled and after the `end` Date.
            If the agreement is not disputed and not settled, transfer the funds to the finder
        */
        if( this.state===EscrowState.BuyerDisputed || this.state===EscrowState.SellerDisputed ) {
            throw new Error("Cannot timeout a disputed contract.");
        }

        if( this.state===EscrowState.Closed ) {
            throw new Error("Cannot timeout a closed contract.");
        }

        const now = currentDateOverride? currentDateOverride.getTime() : new Date().getTime();
        if( now <= this.end.getTime() ) {
            throw new Error("Too soon to timeout this contract.");
        }

        return Account.WithCaller((callerId) => {
            if(callerId !== finder.id){
                throw new Error("Invalid Caller");
            }
            assertValidStateChange(EscrowPartyRole.Finder, this, EscrowState.Timedout);
            shared(this).finder = finder;
            this.transferFunds(finder, this.balance)(shared(this).owner);
            this.changeStateAndLog(EscrowPartyRole.Finder, EscrowState.Timedout, message)(shared(this).owner);
        });
    }
    get amount(){
        return shared(this).amount;
    }
    get buyerId(){
        return shared(this).buyer.id;
    }
    get sellerId(){
        return shared(this).seller.id;
    }
    get trusteeId(){
        return shared(this).trustee.id;
    }
    get finderId(){
        return shared(this).finder.id;
    }
    get state(){
        return shared(this).state;
    }
    get start(){
        /*
            TODO Don't return the actual object as it can be used to modify the Date.
            Return either an immutable copy or a new copy
        */
        return new Date( shared(this).start );
    }
    get end(){
        /*
            TODO Don't return the actual object as it can be used to modify the Date.
            Return either an immutable copy or a new copy
        */
        return new Date( shared(this).end );
    }
    get log(){
        /*
            TODO Don't return the actual object as it can be used to modify the log.
            Return either an immutable copy or a new copy
        */
        return Object.assign( {}, shared(this).log );
    }
}
