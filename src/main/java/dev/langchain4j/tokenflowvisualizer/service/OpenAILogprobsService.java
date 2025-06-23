package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.config.OpenAIConfig;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.dto.openai.OpenAILogprobsRequest;
import dev.langchain4j.tokenflowvisualizer.dto.openai.OpenAILogprobsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class OpenAILogprobsService {
    
    private final OpenAIConfig openAIConfig;
    private final WebClient webClient;

    public OpenAILogprobsService(OpenAIConfig openAIConfig) {
        this.openAIConfig = openAIConfig;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + openAIConfig.getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public Flux<TokenInfo> generateTokensWithLogprobs(String prompt, double temperature, int topK, double topP) {
        OpenAILogprobsRequest request = OpenAILogprobsRequest.builder()
                .model(openAIConfig.getModel())
                .messages(List.of(
                        OpenAILogprobsRequest.Message.builder()
                                .role("user")
                                .content(prompt)
                                .build()
                ))
                .temperature(temperature)
                .logprobs(true)
                .topLogprobs(Math.min(topK, 5)) // OpenAI max is 5
                .maxTokens(150)
                .stream(false)
                .build();

        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OpenAILogprobsResponse.class)
                .flatMapMany(this::processLogprobsResponse)
                .onErrorResume(error -> {
                    log.error("Error calling OpenAI logprobs API", error);
                    return Flux.error(new RuntimeException("Failed to get logprobs from OpenAI: " + error.getMessage()));
                });
    }

    private Flux<TokenInfo> processLogprobsResponse(OpenAILogprobsResponse response) {
        if (response.getChoices() == null || response.getChoices().isEmpty()) {
            return Flux.empty();
        }

        OpenAILogprobsResponse.Choice choice = response.getChoices().get(0);
        if (choice.getLogprobs() == null || choice.getLogprobs().getContent() == null) {
            return Flux.empty();
        }

        List<TokenInfo> tokens = new ArrayList<>();
        
        for (OpenAILogprobsResponse.ContentLogprob contentLogprob : choice.getLogprobs().getContent()) {
            // Convert log probability to regular probability
            double mainProbability = Math.exp(contentLogprob.getLogprob());
            
            // Extract alternatives from top_logprobs
            List<TokenInfo.TokenAlternative> alternatives = new ArrayList<>();
            if (contentLogprob.getTopLogprobs() != null) {
                for (OpenAILogprobsResponse.TopLogprob topLogprob : contentLogprob.getTopLogprobs()) {
                    // Skip the main token itself if it appears in alternatives
                    if (!topLogprob.getToken().equals(contentLogprob.getToken())) {
                        double altProbability = Math.exp(topLogprob.getLogprob());
                        alternatives.add(TokenInfo.TokenAlternative.builder()
                                .text(topLogprob.getToken())
                                .probability(altProbability)
                                .build());
                    }
                }
            }

            TokenInfo tokenInfo = TokenInfo.builder()
                    .text(contentLogprob.getToken())
                    .probability(mainProbability)
                    .alternatives(alternatives)
                    .timestamp(System.currentTimeMillis())
                    .build();

            tokens.add(tokenInfo);
        }

        return Flux.fromIterable(tokens)
                .delayElements(java.time.Duration.ofMillis(200)); // Simulate streaming delay
    }
}