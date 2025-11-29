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
public class auctionController {

    private final auctionService auctionService;

    @PostMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<Auction> addAuction(@RequestBody Auction auction) {
        try {
            Auction savedAuction = auctionService.createAuction(auction);
            return new ResponseEntity<>(savedAuction, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @PreAuthorize("hasRole('role_user')")
    @GetMapping
    public ResponseEntity<List<Auction>> getAllAuctions() {
        List<Auction> auctions = auctionService.getAllAuctions();
        return new ResponseEntity<>(auctions, HttpStatus.OK);

    }
    @PreAuthorize("hasRole('role_user')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getAuctionById(@PathVariable int id) {
        try {
            Auction auction = auctionService.getAuctionById(id);
            return ResponseEntity.ok(auction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("doesnt exist");
        }
    }



    @PutMapping
    public ResponseEntity<Auction> updateAuction(@RequestBody Auction auction) {
        try {
            Auction savedAuction = auctionService.updateAuction(auction);
            return new ResponseEntity<>(savedAuction, HttpStatus.OK);

        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @PreAuthorize("hasRole('role_admin')")
    @PostMapping("/start")
    public ResponseEntity<Auction> startAuction(@RequestBody Auction request) {
        Auction updated = auctionService.StartAuction(request.getId());
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('role_admin')")
    @PostMapping("/end")
    public ResponseEntity<String> endAuction(@RequestBody Auction request) {
        String winnerId = auctionService.EndAuction(request.getId());
        return new ResponseEntity<>(winnerId, HttpStatus.OK);
    }


}
