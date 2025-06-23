import { TokenInfo } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

if (!import.meta.env.VITE_API_URL) {
    console.warn('API URL not configured. Using default: http://localhost:8080/api');
}

export class TokenGenerationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenGenerationError';
    }
}

export interface TokenGenerationRequest {
    prompt: string;
    temperature: number;
    topK: number;
    topP: number;
}

export interface TokenGenerationResponse {
    tokens: TokenInfo[];
    error?: string;
}

export const generateTokens = async (request: TokenGenerationRequest): Promise<TokenInfo[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new TokenGenerationError(errorData.error || 'Failed to generate tokens');
        }

        const data = await response.json();
        return data.tokens || [];
    } catch (error) {
        if (error instanceof TokenGenerationError) {
            throw error;
        }
        throw new TokenGenerationError(error instanceof Error ? error.message : 'Failed to generate tokens');
    }
};

export const streamTokens = (
    request: TokenGenerationRequest,
    onToken: (token: TokenInfo) => void,
    onError: (error: Error) => void,
    onComplete: () => void
): () => void => {
    let aborted = false;

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tokens/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new TokenGenerationError(errorData.error || `Failed to generate tokens: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new TokenGenerationError('Stream not available');
            }

            const decoder = new TextDecoder();
            let buffer = '';
            let chunkCount = 0;

            while (!aborted) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log('📭 Stream ended. Total chunks received:', chunkCount);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                chunkCount++;
                buffer += chunk;
                
                // Try different SSE parsing approaches
                // Approach 1: Split by double newline
                let lines = buffer.split('\n\n');
                buffer = lines.pop() || '';
                
                for (const block of lines) {
                    if (!block || !block.trim()) continue;
                    
                    // The block might contain multiple lines, find the JSON data
                    let jsonData = block.trim();
                    
                    // Remove all 'data:' prefixes (might be doubled)
                    while (jsonData.startsWith('data:')) {
                        jsonData = jsonData.substring(5).trim();
                    }
                    
                    // Skip empty data
                    if (!jsonData || jsonData === '') continue;
                    
                    // Extract just the JSON part if there's extra content
                    const jsonMatch = jsonData.match(/^(\{.*\})/);
                    if (jsonMatch) {
                        try {
                            const token = JSON.parse(jsonMatch[1]) as TokenInfo;
                            onToken(token);
                        } catch (e) {
                            console.error('Error parsing JSON:', jsonMatch[1], e);
                        }
                    }
                }
            }

            onComplete();
        } catch (error) {
            onError(error as Error);
        }
    };

    fetchData();

    return () => {
        aborted = true;
    };
};
