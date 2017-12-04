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
     * test all possible state conditions from which to call seller.reportAssetTransferToBuyer()
     */
    it("should NOT permit seller.reportAssetTransferToBuyer() from 'Init' state", ()=>{
        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit seller.reportAssetTransferToBuyer() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportAssetTransferToBuyer() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    /*
     * test all possible state conditions from which to call seller.reportBuyerReturnedAsset()
     */
    it("should NOT permit seller.reportBuyerReturnedAsset() from 'Init' state", ()=>{
        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit seller.reportBuyerReturnedAsset() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.reportBuyerReturnedAsset() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            seller.reportBuyerReturnedAsset("Got the house back.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    /*
     * test all possible state conditions from which to call seller.dispute()
     */
    it("should NOT permit seller.dispute() from 'Init' state", ()=>{
        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.dispute() from 'BuyerFunded' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("SHOULD permit seller.dispute() from 'SellerTransferredAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).not.toThrowError("Invalid State Change");
    });

    it("SHOULD permit seller.dispute() from 'BuyerReturnedAsset' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.reportAssetReturnToSeller("Changed my mind, dude.")(userOwners.buyer);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).not.toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.dispute() from 'BuyerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        buyer.dispute("Yo, the toilets don't flush.")(userOwners.buyer);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.dispute() from 'SellerDisputed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        seller.dispute("Something seems fishy about this deal...")(userOwners.seller);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.dispute() from 'Closed' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);
        seller.reportAssetTransferToBuyer("Gave house to buyer")(userOwners.seller);
        buyer.releaseEscrowedFundsToSeller("Happy with the house")(userOwners.buyer);
        seller.transferFunds(seller.user, 100)(userOwners.seller);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });

    it("should NOT permit seller.dispute() from 'Timedout' state", ()=>{
        buyer.enterFundsIntoEscrow(100, "Buying a house")(userOwners.buyer);

        const dateOverride = new Date( agreement.end );
        dateOverride.setMonth( agreement.end.getMonth()+1 );
        agreement.timeout( finder, "timin' you out, bitch", dateOverride )(userOwners.finder);

        expect( ()=>{
            seller.dispute("I don't like the way this deal is going.")(userOwners.seller);
        }).toThrowError("Invalid State Change");
    });
 
} );