package dev.langchain4j.tokenflowvisualizer.dto.openai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class OpenAILogprobsRequest {

    private String model;
    private Boolean stream;
    private Boolean logprobs;
    private Double temperature;

    @JsonProperty("top_p")
    private Double topP;

    @JsonProperty("top_logprobs")
    private Integer topLogprobs;

    @JsonProperty("max_tokens")
    private Integer maxTokens;

    private List<Message> messages;

    @Data @Builder
    public static class Message {
        private String role;
        private String content;
    }
}
