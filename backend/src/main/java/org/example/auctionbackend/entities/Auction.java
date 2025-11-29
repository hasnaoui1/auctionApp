package org.example.auctionbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Auction {

    @Id
    @GeneratedValue

    private int id;
    private String title;
    private String description;
    private int startingPrice;
    private int currentPrice;
    @Column(columnDefinition = "boolean default true")
    private boolean active;


    @ElementCollection
    @JsonIgnore
    private List<String> participantIds;

    @JsonIgnore
    @OneToMany(mappedBy = "auction")
    private List<Bid> bids;
}
