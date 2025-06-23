package dev.langchain4j.tokenflowvisualizer.dto;

import lombok.Data;

@Data
public class TokenGenerationRequest {
    private String prompt;
    private double temperature = 1.0;
    private int topK = 50;
    private double topP = 0.9;
}