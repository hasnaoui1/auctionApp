package org.example.auctionbackend.repository;

import org.example.auctionbackend.entities.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface bidRepository extends JpaRepository<Bid, Integer> {
}
