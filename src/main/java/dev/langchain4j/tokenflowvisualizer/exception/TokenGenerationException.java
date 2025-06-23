package dev.langchain4j.tokenflowvisualizer.exception;

public class TokenGenerationException extends RuntimeException {
    public TokenGenerationException(String message) {
        super(message);
    }

    public TokenGenerationException(String message, Throwable cause) {
        super(message, cause);
    }

    public static TokenGenerationException invalidResponse() {
        return new TokenGenerationException("Invalid response received from OpenAI");
    }

    public static TokenGenerationException invalidTemperature(double temperature) {
        return new TokenGenerationException(
            String.format("Temperature must be between 0.0 and 2.0, but was: %.1f", temperature)
        );
    }

    public static TokenGenerationException invalidTopK(int topK) {
        return new TokenGenerationException(
            String.format("TopK must be greater than 0, but was: %d", topK)
        );
    }

    public static TokenGenerationException invalidTopP(double topP) {
        return new TokenGenerationException(
            String.format("TopP must be between 0.0 and 1.0, but was: %.1f", topP)
        );
    }

    public static TokenGenerationException emptyPrompt() {
        return new TokenGenerationException("Prompt cannot be empty");
    }
}