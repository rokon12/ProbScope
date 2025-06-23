package dev.langchain4j.tokenflowvisualizer.exception;

public class TokenGenerationTimeoutException extends TokenGenerationException {
    public TokenGenerationTimeoutException(String message) {
        super(message);
    }

    public TokenGenerationTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }

    public static TokenGenerationTimeoutException fromTimeout(long timeoutSeconds) {
        return new TokenGenerationTimeoutException(
            String.format("Token generation timed out after %d seconds", timeoutSeconds)
        );
    }

    public static TokenGenerationTimeoutException fromError(Throwable cause) {
        return new TokenGenerationTimeoutException(
            "Token generation timed out due to an error",
            cause
        );
    }
}