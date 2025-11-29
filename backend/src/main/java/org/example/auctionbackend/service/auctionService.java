package org.example.auctionbackend.service;

import org.example.auctionbackend.entities.Auction;

import java.util.List;

public interface auctionService{
     Auction createAuction(Auction auction);
     List<Auction> getAllAuctions();
     Auction getAuctionById(Integer auctionId);
     Auction updateAuction(Auction auction);
     void deleteAuctionById(Integer auctionId);
     void joinAuction(Integer auctionId);
     Auction StartAuction(Integer auctionId);
     String EndAuction(Integer auctionId);

}
