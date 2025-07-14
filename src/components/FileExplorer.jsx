import { useState } from 'react';
import BaseWindow from './BaseWindow';
import './WindowStyles.css';

export default function FileExplorer({ isOpen, onClose, onMinimize, onSurprise }) {
  const [currentPath, setCurrentPath] = useState('C:\\');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const fileSystem = {
    'C:\\': {
      type: 'folder',
      children: {
        'Windows': { type: 'folder', children: {} },
        'Program Files': { type: 'folder', children: {} },
        'Users': { type: 'folder', children: {} },
        'System32': { type: 'folder', children: {} },
        'boot.ini': { type: 'file', size: '1.2 KB' },
        'config.sys': { type: 'file', size: '0.8 KB' }
      }
    },
    'C:\\Users': {
      type: 'folder',
      children: {
        'bu8f': { type: 'folder', children: {} },
        'Public': { type: 'folder', children: {} },
        'Default': { type: 'folder', children: {} }
      }
    },
    'C:\\Users\\bu8f': {
      type: 'folder',
      children: {
        'Desktop': { type: 'folder', children: {} },
        'Documents': { type: 'folder', children: {} },
        'Downloads': { type: 'folder', children: {
          'surprise.py': { type: 'file', size: '3.2 KB' },
          'document.pdf': { type: 'file', size: '1.5 MB' },
          'image.jpg': { type: 'file', size: '2.8 MB' },
          'video.mp4': { type: 'file', size: '45.2 MB' },
          'music.mp3': { type: 'file', size: '8.7 MB' },
          'archive.zip': { type: 'file', size: '12.3 MB' }
        } },
        'Pictures': { type: 'folder', children: {} },
        'Music': { type: 'folder', children: {} },
        'Videos': { type: 'folder', children: {} },
        'AppData': { type: 'folder', children: {} }
      }
    },
    'C:\\Users\\bu8f\\Desktop': {
      type: 'folder',
      children: {
        'guns.lol project': { type: 'folder', children: {} },
        'README.txt': { type: 'file', size: '2.1 KB' },
        'screenshot.png': { type: 'file', size: '1.8 MB' },
        'surprise.py': { type: 'file', size: '3.2 KB' }
      }
    },
    'C:\\Users\\bu8f\\Documents': {
      type: 'folder',
      children: {
        'work.docx': { type: 'file', size: '45 KB' },
        'notes.txt': { type: 'file', size: '3.2 KB' },
        'presentation.pptx': { type: 'file', size: '2.1 MB' }
      }
    },
    'C:\\Users\\bu8f\\Downloads': {
      type: 'folder',
      children: {
        'surprise.py': { type: 'file', size: '3.2 KB' },
        'document.pdf': { type: 'file', size: '1.5 MB' },
        'image.jpg': { type: 'file', size: '2.8 MB' },
        'video.mp4': { type: 'file', size: '45.2 MB' },
        'music.mp3': { type: 'file', size: '8.7 MB' },
        'archive.zip': { type: 'file', size: '12.3 MB' }
      }
    }
  };

  const getCurrentFolder = () => {
    const pathParts = currentPath.split('\\').filter(Boolean);
    let current = fileSystem;
    
    for (const part of pathParts) {
      if (current && current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return { children: {} };
      }
    }
    
    return current;
  };

  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const getFileIcon = (fileName, type) => {
    if (type === 'folder') return '📁';
    if (fileName.endsWith('.txt')) return '📄';
    if (fileName.endsWith('.docx')) return '📝';
    if (fileName.endsWith('.pptx')) return '📊';
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg')) return '🖼️';
    if (fileName.endsWith('.mp3') || fileName.endsWith('.wav')) return '🎵';
    if (fileName.endsWith('.mp4') || fileName.endsWith('.avi')) return '🎬';
    if (fileName.endsWith('.py')) return '🐍';
    if (fileName.endsWith('.pdf')) return '📕';
    if (fileName.endsWith('.zip')) return '📦';
    return '📄';
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = parseInt(size);
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const currentFolder = getCurrentFolder();
  const pathParts = currentPath.split('\\').filter(Boolean);

  return (
    <BaseWindow
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      title="File Explorer"
      icon="📁"
      className="file-explorer"
    >
      <div className="window-content">
          {/* Address Bar */}
          <div className="address-bar">
            <div className="breadcrumb">
              {pathParts.map((part, index) => (
                <span key={index}>
                  <button 
                    className="breadcrumb-item"
                    onClick={() => navigateTo(pathParts.slice(0, index + 1).join('\\') + '\\')}
                  >
                    {part}
                  </button>
                  {index < pathParts.length - 1 && <span className="breadcrumb-separator">\</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <button className="toolbar-btn" onClick={() => navigateTo('C:\\')}>
              <span>🏠</span> Home
            </button>
            <button className="toolbar-btn" onClick={() => navigateTo('C:\\Users\\bu8f\\Desktop')}>
              <span>🖥️</span> Desktop
            </button>
            <button className="toolbar-btn" onClick={() => navigateTo('C:\\Users\\bu8f\\Documents')}>
              <span>📁</span> Documents
            </button>
            <button className="toolbar-btn" onClick={() => navigateTo('C:\\Users\\bu8f\\Downloads')}>
              <span>⬇️</span> Downloads
            </button>
            <div className="toolbar-separator"></div>
            <button 
              className="toolbar-btn"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              <span>{viewMode === 'list' ? '📋' : '🔲'}</span> {viewMode === 'list' ? 'List' : 'Grid'}
            </button>
          </div>

          {/* File List */}
          <div className="file-list-container">
            <div className={`file-list ${viewMode}`}>
              {Object.entries(currentFolder.children || {}).map(([name, file]) => (
                <div
                  key={name}
                  className={`file-item ${selectedFile === name ? 'selected' : ''}`}
                  onClick={() => {
                    if (file.type === 'folder') {
                      navigateTo(currentPath + name + '\\');
                    } else {
                      setSelectedFile(name);
                    }
                  }}
                  onDoubleClick={() => {
                    if (file.type === 'folder') {
                      navigateTo(currentPath + name + '\\');
                    } else if (name === 'surprise.py' && onSurprise) {
                      onSurprise();
                    }
                  }}
                >
                  <div className="file-icon">{getFileIcon(name, file.type)}</div>
                  <div className="file-info">
                    <div className="file-name">{name}</div>
                    <div className="file-details">
                      {file.type === 'folder' ? 'File folder' : formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <span>{Object.keys(currentFolder.children || {}).length} items</span>
            {selectedFile && (
              <span className="selected-file">Selected: {selectedFile}</span>
            )}
          </div>
        </div>
      </BaseWindow>
    );
  } 