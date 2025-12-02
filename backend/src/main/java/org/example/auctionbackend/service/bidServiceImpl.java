package org.example.auctionbackend.service;

import lombok.AllArgsConstructor;
import org.example.auctionbackend.entities.Auction;
import org.example.auctionbackend.entities.Bid;

import org.example.auctionbackend.repository.auctionRepository;
import org.example.auctionbackend.repository.bidRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class bidServiceImpl implements bidService {

    private final bidRepository bidRepository;
    private final auctionRepository auctionRepository;
    private final AuctionWS  auctionWS;

    @Override
    public Bid placeBid( Bid bid,int auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        int currentPrice = auction.getCurrentPrice();

        if (bid.getAmount() <= currentPrice) {
            throw new RuntimeException("Bid too low. Must be higher than current price: " + currentPrice);
        }


        bid.setAuction(auction);
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        bid.setBidderId(user);

        // Save bid
        bidRepository.save(bid);

        // Update auction current price
        auction.setCurrentPrice(bid.getAmount());
        auctionRepository.save(auction);
        auctionWS.broadcastBid(auctionId,bid);

        return bid;
    }


    @Override
    public List<Bid> getAllBids() {
        return bidRepository.findAll();
    }

    @Override
    public Bid getBidById(int id) {
        return bidRepository.findById(id).orElse(null);
    }


}
