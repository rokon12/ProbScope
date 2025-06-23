package dev.langchain4j.tokenflowvisualizer.dto.openai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class OpenAILogprobsResponse {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    @Data
    public static class Choice {
        private int index;
        private Message message;
        private Logprobs logprobs;
        @JsonProperty("finish_reason")
        private String finishReason;
    }

    @Data
    public static class Message {
        private String role;
        private String content;
    }

    @Data
    public static class Logprobs {
        private List<ContentLogprob> content;
    }

    @Data
    public static class ContentLogprob {
        private String token;
        private double logprob;
        private List<Integer> bytes;
        @JsonProperty("top_logprobs")
        private List<TopLogprob> topLogprobs;
    }

    @Data
    public static class TopLogprob {
        private String token;
        private double logprob;
        private List<Integer> bytes;
    }

    @Data
    public static class Usage {
        @JsonProperty("prompt_tokens")
        private int promptTokens;
        @JsonProperty("completion_tokens")
        private int completionTokens;
        @JsonProperty("total_tokens")
        private int totalTokens;
    }
}