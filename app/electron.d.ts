interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      startWhisper: () => Promise<void>;
    };
  }