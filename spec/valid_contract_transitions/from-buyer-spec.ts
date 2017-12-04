import MockContractEcosystem from "../helpers/MockContractEcosystem";
import { EscrowState } from "../../EscrowContract";

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
     * test all possible state conditions from which to call buyer.enterFundsIntoEscrow()
     */
    it("SHOULD permit buyer.enterFundsIntoEscrow() from 'Init' state", ()=>{
        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.enterFundsIntoEscrow() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    /*
     * test all possible state conditions from which to call buyer.releaseEscrowedFundsToSeller()
     */
    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'Init' state", ()=>{
        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit buyer.releaseEscrowedFundsToSeller() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.releaseEscrowedFundsToSeller() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            buyer.releaseEscrowedFundsToSeller("Happy with the house!")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    /*
     * test all possible state conditions from which to call buyer.reportAssetReturnToSeller()
     */
    it("should NOT permit buyer.reportAssetReturnToSeller() from 'Init' state", ()=>{
        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit buyer.reportAssetReturnToSeller() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.reportAssetReturnToSeller() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    /*
     * test all possible state conditions from which to call buyer.dispute()
     */
    it("should NOT permit buyer.dispute() from 'Init' state", ()=>{
        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit buyer.dispute() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit buyer.dispute() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            buyer.dispute("Found flood damage in the basement.")(userOwners.buyer);
        }).toThrowError("Invalid State Change");
    });
 
} );