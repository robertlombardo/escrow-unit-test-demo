import MockContractEcosystem from "../helpers/MockContractEcosystem";
import { EscrowState, EscrowPartyRole } from "../../EscrowContract";

describe("Buyer-initialized Contract State Transitions", () => {
    var agreement, buyer, seller, trustee, finder, userOwners;

    beforeEach(function () {
        const mockup = MockContractEcosystem();
        agreement = mockup.agreement;
        buyer = mockup.buyer;
        seller = mockup.seller;
        trustee = mockup.trustee;
        finder = mockup.finder;
        userOwners = mockup.userOwners;
    });

    /*it("should complete the transaction lifecycle and end up in a Closed state", function() {
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);

        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect(agreement.state).toBe(EscrowState.Closed);
    });*/

    /*
     * test all possible state conditions from which to call trustee.resolveDispute()
     */
    it("should NOT permit agreement.timeout() from 'Init' state", ()=>{
        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit agreement.timeout() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).not.toThrowError("Invalid State Change");
    });

    it("SHOULD permit agreement.timeout() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit agreement.timeout() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit agreement.timeout() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).toThrowError("Cannot timeout a disputed contract.");
    });

    it("should NOT permit agreement.timeout() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).toThrowError("Cannot timeout a disputed contract.");
    });

    it("should NOT permit agreement.timeout() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            const dateOverride = new Date( agreement.end );
            dateOverride.setMonth( agreement.end.getMonth()+1 );
            agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);
        }).toThrowError("Cannot timeout a closed contract.");
    });

    it("should NOT permit agreement.timeout() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            const newOverride = new Date( dateOverride );
            newOverride.setMonth( dateOverride.getMonth()+1 );      
            agreement.timeout( finder, "timin' you out AGAIN, whaaaat", newOverride )(userOwners.finder);
        }).toThrowError("Invalid State Change");
    });
 
} );