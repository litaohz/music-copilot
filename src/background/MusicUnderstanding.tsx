import React, { useEffect, useState } from 'react';
//  init the content script

interface MusicInfo {
  title: string;
  artist: string;
  url: string;
}

interface MusicUnderstanding {
  genre: string;
  mood: string;
  key: string;
  tempo: string;
  instruments: string[];
  analysis: string;
}

interface MusicState {
  isPlaying: boolean;
  musicInfo: MusicInfo | null;
  understanding: MusicUnderstanding | null;
}

const MusicUnderstanding: React.FC = () => {
  const [musicState, setMusicState] = useState<MusicState | null>(null);
  const handleDetectMusic = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        console.log('Sending message to content script');
        chrome.runtime.sendMessage({ type: 'GET_CURRENT_STATE' }, (response) => {
          console.log('1st Response from background script:', response);
          setMusicState(response);
        });
      }
    });
  };

  useEffect(() => { 
    console.log('MusicUnderstanding component mounted');
  

    // Get initial state
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_STATE' }, (response) => {
      console.log('2nd Response from background script:', response);
      setMusicState(response);
    });

    // Listen for state updates
    const listener = (message: any) => {
      if (message.type === 'STATE_UPDATE') {
        console.log('Received state update:', message.data);
        setMusicState(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // if (!musicState?.musicInfo) {
  //   return (
  //     <div className="p-4">
  //       <div className="text-center text-gray-600">
  //         No music detected. Please play a song on a supported music platform.
  //       </div>
  //     </div>
  //   );
  // }

  const { musicInfo, understanding } = musicState || {};

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        {/* <h1 className="text-2xl font-bold">Music Analysis</h1> */}
        {/* <button 
          onClick={handleDetectMusic}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Detect Music
        </button> */}
      </div>
      {/* Current Music Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-2">Now Playing</h2>
        <p className="text-lg">{musicInfo?.title}</p>
        <p className="text-gray-600">{musicInfo?.artist}</p>
      </div>

      {/* Music Understanding */}
      {understanding && (
        <div className="space-y-4">
          {/* Basic Analysis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700">Genre</h3>
              <p>{understanding?.genre}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700">Mood</h3>
              <p>{understanding?.mood}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700">Key</h3>
              <p>{understanding.key}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700">Tempo</h3>
              <p>{understanding?.tempo}</p>
            </div>
          </div>

          {/* Instruments */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Instruments</h3>
            <div className="flex flex-wrap gap-2">
              {understanding?.instruments?.map((instrument, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {instrument}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Analysis</h3>
            <p className="text-gray-600 whitespace-pre-line">{understanding?.analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicUnderstanding; 