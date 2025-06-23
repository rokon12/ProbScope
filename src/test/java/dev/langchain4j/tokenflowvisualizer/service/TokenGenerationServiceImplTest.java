package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.config.OpenAIConfig;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

@SpringBootTest
@TestPropertySource(properties = {
    "openai.api-key=${OPENAI_API_KEY}"
})
class TokenGenerationServiceImplTest {

    @Autowired
    private TokenGenerationService tokenGenerationService;

    @Test
    void shouldGenerateTokensWithValidPrompt() {
        // given
        String prompt = "Hello, how are you?";
        double temperature = 0.7;
        int topK = 50;
        double topP = 0.9;

        // when
        Flux<TokenInfo> tokenFlux = tokenGenerationService.generateTokens(prompt, temperature, topK, topP);

        // then
        StepVerifier.create(tokenFlux)
                .expectNextMatches(token -> {
                    // Verify token structure
                    return token.getText() != null &&
                           !token.getText().isEmpty() &&
                           token.getProbability() > 0 &&
                           token.getProbability() <= 1 &&
                           token.getAlternatives() != null &&
                           !token.getAlternatives().isEmpty();
                })
                .expectNextCount(2) // Expect at least 2 more tokens
                .expectComplete()
                .verify(Duration.ofSeconds(15));
    }

    @Test
    void shouldGenerateTokensWithDifferentTemperatures() {
        // given
        String prompt = "The weather is";

        // when - with low temperature (more focused)
        Flux<TokenInfo> lowTempFlux = tokenGenerationService.generateTokens(prompt, 0.2, 50, 0.9);

        // when - with high temperature (more random)
        Flux<TokenInfo> highTempFlux = tokenGenerationService.generateTokens(prompt, 1.8, 50, 0.9);

        // then
        StepVerifier.create(lowTempFlux)
                .expectNextMatches(token -> token.getText() != null)
                .expectNextCount(1)
                .expectComplete()
                .verify(Duration.ofSeconds(10));

        StepVerifier.create(highTempFlux)
                .expectNextMatches(token -> token.getText() != null)
                .expectNextCount(1)
                .expectComplete()
                .verify(Duration.ofSeconds(10));
    }

    @Test
    void shouldHandleEmptyPrompt() {
        StepVerifier.create(tokenGenerationService.generateTokens("", 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Prompt cannot be empty"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleInvalidTemperature() {
        StepVerifier.create(tokenGenerationService.generateTokens("Test", 2.5, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Temperature must be between 0.0 and 2.0"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleInvalidTopK() {
        StepVerifier.create(tokenGenerationService.generateTokens("Test", 0.7, 0, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("TopK must be greater than 0"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleInvalidTopP() {
        StepVerifier.create(tokenGenerationService.generateTokens("Test", 0.7, 50, 1.5))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("TopP must be between 0.0 and 1.0"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleNullPrompt() {
        StepVerifier.create(tokenGenerationService.generateTokens(null, 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof IllegalArgumentException &&
                    throwable.getMessage().equals("Prompt cannot be empty"))
                .verify(Duration.ofSeconds(5));
    }
}
