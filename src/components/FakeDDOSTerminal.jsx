import { useState, useRef } from 'react';
import BaseWindow from './BaseWindow';
import './WindowStyles.css';

export default function FakeDDOSTerminal({ isOpen, onClose, onMinimize }) {
  const [step, setStep] = useState(0);
  const [site, setSite] = useState('');
  const [threads, setThreads] = useState('');
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [attacking, setAttacking] = useState(false);
  const [offline, setOffline] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 0 && input.trim()) {
      setSite(input.trim());
      setOutput([`Target site: ${input.trim()}`]);
      setInput('');
      setStep(1);
    } else if (step === 1 && input.trim()) {
      setThreads(input.trim());
      setOutput(prev => [...prev, `Threads: ${input.trim()}`]);
      setInput('');
      setStep(2);
      setAttacking(true);
      setTimeout(() => {
        setOffline(true);
        setOutput(prev => [...prev, `\n[!] ${site} is now OFFLINE!`]);
        setAttacking(false);
        setTimeout(() => {
          setOffline(false);
          setOutput(prev => [...prev, `[+] ${site} is back ONLINE.`]);
        }, 3000);
      }, 1800);
    }
  };

  let prompt = '';
  if (step === 0) prompt = 'Target site to DDoS?';
  else if (step === 1) prompt = 'How many threads?';
  else if (attacking) prompt = 'Attacking...';
  else if (offline) prompt = '';
  else prompt = '';

  return (
    <BaseWindow
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      title="Command Prompt"
      icon="💻"
      className="terminal"
    >
      <div className="terminal-content">
        <div className="terminal-output">
          <div className="terminal-header">
            Microsoft Windows [Version 10.0.22631.2861]<br/>
            (c) Microsoft Corporation. All rights reserved.
          </div>
          {output.map((line, idx) => (
            <div key={idx} className="terminal-line">{line}</div>
          ))}
          {attacking && (
            <div className="terminal-line">Sending {threads} threads to {site}...<br/>[{'█'.repeat(Math.min(threads, 10))}]</div>
          )}
          {offline && (
            <div className="terminal-line" style={{color:'#ff4444'}}>[!] {site} is now OFFLINE!</div>
          )}
        </div>
        {(!offline && !attacking && step < 2) && (
          <form onSubmit={handleSubmit} className="terminal-input-line">
            <span className="terminal-prompt">C:\Users\bu8f&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="terminal-input"
              autoFocus
            />
            <span className="terminal-prompt" style={{marginLeft:8}}>{prompt}</span>
          </form>
        )}
      </div>
    </BaseWindow>
  );
} 