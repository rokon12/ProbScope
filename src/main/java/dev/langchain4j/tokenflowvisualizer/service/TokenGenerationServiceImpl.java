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
import java.util.*;

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
                var response = model.chat(List.of(message));

                if (response == null || response.aiMessage().text() == null ) {
                    log.error("Received invalid response from OpenAI");
                    throw new RuntimeException("Invalid response from OpenAI");
                }
                log.debug("Received response from OpenAI: {}", response.aiMessage().text());

                String[] tokens = response.aiMessage().text().split(" ");
                if (tokens.length == 0) {
                    return;
                }

                log.debug("Processing {} tokens from OpenAI response", tokens.length);
                for (String token : tokens) {
                    // Simulate token probabilities
                    double mainProbability = 0.3 + (random.nextDouble() * 0.7);
                    List<TokenInfo.TokenAlternative> alternatives = generateAlternatives(token, mainProbability);

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

    private List<TokenInfo.TokenAlternative> generateAlternatives(String selectedToken, double mainProbability) {
        List<TokenInfo.TokenAlternative> alternatives = new ArrayList<>();
        
        // Generate contextual alternatives based on the selected token
        Set<String> alternativeWords = generateContextualAlternatives(selectedToken);
        
        // Convert to list and limit to 9 alternatives
        List<String> altWordsList = new ArrayList<>(alternativeWords);
        Collections.shuffle(altWordsList, random);
        
        // Generate alternatives with decreasing probabilities
        for (int i = 0; i < Math.min(9, altWordsList.size()); i++) {
            // Create realistic probability distribution
            double altProbability = mainProbability * (0.9 - (i * 0.08)) * (0.7 + random.nextDouble() * 0.3);
            alternatives.add(TokenInfo.TokenAlternative.builder()
                    .text(altWordsList.get(i))
                    .probability(Math.max(0.01, altProbability))
                    .build());
        }
        
        return alternatives;
    }
    
    private Set<String> generateContextualAlternatives(String selectedToken) {
        Set<String> alternatives = new HashSet<>();
        
        // Common word alternatives based on context
        Map<String, String[]> contextualAlternatives = Map.of(
            "the", new String[]{"a", "an", "this", "that", "his", "her", "my", "our", "some"},
            "is", new String[]{"was", "are", "were", "being", "seems", "appears", "becomes", "looks", "feels"},
            "and", new String[]{"or", "but", "then", "also", "plus", "with", "as", "while", "yet"},
            "to", new String[]{"from", "for", "with", "by", "in", "on", "at", "of", "into"},
            "a", new String[]{"the", "an", "one", "some", "any", "this", "that", "each", "every"},
            "of", new String[]{"from", "in", "on", "at", "by", "for", "with", "about", "through"},
            "in", new String[]{"on", "at", "by", "for", "with", "under", "over", "through", "during"},
            "that", new String[]{"this", "which", "what", "who", "when", "where", "how", "why", "it"},
            "have", new String[]{"has", "had", "having", "own", "get", "take", "make", "do", "keep"},
            "for", new String[]{"to", "with", "by", "in", "on", "at", "from", "about", "during"}
        );
        
        // Get alternatives for the selected token
        String[] directAlts = contextualAlternatives.get(selectedToken.toLowerCase());
        if (directAlts != null) {
            alternatives.addAll(Arrays.asList(directAlts));
        }
        
        // Add token variations based on patterns
        if (selectedToken.endsWith("ing")) {
            alternatives.addAll(Arrays.asList("running", "walking", "talking", "thinking", "working", "playing", "reading", "writing"));
        } else if (selectedToken.endsWith("ed")) {
            alternatives.addAll(Arrays.asList("walked", "talked", "worked", "played", "looked", "seemed", "appeared", "happened"));
        } else if (selectedToken.endsWith("ly")) {
            alternatives.addAll(Arrays.asList("quickly", "slowly", "carefully", "quietly", "loudly", "clearly", "really", "probably"));
        } else if (selectedToken.endsWith("s") && selectedToken.length() > 2) {
            // Plural nouns
            alternatives.addAll(Arrays.asList("cats", "dogs", "cars", "books", "people", "things", "places", "ideas", "words"));
        }
        
        // Add common words based on token characteristics
        if (selectedToken.length() <= 3) {
            // Short words
            alternatives.addAll(Arrays.asList("the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use"));
        } else if (Character.isUpperCase(selectedToken.charAt(0))) {
            // Capitalized words (proper nouns, sentence starts)
            alternatives.addAll(Arrays.asList("The", "This", "That", "When", "Where", "How", "Why", "What", "John", "Mary", "London", "America", "Today", "Yesterday"));
        } else {
            // Regular words
            alternatives.addAll(Arrays.asList("about", "after", "again", "against", "all", "also", "always", "another", "any", "because", "before", "being", "between", "both", "came", "come", "could", "each", "even", "every", "first", "from", "good", "great", "group", "hand", "hard", "here", "high", "however", "important", "into", "large", "last", "left", "life", "little", "long", "made", "make", "many", "may", "might", "more", "most", "move", "much", "must", "name", "need", "never", "next", "night", "number", "often", "only", "other", "over", "own", "place", "point", "public", "right", "same", "school", "seem", "several", "should", "show", "since", "small", "some", "still", "such", "system", "take", "than", "them", "these", "they", "think", "those", "though", "three", "through", "time", "today", "together", "turn", "under", "until", "very", "want", "water", "well", "went", "were", "what", "when", "where", "which", "while", "will", "with", "within", "without", "work", "world", "would", "write", "year", "young"));
        }
        
        // Remove the selected token itself from alternatives
        alternatives.remove(selectedToken);
        alternatives.remove(selectedToken.toLowerCase());
        alternatives.remove(selectedToken.toUpperCase());
        
        return alternatives;
    }

    private String generateRandomToken() {
        return Integer.toHexString(random.nextInt(1000000));
    }
}
