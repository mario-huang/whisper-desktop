interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
    };
  }