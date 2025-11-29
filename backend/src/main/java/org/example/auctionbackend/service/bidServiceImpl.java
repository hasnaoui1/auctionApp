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
    public Bid placeBid(Bid bid, int auctionId) {
        try {
            Auction a = auctionRepository.findById(auctionId)
                    .orElseThrow(() -> new RuntimeException("Auction not found"));

            // Get current Keycloak user ID
            String userId = SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getName();

            // Check if auction active + user allowed + at least 2 participants
            if (a.isActive()
                    && a.getParticipantIds().size() > 2
                    && a.getParticipantIds().contains(userId)) {

                bid.setAuction(a);
                auctionWS.broadcastBid(auctionId, bid);// required for mappedBy
                return bidRepository.save(bid);
            }

            throw new RuntimeException("User not allowed to bid");

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
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
