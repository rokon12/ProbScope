package dev.langchain4j.tokenflowvisualizer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class WebConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allow specific origins for localhost development
        corsConfig.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",  // Vite dev server
            "http://localhost:5173",  // Vite default port
            "http://localhost:8080"   // Production
        ));
        
        // Allow all methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all headers, especially for SSE
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose headers needed for SSE
        corsConfig.setExposedHeaders(Arrays.asList("Content-Type", "X-Content-Type-Options"));
        
        // Allow credentials
        corsConfig.setAllowCredentials(true);
        
        // Cache preflight response
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
