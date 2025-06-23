package dev.langchain4j.tokenflowvisualizer.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "openai.api-key=test-api-key",
    "openai.model=gpt-3.5-turbo",
    "openai.temperature=0.7"
})
class OpenAIConfigTest {

    @Autowired
    private OpenAIConfig openAIConfig;

    @Test
    void shouldLoadConfiguration() {
        assertNotNull(openAIConfig);
        assertEquals("test-api-key", openAIConfig.getApiKey());
        assertEquals("gpt-3.5-turbo", openAIConfig.getModel());
        assertEquals(0.7, openAIConfig.getTemperature());
    }

    @Test
    void shouldCreateOpenAiChatModel() {
        var model = openAIConfig.openAiChatModel();
        assertNotNull(model, "OpenAI chat model should be created");
    }
}