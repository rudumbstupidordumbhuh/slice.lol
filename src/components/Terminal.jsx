import { useState, useRef, useEffect } from 'react';
import BaseWindow from './BaseWindow';
import './WindowStyles.css';

export default function Terminal({ isOpen, onClose, onMinimize, onSurprise }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentPath, setCurrentPath] = useState('C:\\Users\\bu8f>');
  const [output, setOutput] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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
python [file] - Run Python file
type [file] - Display file contents
copy [src] [dest] - Copy file
del [file] - Delete file
mkdir [name] - Create directory
rmdir [name] - Remove directory
systeminfo - Show system information
tasklist - Show running processes
netstat - Show network connections
shutdown - Shutdown system
restart - Restart system
matrix - Enter the Matrix
fortune - Get a random fortune
cowsay [text] - Display a cow with a message
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

    'notepad': () => 'Starting Notepad...',
    'calc': () => 'Starting Calculator...',
    'python': (args) => {
      if (!args) return 'Usage: python <file>';
      if (args === 'surprise.py') {
        onSurprise();
        return 'Executing surprise.py... 🎉';
      }
      return `Python: can't open file '${args}': [Errno 2] No such file or directory`;
    },
    'type': (args) => {
      if (!args) return 'Usage: type <file>';
      if (args === 'surprise.py') {
        return `import time
import random

def create_confetti():
    colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']
    for i in range(100):
        print(f"🎉 Confetti piece {i+1} in {random.choice(colors)}")
        time.sleep(0.1)

def flash_screen():
    for i in range(20):
        print("\\033[5m\\033[31mFLASH!\\033[0m")
        time.sleep(0.1)

print("🎊 SURPRISE! 🎊")
print("Starting amazing effects...")
create_confetti()
flash_screen()
print("✨ You found the secret! ✨")`;
      }
      return `The system cannot find the file specified.`;
    },
    'copy': (args) => {
      if (!args) return 'Usage: copy <source> <destination>';
      return `1 file(s) copied.`;
    },
    'del': (args) => {
      if (!args) return 'Usage: del <file>';
      return `File deleted.`;
    },
    'mkdir': (args) => {
      if (!args) return 'Usage: mkdir <name>';
      return `Directory created.`;
    },
    'rmdir': (args) => {
      if (!args) return 'Usage: rmdir <name>';
      return `Directory removed.`;
    },
    'systeminfo': () => `OS Name:                   Microsoft Windows 10 Pro
OS Version:                10.0.22631 Build 22631
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          bu8f
Registered Organization:   
Product ID:                00330-80000-00000-AAOEM
Original Install Date:     12/1/2023, 2:30:00 PM
System Boot Time:          12/15/2023, 9:15:30 AM
System Manufacturer:       Dell Inc.
System Model:              XPS 15 9500
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 165 Stepping 5 GenuineIntel ~2592 Mhz
BIOS Version:              Dell Inc. 1.15.0, 8/15/2023
Windows Directory:         C:\\Windows
System Directory:          C:\\Windows\\System32
Boot Device:               \\Device\\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-05:00) Eastern Time (US & Canada)
Total Physical Memory:     16,384 MB
Available Physical Memory: 8,192 MB
Virtual Memory: Max Size:  18,944 MB
Virtual Memory: Available: 9,472 MB
Virtual Memory: In Use:    9,472 MB`,
    'tasklist': () => `Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
System Idle Process              0 Services                   0          8 K
System                           4 Services                   0        132 K
Registry                        96 Services                   0     45,632 K
smss.exe                       388 Services                   0        832 K
csrss.exe                      496 Services                   0      3,456 K
wininit.exe                    584 Services                   0      4,096 K
services.exe                   672 Services                   0      8,192 K
lsass.exe                      680 Services                   0     12,288 K
winlogon.exe                   728 Console                    1      6,144 K
explorer.exe                   856 Console                    1     45,056 K
chrome.exe                    1234 Console                    1     89,088 K
code.exe                      1456 Console                    1     67,584 K`,
    'netstat': () => `Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING
  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:5357           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:49152          0.0.0.0:0              LISTENING
  TCP    127.0.0.1:27017        0.0.0.0:0              LISTENING
  TCP    192.168.1.100:139     0.0.0.0:0              LISTENING
  TCP    192.168.1.100:5353    0.0.0.0:0              LISTENING
  TCP    192.168.1.100:5353    192.168.1.101:5353     ESTABLISHED`,
    'shutdown': () => {
      setTimeout(() => onClose(), 2000);
      return 'Shutting down... Please wait.';
    },
    'restart': () => {
      setTimeout(() => {
        setOutput([]);
        setCurrentPath('C:\\Users\\bu8f>');
      }, 2000);
      return 'Restarting... Please wait.';
    },
    'matrix': () => {
      const matrixChars = '01';
      let result = 'Entering the Matrix...\n';
      for (let i = 0; i < 10; i++) {
        result += Array.from({length: 50}, () => matrixChars[Math.floor(Math.random() * matrixChars.length)]).join('') + '\n';
      }
      result += 'Welcome to the Matrix, Neo.';
      return result;
    },
    'fortune': () => {
      const fortunes = [
        'A bug in the hand is better than one as yet undetected.',
        'A computer lets you make more mistakes faster than any invention in human history.',
        'A computer program does what you tell it to do, not what you want it to do.',
        'Any program that runs right is obsolete.',
        'Computers are like air conditioners: they stop working when you open Windows.',
        'The best way to predict the future is to implement it.',
        'There are 10 types of people in the world: those who understand binary and those who don\'t.',
        'Why do programmers prefer dark mode? Because light attracts bugs!'
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    },
    'cowsay': (args) => {
      const message = args || 'Hello, World!';
      const cow = `
  ^__^
  (oo)\\_______
  (__)\\       )\\/\\
      ||----w |
      ||     ||
`;
      return `${cow}\n${message}`;
    },
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
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion for common commands
      const commonCommands = ['help', 'dir', 'cd', 'cls', 'echo', 'date', 'whoami', 'ipconfig', 'ping', 'python', 'type', 'copy', 'del', 'mkdir', 'rmdir', 'systeminfo', 'tasklist', 'netstat', 'shutdown', 'restart', 'matrix', 'fortune', 'cowsay', 'exit'];
      const currentInput = currentCommand.toLowerCase();
      
      for (const cmd of commonCommands) {
        if (cmd.startsWith(currentInput) && cmd !== currentInput) {
          setCurrentCommand(cmd);
          break;
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCurrentCommand('');
      setHistoryIndex(-1);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Add welcome message when terminal first opens
      if (output.length === 0) {
        setOutput([
          'Microsoft Windows [Version 10.0.22631.2861]',
          '(c) Microsoft Corporation. All rights reserved.',
          '',
          'C:\\Users\\bu8f>'
        ]);
      }
    }
  }, [isOpen, output]);

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
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
          />
        </form>
      </div>
    </BaseWindow>
  );
} 