import InternalStorage from 'internal-storage';
import * as uuid from 'node-uuid';

const internal = InternalStorage<Account, IAccountStorage>();
const symbols = {};

export enum AccountType {
    User,
    Contract
}

export interface IAccountStorage {
    id: string;
    balance: number;
    type: AccountType;
}

export class Account {
    constructor(type: AccountType, owner: symbol) {
        internal(this).id = uuid.v4();
        internal(this).balance = 0;
        internal(this).type = type;
        symbols[owner] = this;
    }
    public static Load(data: IAccountStorage, owner: symbol){
        const temp = new Account(data.type, owner);
        internal(temp).balance = data.balance;
        internal(temp).type = data.type;
        return temp;
    }
    public static Dump(account: Account){
        const data = {} as IAccountStorage;
        Object.assign(data, internal(account));
        return data;
    }
    public static WithCaller(fn: (id: string) => void){
        return (callerSymbol: symbol) => {
            fn(symbols[callerSymbol].id);
        };
    }
    get id() {
        return internal(this).id;
    }
    get balance(){
        return internal(this).balance;
    }
    get type(){
        return internal(this).type;
    }
    public transferFunds(to: Account, amount: number){
        return Account.WithCaller((callerId) => {
            if(callerId !== this.id){
                throw new Error("Only possible by owner");
            }
            if(this.balance < amount){
                throw new RangeError("Not enough funds");
            }
            internal(to).balance += amount;
            internal(this).balance -= amount;
        });
    }
}

let GenesisAccount: Account;

export function InitGenesisAccount(amount: number, owner: symbol){
    if(GenesisAccount){
        return GenesisAccount;
    }
    else {
        GenesisAccount = new Account(AccountType.Contract, owner);
        internal(GenesisAccount).balance = amount;
    }
}

export {GenesisAccount};
