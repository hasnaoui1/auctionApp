package org.example.auctionbackend.service;

import lombok.AllArgsConstructor;
import org.example.auctionbackend.entities.Auction;
import org.example.auctionbackend.entities.Bid;
import org.example.auctionbackend.repository.auctionRepository;
import org.example.auctionbackend.repository.bidRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
@Service
@AllArgsConstructor
public class auctionServiceImpl implements auctionService{

    private final auctionRepository auctionRepository;
    private final AuctionWS auctionWS;
    private final bidRepository bidRepository;


    @Override
    public Auction createAuction(Auction auction) {
        if ( auctionRepository.findById(auction.getId()).isPresent()) {
            return null;
        } else {
            return auctionRepository.save(auction);
        }
    }

    @Override
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    @Override
    public Auction getAuctionById(Integer auctionId) {
        return auctionRepository.findById(auctionId).get();
    }

    @Override
    public Auction updateAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    @Override
    public void deleteAuctionById(Integer auctionId) {
        auctionRepository.deleteById(auctionId);

    }

    @Override
    public void joinAuction(Integer auctionId) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.getParticipantIds().contains(userId)) {
            auction.getParticipantIds().add(userId);
            auctionRepository.save(auction);
        }else{
            throw new RuntimeException("user already in auction");
        }
    }

    @Override
    public Auction StartAuction(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.isActive() && auction.getParticipantIds().size() >= 2) {
            auction.setActive(true);
            auctionRepository.save(auction);

            auctionWS.broadcastStart(auctionId); // WEBSOCKET PUSH
        }

        return auction;
    }

    @Override
    public String EndAuction(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.isActive()) {
            auction.setActive(false);
            auctionRepository.save(auction);

            Bid highest = auction.getBids().stream()
                    .max(Comparator.comparingInt(Bid::getAmount))
                    .orElse(null);

            String winner = highest != null ? highest.getBidderId() : null;

            auctionWS.broadcastEnd(auctionId, winner); // WEBSOCKET PUSH

            return winner;
        }

        return null;
    }


}
