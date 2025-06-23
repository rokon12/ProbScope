package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.config.TestConfig;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationException;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationTimeoutException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@SpringBootTest
@Import(TestConfig.class)
@ActiveProfiles("test")
class TokenGenerationServiceMockTest {

    @Autowired
    private TokenGenerationService tokenGenerationService;

    // Success cases
    @Test
    void shouldGenerateTokensWithMockResponse() {
        // given
        String prompt = "Test prompt";
        double temperature = 0.7;
        int topK = 50;
        double topP = 0.9;

        // when
        var tokenFlux = tokenGenerationService.generateTokens(prompt, temperature, topK, topP);

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
                .expectNextCount(6) // Expect 6 more tokens (total 7 for "This is a test response with multiple tokens")
                .expectComplete()
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleErrorsFromOpenAI() {
        // given
        String prompt = "error";
        double temperature = 0.7;
        int topK = 50;
        double topP = 0.9;

        // when & then
        StepVerifier.create(tokenGenerationService.generateTokens(prompt, temperature, topK, topP))
                .expectError(RuntimeException.class)
                .verify(Duration.ofSeconds(5));
    }

    // Error cases - OpenAI API
    @Test
    void shouldHandleOpenAIError() {
        StepVerifier.create(tokenGenerationService.generateTokens("error", 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof RuntimeException &&
                    throwable.getMessage().equals("OpenAI API Error"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleNullResponse() {
        StepVerifier.create(tokenGenerationService.generateTokens("null", 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().equals("Invalid response received from OpenAI"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleEmptyResponse() {
        StepVerifier.create(tokenGenerationService.generateTokens("empty", 0.7, 50, 0.9))
                .expectComplete()
                .verify(Duration.ofSeconds(5));
    }

    // Error cases - Input validation
    @Test
    void shouldHandleNullPrompt() {
        StepVerifier.create(tokenGenerationService.generateTokens(null, 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().equals("Prompt cannot be empty"))
                .verify(Duration.ofSeconds(5));
    }

    @Test
    void shouldHandleEmptyPrompt() {
        StepVerifier.create(tokenGenerationService.generateTokens("", 0.7, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().equals("Prompt cannot be empty"))
                .verify(Duration.ofSeconds(5));
    }

    @ParameterizedTest
    @ValueSource(doubles = {-0.1, 2.1})
    void shouldHandleInvalidTemperature(double temperature) {
        StepVerifier.create(tokenGenerationService.generateTokens("test", temperature, 50, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().contains("Temperature must be between 0.0 and 2.0"))
                .verify(Duration.ofSeconds(5));
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1})
    void shouldHandleInvalidTopK(int topK) {
        StepVerifier.create(tokenGenerationService.generateTokens("test", 0.7, topK, 0.9))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().contains("TopK must be greater than 0"))
                .verify(Duration.ofSeconds(5));
    }

    @ParameterizedTest
    @ValueSource(doubles = {-0.1, 1.1})
    void shouldHandleInvalidTopP(double topP) {
        StepVerifier.create(tokenGenerationService.generateTokens("test", 0.7, 50, topP))
                .expectErrorMatches(throwable -> 
                    throwable instanceof TokenGenerationException &&
                    throwable.getMessage().contains("TopP must be between 0.0 and 1.0"))
                .verify(Duration.ofSeconds(5));
    }

    // Advanced cases - Timeout and Concurrency
    @Test
    void shouldHandleTimeout() {
        // Configure test to use a very long response that would trigger timeout
        StepVerifier.create(tokenGenerationService.generateTokens("timeout", 0.7, 50, 0.9))
                .expectSubscription()
                .expectErrorSatisfies(throwable -> {
                    assert throwable instanceof TokenGenerationTimeoutException;
                    assert throwable.getMessage().contains("Token generation timed out after 5 seconds");
                    assert throwable.getMessage().contains("seconds");
                })
                .verify(Duration.ofSeconds(6));
    }

    @Test
    void shouldHandleConcurrentTimeouts() {
        int numRequests = 3;
        List<Flux<TokenInfo>> fluxes = new ArrayList<>();

        // Create multiple timeout requests
        for (int i = 0; i < numRequests; i++) {
            fluxes.add(tokenGenerationService.generateTokens("timeout", 0.7, 50, 0.9));
        }

        // Verify all requests timeout properly
        Flux.merge(fluxes)
            .as(StepVerifier::create)
            .expectError(TokenGenerationTimeoutException.class)
            .verify(Duration.ofSeconds(7));
    }

    @Test
    void shouldHandleConcurrentRequests() throws InterruptedException {
        int numRequests = 5;
        CountDownLatch latch = new CountDownLatch(numRequests);
        List<List<TokenInfo>> results = new ArrayList<>();

        for (int i = 0; i < numRequests; i++) {
            final int index = i;
            Flux<TokenInfo> tokenFlux = tokenGenerationService.generateTokens(
                "Test prompt " + index, 0.7, 50, 0.9
            );

            tokenFlux.collectList().subscribe(
                tokens -> {
                    synchronized (results) {
                        results.add(tokens);
                    }
                    latch.countDown();
                },
                error -> latch.countDown()
            );
        }

        boolean completed = latch.await(15, TimeUnit.SECONDS);
        assert completed : "Timed out waiting for concurrent requests";
        assert results.size() == numRequests : "Not all requests completed successfully";
    }

    // Success cases - Parameter variations
    @Test
    void shouldGenerateTokensWithDifferentTemperatures() {
        // Low temperature
        StepVerifier.create(tokenGenerationService.generateTokens("Test prompt", 0.1, 50, 0.9))
                .expectNextCount(7)
                .expectComplete()
                .verify(Duration.ofSeconds(5));

        // High temperature
        StepVerifier.create(tokenGenerationService.generateTokens("Test prompt", 1.8, 50, 0.9))
                .expectNextCount(7)
                .expectComplete()
                .verify(Duration.ofSeconds(5));
    }
}
