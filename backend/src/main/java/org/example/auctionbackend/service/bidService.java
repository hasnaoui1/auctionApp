package org.example.auctionbackend.service;

import org.example.auctionbackend.entities.Bid;
import java.util.List;

public interface bidService {

    Bid placeBid(Bid bid  , int auctionId);

    List<Bid> getAllBids();

    Bid getBidById(int id);

}
