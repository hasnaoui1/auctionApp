package org.example.auctionbackend.service;

import org.example.auctionbackend.entities.Auction;

import java.util.List;
import java.util.Optional;

public interface auctionService {

     Auction createAuction(Auction auction);

     List<Auction> getAllAuctions();

     Optional<Auction> getAuctionById(Integer auctionId);

     Auction updateAuction(Auction auction);

     void deleteAuctionById(Integer auctionId);

     void joinAuction(Integer auctionId);

     void startAuction(Integer auctionId);

     String endAuction(Integer auctionId);
}
