import React, { useState, useEffect } from "react";
import { icons } from "lucide-react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IconSelectorProps {
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

const ICONS_PER_BATCH = 100;

const IconSelector: React.FC<IconSelectorProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadedCount, setLoadedCount] = useState(ICONS_PER_BATCH);

  const filteredIcons = Object.entries(icons).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleIcons = filteredIcons.slice(0, loadedCount);

  // Reset loaded count when search term changes
  useEffect(() => {
    setLoadedCount(ICONS_PER_BATCH);
  }, [searchTerm]);

  const handleIconSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  const handleScrollCapture = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollArea = event.currentTarget;
    const scrollPosition = scrollArea.scrollTop + scrollArea.clientHeight;
    const scrollHeight = scrollArea.scrollHeight;

    // Load more when user scrolls to 80% of the current content
    if (scrollPosition > scrollHeight * 0.8) {
      setLoadedCount((prev) =>
        Math.min(prev + ICONS_PER_BATCH, filteredIcons.length)
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vybrat ikonu</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Hledat ikony..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <div
          className="h-[300px] w-full rounded-md border p-4 overflow-auto"
          onScrollCapture={handleScrollCapture}
        >
          <div className="grid grid-cols-4 gap-4">
            {visibleIcons.map(([key]) => (
              <Button
                key={key}
                variant="ghost"
                className="flex flex-col items-center h-auto py-2 px-1"
                onClick={() => handleIconSelect(key)}
              >
                <Icon name={key} className="w-8 h-8 text-gray-700 mb-1" />
                <span className="text-xs text-gray-600 text-center truncate w-full">
                  {key}
                </span>
              </Button>
            ))}
          </div>
          {loadedCount < filteredIcons.length && (
            <div className="text-center py-2 text-sm text-gray-500">
              Načítání dalších ikon...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IconSelector;
