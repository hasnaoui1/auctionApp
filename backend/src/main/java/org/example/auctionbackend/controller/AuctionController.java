package org.example.auctionbackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.auctionbackend.entities.Auction;
import org.example.auctionbackend.service.auctionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final auctionService auctionService;

    @PostMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<Auction> addAuction(@RequestBody Auction auction) {
        Auction savedAuction = auctionService.createAuction(auction);
        if (savedAuction == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAuction);
    }

    @GetMapping
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<List<Auction>> getAllAuctions() {
        return ResponseEntity.ok(auctionService.getAllAuctions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<Auction> getAuctionById(@PathVariable int id) {
        return auctionService.getAuctionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<Auction> updateAuction(@RequestBody Auction auction) {
        return ResponseEntity.ok(auctionService.updateAuction(auction));
    }

    @PostMapping("/start/{id}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<String> startAuction(@PathVariable int id) {
        try {
            auctionService.startAuction(id);
            return ResponseEntity.ok("Auction started");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Auction not found");
        }
    }

    @PostMapping("/join/{id}")
    @PreAuthorize("hasRole('role_user')")
    public ResponseEntity<String> joinAuction(@PathVariable int id) {
        try {
            auctionService.joinAuction(id);
            return ResponseEntity.ok("Joined auction");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Auction not found");
        }
    }

    @PostMapping("/end/{id}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<String> endAuction(@PathVariable int id) {
        try {
            String winner = auctionService.endAuction(id);
            return ResponseEntity.ok("Auction ended. Winner: " + winner);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Auction not found");
        }
    }
}
