// Music detection and analysis content script

console.log('Content script initialized');

import { MusicInfo } from '../utils/types';

class MusicDetector {
  private currentMusic: MusicInfo | null = null;

  constructor() {
    this.init();
  }

  private init() {
    console.log('Initializing MusicDetector');
    // Check if we're on music.163.com
    
    if (window.location.hostname.includes('music.163.com')) {
      this.setupNeteaseMusicDetection();
    }
    
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'GET_MUSIC_INFO') {
        sendResponse(this.currentMusic);
      }
    });
  }

  private setupNeteaseMusicDetection() {
    // Monitor DOM changes to detect when music player appears/changes
    const observer = new MutationObserver(() => {
      this.detectNeteaseMusic();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial detection
    this.detectNeteaseMusic();
  }

  private detectNeteaseMusic() {
    console.log('Detecting Netease music');
    // Try multiple selectors for audio element
    const audioElement = document.querySelector('audio') as HTMLAudioElement || 
                        document.querySelector('video') as HTMLAudioElement ||
                        document.querySelector('[data-type="audio"]') as HTMLAudioElement;

    // Alternative: Look for audio source in JavaScript variables
    let audioUrl = audioElement?.src;
    if (!audioUrl) {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const match = script.textContent?.match(/audioUrl\s*:\s*["']([^"']+)["']/);
        if (match) {
          audioUrl = match[1];
          break;
        }
      }
    }

    const titleElement = document.querySelector('.m-playbar .name') as HTMLElement ||
                        document.querySelector('.song-title') as HTMLElement ||
                        document.querySelector('.title') as HTMLElement;

    const artistElement = document.querySelector('.m-playbar .by') as HTMLElement ||
                         document.querySelector('.artist') as HTMLElement ||
                         document.querySelector('.singer') as HTMLElement;

    // console.log('Audio element:', audioElement);
    // console.log('Title element:', titleElement);
    // console.log('Artist element:', artistElement);

    if ((audioElement || audioUrl) || titleElement) {
      const musicInfo: MusicInfo = {
        title: titleElement.textContent?.trim() || 'Unknown Title',
        artist: artistElement?.textContent?.trim() || 'Unknown Artist',
        url: audioUrl || audioElement?.src || '',
        audioElement: audioElement
      };
    //   console.log('Music info:', musicInfo);
      // Only update and notify if the music has changed
      if (JSON.stringify(this.currentMusic) !== JSON.stringify(musicInfo)) {
        console.log('Current music:', this.currentMusic, ", new music:", musicInfo);
        this.currentMusic = musicInfo;
        this.notifyMusicChange(musicInfo);
      }
    }
  }

  private notifyMusicChange(musicInfo: MusicInfo) {
    console.log('Notifying music change:', musicInfo);
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'MUSIC_DETECTED',
      data: {
        title: musicInfo.title,
        artist: musicInfo.artist,
        url: musicInfo.url
      }
    });
  }

  public detectMusic() {
    if (window.location.hostname.includes('music.163.com')) {
      this.detectNeteaseMusic();
    }
  }
}

// Initialize the detector
const detector = new MusicDetector();
