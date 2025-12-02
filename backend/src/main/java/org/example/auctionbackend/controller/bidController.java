package org.example.auctionbackend.controller;

import lombok.AllArgsConstructor;
import org.example.auctionbackend.entities.Bid;
import org.example.auctionbackend.service.bidService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bids")
@AllArgsConstructor
public class bidController {

    private final bidService bidService;

    @PostMapping("/{auctionId}")
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<String> addBid(@RequestBody Bid bid, @PathVariable int auctionId) {
        try {
            Bid placedBid = bidService.placeBid(bid,auctionId);
            return ResponseEntity.ok("Bid placed successfully. New current price: " + placedBid.getAmount());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<List<Bid>> getAllBids() {
        return ResponseEntity.ok(bidService.getAllBids());
    }
}
