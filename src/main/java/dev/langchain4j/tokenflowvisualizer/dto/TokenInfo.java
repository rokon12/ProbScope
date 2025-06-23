package dev.langchain4j.tokenflowvisualizer.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TokenInfo {
    private String text;
    private double probability;
    private List<TokenAlternative> alternatives;
    private long timestamp;

    @Data
    @Builder
    public static class TokenAlternative {
        private String text;
        private double probability;
    }
}