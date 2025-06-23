package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.config.OpenAIConfig;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.dto.openai.OpenAILogprobsRequest;
import dev.langchain4j.tokenflowvisualizer.dto.openai.OpenAILogprobsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Profile("logprobs")
public class TokenGenerationServiceWithLogprobs implements TokenGenerationService{

    private final OpenAIConfig openAIConfig;
    private final WebClient webClient;

    public TokenGenerationServiceWithLogprobs(OpenAIConfig openAIConfig) {
        this.openAIConfig = openAIConfig;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openAIConfig.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public Flux<TokenInfo> generateTokens(String prompt,
                                                      double temperature,
                                                      int topK,
                                                      double topP) {

        int topLogprobs = Math.max(1, Math.min(topK, 5)); // enforce 1–5 (OpenAI limit)
        int k = Math.max(1, Math.min(topK, 5));
        double safeTopP = Math.min(Math.max(topP, 0d), 1d);

        OpenAILogprobsRequest request = OpenAILogprobsRequest.builder()
                .model(openAIConfig.getModel())
                .messages(List.of(
                        OpenAILogprobsRequest.Message.builder()
                                .role("user")
                                .content(prompt)
                                .build()
                ))
                .temperature(temperature)
                .topP(safeTopP)
                .logprobs(true)
                .topLogprobs(topLogprobs)
                .maxTokens(150)
                .stream(false)
                .build();

        log.info("Generating tokens with: {}", request);

        return webClient.post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError,
                        resp -> resp.createException().flatMap(Mono::error))
                .bodyToMono(OpenAILogprobsResponse.class)
                .flatMapMany(this::processLogprobsResponse)
                .log()
                .onErrorResume(err -> {
                    log.error("Error calling OpenAI logprobs API", err);
                    return Flux.error(new IllegalStateException(
                            "Failed to get logprobs from OpenAI", err));
                });
    }

    private Flux<TokenInfo> processLogprobsResponse(OpenAILogprobsResponse response) {
        if (response.getChoices() == null || response.getChoices().isEmpty()) {
            return Flux.empty();
        }

        OpenAILogprobsResponse.Choice choice = response.getChoices().getFirst();
        if (choice.getLogprobs() == null || choice.getLogprobs().getContent() == null) {
            return Flux.empty();
        }

        List<TokenInfo> tokenInfos = new ArrayList<>();

        for (OpenAILogprobsResponse.ContentLogprob cl : choice.getLogprobs().getContent()) {
            double mainProb = Math.exp(cl.getLogprob());

            List<TokenInfo.TokenAlternative> alternatives = new ArrayList<>();
            if (cl.getTopLogprobs() != null) {
                for (OpenAILogprobsResponse.TopLogprob tl : cl.getTopLogprobs()) {
                    if (!tl.getToken().equals(cl.getToken())) {
                        alternatives.add(TokenInfo.TokenAlternative.builder()
                                .text(tl.getToken())
                                .probability(Math.exp(tl.getLogprob()))
                                .build());
                    }
                }
            }

            tokenInfos.add(TokenInfo.builder()
                    .text(cl.getToken())
                    .probability(mainProb)
                    .alternatives(alternatives)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }

        // Simulate streaming behaviour
        return Flux.fromIterable(tokenInfos)
                .delayElements(Duration.ofMillis(200));
    }
}
