'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync?: {
          get: (keys: string[], callback: (result: { [key: string]: any }) => void) => void;
          set: (items: { [key: string]: any }, callback?: () => void) => void;
        };
      };
      runtime?: {
        sendMessage: (message: any) => void;
      };
    };
  }
}

export default function Popup() {
  const [groupInterval, setGroupInterval] = useState<number>(4);
  const [isExtension, setIsExtension] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as Chrome extension
    if (typeof window !== 'undefined' && window.chrome && window.chrome.storage) {
      setIsExtension(true);
      window.chrome.storage.sync.get(['groupInterval'], (result) => {
        if (result.groupInterval) {
          setGroupInterval(result.groupInterval);
        }
      });
    }
  }, []);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setGroupInterval(value);
    if (isExtension && window.chrome && window.chrome.storage) {
      window.chrome.storage.sync.set({ groupInterval: value });
    }
  };

  const handleGroupTabs = () => {
    if (isExtension && window.chrome && window.chrome.runtime) {
      window.chrome.runtime.sendMessage({ action: 'groupTabs' });
    } else {
      console.log('Group tabs functionality is only available in the Chrome extension');
    }
  };

  return (
    <div className="p-4 w-64">
      <h1 className="text-lg font-bold mb-4">Tab Grouper</h1>
      <div className="mb-4">
        <Label htmlFor="interval">Group Interval (hours)</Label>
        <Input
          id="interval"
          type="number"
          value={groupInterval}
          onChange={handleIntervalChange}
          min={1}
          className="w-full"
        />
      </div>
      <Button onClick={handleGroupTabs} className="w-full">
        Group Tabs
      </Button>
      {!isExtension && (
        <p className="mt-4 text-sm text-red-500">
          Note: Full functionality is only available when running as a Chrome extension.
        </p>
      )}
    </div>
  );
}

