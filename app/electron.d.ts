interface Window {
  electronAPI: {
    getVersion: () => Promise<string>;
    startWhisper: () => Promise<void>;
    onStartWhisper: (callback: (data: string) => void) => void;
  };
}
