package org.example.auctionbackend.repository;

import org.example.auctionbackend.entities.Auction;
import org.example.auctionbackend.entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface auctionRepository  extends JpaRepository<Auction, Integer> {
}
