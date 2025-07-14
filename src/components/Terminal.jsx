import { useState, useRef, useEffect } from 'react';
import './WindowStyles.css';

export default function Terminal({ isOpen, onClose, onMinimize }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentPath, setCurrentPath] = useState('C:\\Users\\bu8f>');
  const [output, setOutput] = useState([]);
  const inputRef = useRef(null);

  const commands = {
    'help': () => `Available commands:
help - Show this help message
dir - List directory contents
cd [path] - Change directory
cls - Clear screen
echo [text] - Display text
date - Show current date and time
whoami - Show current user
ipconfig - Show network configuration
ping [host] - Ping a host
notepad - Open notepad
calc - Open calculator
exit - Close terminal`,

    'dir': () => {
      const files = [
        { name: 'Desktop', type: '<DIR>', size: '' },
        { name: 'Documents', type: '<DIR>', size: '' },
        { name: 'Downloads', type: '<DIR>', size: '' },
        { name: 'Pictures', type: '<DIR>', size: '' },
        { name: 'Music', type: '<DIR>', size: '' },
        { name: 'Videos', type: '<DIR>', size: '' },
        { name: 'README.txt', type: '', size: '2,048 bytes' },
        { name: 'config.ini', type: '', size: '1,024 bytes' }
      ];
      
      let result = ` Directory of ${currentPath}\n\n`;
      files.forEach(file => {
        const date = new Date().toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        });
        const time = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        });
        result += `${date}  ${time}    ${file.type.padEnd(10)} ${file.name}\n`;
      });
      result += `\n        ${files.length} File(s)`;
      return result;
    },

    'cd': (args) => {
      if (!args || args === '..') {
        setCurrentPath('C:\\Users\\bu8f>');
        return 'Changed directory to C:\\Users\\bu8f';
      }
      if (args === 'Desktop' || args === 'Documents' || args === 'Downloads') {
        setCurrentPath(`C:\\Users\\bu8f\\${args}>`);
        return `Changed directory to C:\\Users\\bu8f\\${args}`;
      }
      return `The system cannot find the path specified.`;
    },

    'cls': () => {
      setOutput([]);
      return '';
    },

    'echo': (args) => args || '',

    'date': () => new Date().toLocaleString(),

    'whoami': () => 'bu8f',

    'ipconfig': () => `Windows IP Configuration

Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : local
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Wireless LAN adapter Wi-Fi:
   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 192.168.1.101
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,

    'ping': (args) => {
      if (!args) return 'Usage: ping <host>';
      return `Pinging ${args} [127.0.0.1] with 32 bytes of data:
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128

Ping statistics for 127.0.0.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 0ms, Average = 0ms`;
    },

    'notepad': () => 'Starting Notepad... (Demo mode - notepad not available)',
    'calc': () => 'Starting Calculator... (Demo mode - calculator not available)',
    'exit': () => {
      onClose();
      return '';
    }
  };

  const executeCommand = (commandLine) => {
    const parts = commandLine.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (commands[command]) {
      return commands[command](args);
    } else if (command) {
      return `'${command}' is not recognized as an internal or external command, operable program or batch file.`;
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const newOutput = [...output];
    newOutput.push(`${currentPath} ${currentCommand}`);
    
    const result = executeCommand(currentCommand);
    if (result) {
      newOutput.push(result);
    }
    
    setOutput(newOutput);
    setCommandHistory(prev => [...prev, currentCommand]);
    setCurrentCommand('');
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, output]);

  if (!isOpen) return null;

  return (
    <div className="window-overlay">
      <div className="window-modal terminal">
        <div className="window-titlebar">
          <div className="window-title">
            <span className="window-icon">💻</span>
            Command Prompt
          </div>
          <div className="window-controls">
            <button className="window-control minimize" onClick={onMinimize}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2" y="5" width="8" height="2" fill="currentColor"/>
              </svg>
            </button>
            <button className="window-control close" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="window-content terminal-content">
          <div className="terminal-output">
            <div className="terminal-header">
              Microsoft Windows [Version 10.0.22631.2861]
              (c) Microsoft Corporation. All rights reserved.
            </div>
            {output.map((line, index) => (
              <div key={index} className="terminal-line">
                {line}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="terminal-input-line">
            <span className="terminal-prompt">{currentPath}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              className="terminal-input"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
} 