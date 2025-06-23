package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationException;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationTimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;

@Slf4j
@Service
@Profile("logprobs")
@RequiredArgsConstructor
public class TokenGenerationServiceWithLogprobs implements TokenGenerationService {

    private final OpenAILogprobsService openAILogprobsService;

    @Value("${token.generation.timeout:10}")
    private long timeoutSeconds;

    @Override
    public Flux<TokenInfo> generateTokens(String prompt, double temperature, int topK, double topP) {
        // Validate input parameters
        if (prompt == null || prompt.trim().isEmpty()) {
            log.error("Empty prompt provided");
            return Flux.error(TokenGenerationException.emptyPrompt());
        }
        if (temperature < 0.0 || temperature > 2.0) {
            log.error("Invalid temperature value: {}", temperature);
            return Flux.error(TokenGenerationException.invalidTemperature(temperature));
        }
        if (topK < 1) {
            log.error("Invalid topK value: {}", topK);
            return Flux.error(TokenGenerationException.invalidTopK(topK));
        }
        if (topP <= 0.0 || topP > 1.0) {
            log.error("Invalid topP value: {}", topP);
            return Flux.error(TokenGenerationException.invalidTopP(topP));
        }

        log.info("Generating tokens with real OpenAI logprobs for prompt: {}", prompt);
        
        return openAILogprobsService.generateTokensWithLogprobs(prompt, temperature, topK, topP)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .onErrorMap(throwable -> {
                    if (throwable instanceof TokenGenerationException) {
                        return throwable;
                    }
                    if (throwable instanceof java.util.concurrent.TimeoutException) {
                        log.error("Token generation timed out after {} seconds", timeoutSeconds);
                        return TokenGenerationTimeoutException.fromTimeout(timeoutSeconds);
                    }
                    log.error("Unexpected error during token generation", throwable);
                    return new TokenGenerationException("Unexpected error during token generation: " + throwable.getMessage(), throwable);
                });
    }
}