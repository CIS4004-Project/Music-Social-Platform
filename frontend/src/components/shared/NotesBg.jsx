import React, { useEffect, useRef } from 'react';

const NOTES = ['♩', '♪', '♫', '♬'];
const COLORS = ['#d8b4e2', '#a64d79', '#674ea7', '#ffffff', '#ff00ff', '#8a2be2'];

function NotesBg() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createNote = () => {
      const note = document.createElement('div');
      note.classList.add('falling-note');
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];

      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 6;
      const size = Math.random() * 18 + 12;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const delay = Math.random() * 5;

      note.style.left = `${left}vw`;
      note.style.fontSize = `${size}px`;
      note.style.color = color;
      note.style.animationDuration = `${duration}s`;
      note.style.animationDelay = `${delay}s`;
      note.style.textShadow = `0 0 ${size / 2}px ${color}`;

      container.appendChild(note);

      setTimeout(() => note.remove(), (duration + delay) * 1000);
    };

    // Create initial batch
    for (let i = 0; i < 20; i++) createNote();
    const interval = setInterval(createNote, 400);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className="notes-bg" ref={containerRef} />;
}

export default NotesBg;
