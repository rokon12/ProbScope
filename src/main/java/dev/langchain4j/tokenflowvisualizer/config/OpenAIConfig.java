package dev.langchain4j.tokenflowvisualizer.config;

import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "openai")
@Data
public class OpenAIConfig {
    private String apiKey;
    private String model = "gpt-3.5-turbo";
    private double temperature = 1.0;

    @Bean
    public OpenAiChatModel openAiChatModel() {
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName(model)
                .temperature(temperature)
                .build();
    }
}
