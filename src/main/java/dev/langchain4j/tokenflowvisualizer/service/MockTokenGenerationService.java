package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@Profile("!openai")
public class MockTokenGenerationService implements TokenGenerationService {
    private final Random random = new Random();
    private final String[] sampleTokens = {
        "The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
        "Hello", "world", "from", "the", "token", "flow", "visualizer"
    };

    @Override
    public Flux<TokenInfo> generateTokens(String prompt, double temperature, int topK, double topP) {
        log.info("Mock service generating tokens for prompt: {}", prompt);
        
        // Generate 10-20 tokens
        int tokenCount = 10 + random.nextInt(10);
        List<TokenInfo> tokens = new ArrayList<>();
        
        for (int i = 0; i < tokenCount; i++) {
            String tokenText = sampleTokens[random.nextInt(sampleTokens.length)];
            double mainProbability = 0.3 + (random.nextDouble() * 0.7);
            
            List<TokenInfo.TokenAlternative> alternatives = new ArrayList<>();
            for (int j = 0; j < 5; j++) {
                alternatives.add(TokenInfo.TokenAlternative.builder()
                    .text(sampleTokens[random.nextInt(sampleTokens.length)])
                    .probability(mainProbability * (0.2 + random.nextDouble() * 0.6))
                    .build());
            }
            
            tokens.add(TokenInfo.builder()
                .text(tokenText)
                .probability(mainProbability)
                .alternatives(alternatives)
                .timestamp(System.currentTimeMillis() + i * 200)
                .build());
        }
        
        return Flux.fromIterable(tokens)
            .delayElements(Duration.ofMillis(200))
            .doOnNext(token -> log.debug("Emitting mock token: {}", token.getText()))
            .doOnComplete(() -> log.info("Mock token generation completed"));
    }
}