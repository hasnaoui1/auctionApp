package org.example.auctionbackend.controller;

import lombok.AllArgsConstructor;
import org.example.auctionbackend.entities.Bid;
import org.example.auctionbackend.service.auctionService;
import org.example.auctionbackend.service.bidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bids")
@AllArgsConstructor
public class bidController {
    private final bidService bidService;

    @PostMapping
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<Bid> addBid(@RequestBody Bid bid , @RequestParam Integer auctionId) {

return null;
    }

    @GetMapping
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<List<Bid>> getAllBids() {
        return new ResponseEntity<>(bidService.getAllBids(), HttpStatus.OK);

    }
}
