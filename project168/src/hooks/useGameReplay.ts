import { useState, useEffect, useCallback } from 'react';
import type { MoveNode, Point } from '@/types';
import { getMainLineNodes } from '@/utils/sgfParser';

interface UseGameReplayReturn {
  currentNode: MoveNode;
  currentMoveNumber: number;
  totalMoves: number;
  stones: { point: Point; color: 'black' | 'white'; moveNumber: number }[];
  lastMove: Point | null;
  canGoBack: boolean;
  canGoForward: boolean;
  goToFirst: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToLast: () => void;
  goToMove: (moveNumber: number) => void;
  isAutoPlay: boolean;
  toggleAutoPlay: () => void;
  playSpeed: number;
  setPlaySpeed: (speed: number) => void;
};

export function useGameReplay(rootNode: MoveNode, autoPlaySpeed: number = 1000): UseGameReplayReturn {
  const mainLine = getMainLineNodes(rootNode);
  const totalMoves = mainLine.length - 1;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(autoPlaySpeed);

  const currentNode = mainLine[currentIndex] || rootNode;
  const currentMoveNumber = currentIndex;

  const stones = mainLine
    .slice(1, currentIndex + 1)
    .filter((node) => node.point !== null)
    .map((node) => ({
      point: node.point!,
      color: node.color,
      moveNumber: node.moveNumber,
    }));

  const lastMove = currentIndex > 0 && currentNode.point ? currentNode.point : null;

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < totalMoves;

  const goToFirst = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalMoves, prev + 1));
  }, [totalMoves]);

  const goToLast = useCallback(() => {
    setCurrentIndex(totalMoves);
  }, [totalMoves]);

  const goToMove = useCallback((moveNumber: number) => {
    setCurrentIndex(Math.max(0, Math.min(totalMoves, moveNumber)));
  }, [totalMoves]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalMoves) {
          setIsAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(timer);
  }, [isAutoPlay, playSpeed, totalMoves]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsAutoPlay(false);
  }, [rootNode.id]);

  return {
    currentNode,
    currentMoveNumber,
    totalMoves,
    stones,
    lastMove: lastMove as Point | null,
    canGoBack,
    canGoForward,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLast,
    goToMove,
    isAutoPlay: isAutoPlay,
    toggleAutoPlay,
    playSpeed,
    setPlaySpeed,
  };
}
