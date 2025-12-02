package org.example.auctionbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuctionWS {

    private final SimpMessagingTemplate messaging;

    public void broadcastBid(Integer auctionId, Object data) {
        messaging.convertAndSend("/topic/auction/" + auctionId + "/bids", data);
    }

    public void broadcastStart(Integer auctionId) {
        messaging.convertAndSend("/topic/auction/" + auctionId + "/start", "Auction Started");
    }

    public void broadcastEnd(Integer auctionId, Object winner) {
        messaging.convertAndSend("/topic/auction/" + auctionId + "/end", winner);
    }
    public void broadcastParticipants(Integer auctionId) {
        messaging.convertAndSend("/topic/auction/" + auctionId + "/participants", "New participant joined");
    }
}
