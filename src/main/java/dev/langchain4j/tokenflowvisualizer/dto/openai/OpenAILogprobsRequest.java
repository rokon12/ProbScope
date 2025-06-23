package dev.langchain4j.tokenflowvisualizer.dto.openai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OpenAILogprobsRequest {
    private String model;
    private List<Message> messages;
    private double temperature;
    private boolean logprobs;
    @JsonProperty("top_logprobs")
    private int topLogprobs;
    @JsonProperty("max_tokens")
    private int maxTokens;
    private boolean stream;

    @Data
    @Builder
    public static class Message {
        private String role;
        private String content;
    }
}