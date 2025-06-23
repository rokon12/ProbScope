package dev.langchain4j.tokenflowvisualizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.tokenflowvisualizer.dto.TokenGenerationRequest;
import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import dev.langchain4j.tokenflowvisualizer.service.TokenGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenGenerationController {
    private final TokenGenerationService tokenGenerationService;
    private final ObjectMapper objectMapper;

    @PostMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<TokenInfo> generateTokens(@RequestBody TokenGenerationRequest request) {
        return tokenGenerationService.generateTokens(
            request.getPrompt(),
            request.getTemperature(),
            request.getTopK(),
            request.getTopP()
        );
    }

    @PostMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamTokens(@RequestBody TokenGenerationRequest request) {
        log.info("Received streaming request: prompt='{}', temp={}, topK={}, topP={}", 
            request.getPrompt(), request.getTemperature(), request.getTopK(), request.getTopP());
        
        return tokenGenerationService.generateTokens(
            request.getPrompt(),
            request.getTemperature(),
            request.getTopK(),
            request.getTopP()
        )
        .doOnNext(token -> log.info("Emitting token: {}", token.getText()))
        .map(token -> ServerSentEvent.builder(tokenToJson(token)).build())
        .doOnError(error -> log.error("Error during token streaming", error))
        .doOnComplete(() -> log.info("Token streaming completed"))
        .doOnCancel(() -> log.info("Token streaming cancelled"));
    }
    
    @GetMapping(path = "/test-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> testStream() {
        log.info("Test stream endpoint called");
        return Flux.interval(java.time.Duration.ofSeconds(1))
            .take(5)
            .map(i -> {
                TokenInfo token = TokenInfo.builder()
                    .text("Token" + i)
                    .probability(0.5 + (i * 0.1))
                    .alternatives(List.of(
                        TokenInfo.TokenAlternative.builder().text("Alt1").probability(0.3).build(),
                        TokenInfo.TokenAlternative.builder().text("Alt2").probability(0.2).build()
                    ))
                    .timestamp(System.currentTimeMillis())
                    .build();
                return "data: " + tokenToJson(token) + "\n\n";
            })
            .doOnNext(data -> log.info("Sending test data: {}", data));
    }
    
    private String tokenToJson(TokenInfo token) {
        try {
            return objectMapper.writeValueAsString(token);
        } catch (Exception e) {
            log.error("Failed to serialize token", e);
            return "{}";
        }
    }
}