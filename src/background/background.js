// Background script for Music Copilot

// Say hello when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Music Copilot initialized!");
}); 

// Enabled side panel to be visible
chrome.sidePanel.setOptions({
  path: 'sidepanel.html',
  enabled: true
})

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Store current music state
let currentMusicState = {
  isPlaying: false,
  musicInfo: null,
  understanding: null
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MUSIC_DETECTED') {
    handleMusicDetection(message.data, sender.tab?.id);
  }
});

console.log('Background script initialized');
async function handleMusicDetection(musicInfo, tabId) {
  console.log('Music detected:', musicInfo);
  currentMusicState.musicInfo = musicInfo;
  
  // Here we would integrate with an audio understanding service
  // For now, we'll use a mock response
  const understanding = await analyzeMusicWithAI(musicInfo);
  
  // Update state
  currentMusicState.understanding = understanding;
  
  // Notify the side panel of the update
  broadcastStateUpdate();
}

async function analyzeMusicWithAI(musicInfo) {
  const apiKey = "7b163267c3eb4e69bc8a5f7dccaedb48.rXWKg6oKBmEVZysa";
  const url = "https://open.bigmodel.cn/api/paas/v4/assistant";

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  const payload = {
    assistant_id: "659e54b1b8006379b4b2abd6",
    model: "glm-4-assistant",
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: `Analyze the song "${musicInfo.title}" by ${musicInfo.artist} and provide a structured analysis in English. 

        You MUST follow this exact format:
        1. Genre: [Genre classification(s)] 
        2. Mood: [Emotional characteristics]
        3. Key: [Musical key]
        4. Tempo: [BPM range or description]
        5. Instruments: [Comma-separated list of primary instruments]
        6. Analysis: [Detailed analysis in paragraph form]

        Example:
        1. Genre: Alternative Rock, Post-Grunge
        2. Mood: Melancholic, Introspective
        3. Key: E Minor
        4. Tempo: 92 BPM (Moderate)
        5. Instruments: Electric Guitar, Drums, Bass, Synthesizer
        6. Analysis: The song features...
        
        Avoid markdown formatting and maintain this exact numbering structure. Provide clear, concise answers for each section.`
      }]
    }],
    stream: true
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Reader done');
        break;
      }

      const chunk = new TextDecoder().decode(value);
      // Split merged chunks by "data: " delimiter
      const dataChunks = chunk.split('data: ');
      dataChunks.forEach(dataChunk => {
        if (dataChunk.trim()) {
          try {
            const data = JSON.parse(dataChunk);
            if (data.choices && data.choices[0]?.delta?.content) {
              content += data.choices[0].delta.content;
            }
          } catch (error) {
            console.error('Error parsing JSON chunk:', dataChunk);
          }
        }
      });
    }

    console.log('AI Analysis Result:', content);
    return parseAIContent(content);
  } catch (error) {
    console.error('Error analyzing music with AI:', error);
    return {
      genre: "Error",
      mood: "Error",
      key: "Error",
      tempo: "Error",
      instruments: ["Error"],
      analysis: "Failed to analyze music"
    };
  }
}

function parseAIContent(content) {
  try {
    const result = {};
    
    // Extract genre (updated for numbered format)
    const genreMatch = content.match(/1\.\s*Genre:\s*([\s\S]*?)(?=\n2\.|\n\d\.|$)/i);
    if (genreMatch) result.genre = genreMatch[1].trim();
    
    // Extract mood (updated for numbered format)
    const moodMatch = content.match(/2\.\s*Mood:\s*([\s\S]*?)(?=\n3\.|\n\d\.|$)/i);
    if (moodMatch) result.mood = moodMatch[1].trim();
    
    // Extract key (updated for numbered format)
    const keyMatch = content.match(/3\.\s*Key:\s*([\s\S]*?)(?=\n4\.|\n\d\.|$)/i);
    if (keyMatch) result.key = keyMatch[1].trim();
    
    // Extract tempo (updated for numbered format)
    const tempoMatch = content.match(/4\.\s*Tempo:\s*([\s\S]*?)(?=\n5\.|\n\d\.|$)/i);
    if (tempoMatch) result.tempo = tempoMatch[1].trim();
    
    // Extract instruments (updated for numbered format)
    const instrumentsMatch = content.match(/5\.\s*Instruments:\s*([\s\S]*?)(?=\n6\.|\n\d\.|$)/i);
    if (instrumentsMatch) {
      result.instruments = instrumentsMatch[1]
        .split(/,\s*/) // Split by commas with optional spaces
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    // Extract analysis (updated for numbered format)
    const analysisMatch = content.match(/6\.\s*Analysis:\s*([\s\S]*?)(?=\n\d\.|$)/i);
    if (analysisMatch) result.analysis = analysisMatch[1].trim();

    console.log('Parsed result:', result);
    return result;
  } catch (error) {
    console.error('Error parsing AI content:', error);
    return {
      genre: "Parsing Error",
      mood: "Parsing Error",
      key: "Parsing Error",
      tempo: "Parsing Error",
      instruments: ["Parsing Error"],
      analysis: "Failed to parse AI response"
    };
  }
}

function broadcastStateUpdate() {
  console.log('Broadcasting state update:', currentMusicState);
  // Send update to all extension views (sidepanel, popup, etc.)
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    data: currentMusicState
  });
}

// Handle requests for current state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_STATE') {
    console.log('Received GET_CURRENT_STATE message');
    sendResponse(currentMusicState);
  }
});

