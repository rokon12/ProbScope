package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.tokenflowvisualizer.config.OpenAIConfig;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationException;
import dev.langchain4j.tokenflowvisualizer.exception.TokenGenerationTimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@Profile("openai")
@RequiredArgsConstructor
public class TokenGenerationServiceImpl implements TokenGenerationService {
    private final OpenAIConfig openAIConfig;
    private final Random random = new Random();

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

        return Flux.<TokenInfo>create(sink -> {
            try {
                log.debug("Starting token generation for prompt: {}", prompt);
                var model = OpenAiChatModel.builder()
                        .apiKey(openAIConfig.getApiKey())
                        .modelName(openAIConfig.getModel())
                        .temperature(temperature)
                        .build();

                var message = UserMessage.from(prompt);
                Response<AiMessage> response = model.generate(List.of(message));

                if (response == null || response.content() == null || response.content().text() == null) {
                    log.error("Received invalid response from OpenAI");
                    throw new RuntimeException("Invalid response from OpenAI");
                }
                log.debug("Received response from OpenAI: {}", response.content().text());

                String[] tokens = response.content().text().split(" ");
                if (tokens.length == 0) {
                    return;
                }

                log.debug("Processing {} tokens from OpenAI response", tokens.length);
                for (String token : tokens) {
                    // Simulate token probabilities
                    double mainProbability = 0.3 + (random.nextDouble() * 0.7);
                    List<TokenInfo.TokenAlternative> alternatives = generateAlternatives(mainProbability);

                    TokenInfo tokenInfo = TokenInfo.builder()
                        .text(token)
                        .probability(mainProbability)
                        .alternatives(alternatives)
                        .timestamp(System.currentTimeMillis())
                        .build();

                    sink.next(tokenInfo);

                    try {
                        // Add delay to simulate streaming
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        sink.error(e);
                        return;
                    }
                }

                sink.complete();
            } catch (Exception e) {
                log.error("Error during token generation", e);
                if (e instanceof TokenGenerationException) {
                    sink.error(e);
                } else {
                    sink.error(new TokenGenerationException("Error generating tokens: " + e.getMessage(), e));
                }
            }
        })
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
            return new TokenGenerationException("Unexpected error during token generation", throwable);
        });
    }

    private List<TokenInfo.TokenAlternative> generateAlternatives(double mainProbability) {
        List<TokenInfo.TokenAlternative> alternatives = new ArrayList<>();
        String[] alternativeWords = {
            "the", "a", "and", "to", "of", "in", "that", "is", "for", "it",
            "with", "as", "was", "on", "be", "at", "by", "have", "from", "or"
        };
        
        // Generate 9-10 alternatives with decreasing probabilities
        for (int i = 0; i < Math.min(10, alternativeWords.length); i++) {
            double altProbability = mainProbability * (0.8 - (i * 0.08));
            alternatives.add(TokenInfo.TokenAlternative.builder()
                    .text(alternativeWords[random.nextInt(alternativeWords.length)])
                    .probability(Math.max(0.01, altProbability))
                    .build());
        }
        return alternatives;
    }

    private String generateRandomToken() {
        return Integer.toHexString(random.nextInt(1000000));
    }
}
