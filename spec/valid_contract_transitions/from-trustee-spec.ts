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
    it("should NOT permit trustee.resolveDispute() from 'Init' state", ()=>{
        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit trustee.resolveDispute() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit trustee.resolveDispute() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit trustee.resolveDispute() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit trustee.resolveDispute() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).not.toThrowError("Invalid State Change");
    });

    it("SHOULD permit trustee.resolveDispute() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit trustee.resolveDispute() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            trustee.resolveDispute(EscrowPartyRole.Buyer,"The buyer is on the right side of history.")(userOwners.trustee);
        }).toThrowError("Invalid State Change");
    });
 
} );