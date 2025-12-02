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
import java.util.Optional;

@Service
@AllArgsConstructor
public class auctionServiceImpl implements auctionService {

    private final auctionRepository auctionRepository;
    private final AuctionWS auctionWS;
    private final bidRepository bidRepository;

    @Override
    public Auction createAuction(Auction auction) {
        if (auctionRepository.findById(auction.getId()).isPresent()) return null;
        return auctionRepository.save(auction);
    }

    @Override
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    @Override
    public Optional<Auction> getAuctionById(Integer auctionId) {
        return auctionRepository.findById(auctionId);
    }

    @Override
    public Auction updateAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    @Override
    public void deleteAuctionById(Integer auctionId) {

    }

    @Override
    public void joinAuction(Integer auctionId) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getParticipants().contains(user)) {
            throw new IllegalStateException("User already in auction");
        }

        auction.getParticipants().add(user);
        auctionRepository.save(auction);
        auctionWS.broadcastParticipants(auctionId); 
    }

    @Override
    public void startAuction(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.isActive()) return;

        if (auction.getParticipants() == null || auction.getParticipants().size() < 2) {
            throw new IllegalStateException("Not enough participants to start auction");
        }

        auction.setActive(true);
        auctionRepository.save(auction);
        auctionWS.broadcastStart(auctionId);
    }

    @Override
    public String endAuction(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.isActive()) {
            throw new IllegalStateException("Auction not active");
        }

        auction.setActive(false);

        Bid highest = auction.getBids().stream()
                .max(Comparator.comparingInt(Bid::getAmount))
                .orElse(null);

        String winner = highest != null ? highest.getBidderId() : null;
        bidRepository.deleteAll(auction.getBids());

        auction.getParticipants().clear();
        auction.setCurrentPrice(auction.getStartingPrice());
        auction.getBids().clear();
        auctionRepository.save(auction);

        auctionWS.broadcastEnd(auctionId, winner);

        return winner;
    }
}
