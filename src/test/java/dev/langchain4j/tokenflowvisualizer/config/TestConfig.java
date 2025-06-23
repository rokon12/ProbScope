package dev.langchain4j.tokenflowvisualizer.config;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.output.Response;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public OpenAiChatModel mockOpenAiChatModel() {
        OpenAiChatModel mockModel = Mockito.mock(OpenAiChatModel.class);

        // Create mock responses
        Response<AiMessage> defaultResponse = Response.from(AiMessage.from("This is a test response with multiple tokens"));
        Response<AiMessage> emptyResponse = Response.from(AiMessage.from(""));

        // Default case
        when(mockModel.generate(anyList())).thenReturn(defaultResponse);

        // Error case
        when(mockModel.generate(List.of(UserMessage.from("error"))))
            .thenThrow(new RuntimeException("OpenAI API Error"));

        // Empty response case
        when(mockModel.generate(List.of(UserMessage.from("empty"))))
            .thenReturn(emptyResponse);

        // Null response case
        when(mockModel.generate(List.of(UserMessage.from("null"))))
            .thenReturn(null);

        // Timeout case
        when(mockModel.generate(List.of(UserMessage.from("timeout"))))
            .thenAnswer(invocation -> {
                Thread.sleep(6000); // Sleep longer than the timeout
                return defaultResponse;
            });

        return mockModel;
    }
}
