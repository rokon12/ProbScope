package dev.langchain4j.tokenflowvisualizer.service;

import dev.langchain4j.tokenflowvisualizer.dto.TokenInfo;
import reactor.core.publisher.Flux;

public interface TokenGenerationService {
    Flux<TokenInfo> generateTokens(String prompt, double temperature, int topK, double topP);
}