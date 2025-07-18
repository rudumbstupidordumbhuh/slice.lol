import React, { useState, useEffect } from 'react';
import './WindowStyles.css';

const WebhookMonitor = ({ isOpen, onClose, onMinimize }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [spamStats, setSpamStats] = useState(null);
  const [spamTestResult, setSpamTestResult] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [statusResponse, spamResponse] = await Promise.all([
        fetch('/api/webhook/status'),
        fetch('/api/webhook/spam-stats')
      ]);
      
      const statusData = await statusResponse.json();
      const spamData = await spamResponse.json();
      
      if (statusData.success) {
        setStatus(statusData.data);
        setError(null);
      } else {
        setError(statusData.error || 'Failed to fetch status');
      }

      if (spamData.success) {
        setSpamStats(spamData.data);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    try {
      setTestResult({ loading: true, message: 'Testing webhook system...' });
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTestResult({ 
          success: true, 
          message: `Test successful! Used webhook: ${data.webhookId}` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: data.error || 'Test failed' 
        });
      }
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: 'Network error: ' + err.message 
      });
    }
  };

  const reactivateWebhook = async (webhookId) => {
    try {
      const response = await fetch(`/api/webhook/reactivate/${webhookId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Webhook ${webhookId} reactivated successfully!`);
        fetchStatus(); // Refresh status
      } else {
        alert(`Failed to reactivate webhook: ${data.error}`);
      }
    } catch (err) {
      alert('Error reactivating webhook: ' + err.message);
    }
  };

  const triggerSpamTest = async (webhookId) => {
    try {
      setSpamTestResult({ loading: true, message: 'Triggering spam test...' });
      const response = await fetch('/api/webhook/trigger-spam-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhookId })
      });
      const data = await response.json();
      
      if (data.success) {
        setSpamTestResult({ 
          success: true, 
          message: 'Spam test triggered! Check Discord for results.' 
        });
        setTimeout(() => fetchStatus(), 2000); // Refresh after 2 seconds
      } else {
        setSpamTestResult({ 
          success: false, 
          message: data.error || 'Spam test failed' 
        });
      }
    } catch (err) {
      setSpamTestResult({ 
        success: false, 
        message: 'Network error: ' + err.message 
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    return status === 'active' ? '#00ff00' : '#ff0000';
  };

  const getStatusText = (webhook) => {
    if (webhook.spamDetected) {
      return '🚨 Spam Detected';
    } else if (webhook.status === 'active') {
      return '🟢 Active';
    } else {
      return `🔴 Inactive (${webhook.failureCount} failures)`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="window">
      <div className="window-header">
        <div className="window-title">🔗 Webhook Monitor</div>
        <div className="window-controls">
          <button className="window-control minimize" onClick={onMinimize}>-</button>
          <button className="window-control maximize">□</button>
          <button className="window-control close" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="window-content">
        <div className="webhook-monitor">
          <div className="monitor-header">
            <h3>Webhook System Status</h3>
            <div className="monitor-actions">
              <button 
                className="btn btn-primary" 
                onClick={fetchStatus}
                disabled={loading}
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
                             <button 
                 className="btn btn-success" 
                 onClick={testWebhook}
                 disabled={testResult?.loading}
               >
                 {testResult?.loading ? '🧪 Testing...' : '🧪 Test System'}
               </button>
               <button 
                 className="btn btn-warning" 
                 onClick={() => triggerSpamTest('webhook_1')}
                 disabled={spamTestResult?.loading}
               >
                 {spamTestResult?.loading ? '🚨 Testing...' : '🚨 Test Spam'}
               </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ Error: {error}
            </div>
          )}

                     {testResult && (
             <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
               {testResult.success ? '✅' : '❌'} {testResult.message}
             </div>
           )}

           {spamTestResult && (
             <div className={`test-result ${spamTestResult.success ? 'success' : 'error'}`}>
               {spamTestResult.success ? '✅' : '❌'} {spamTestResult.message}
             </div>
           )}

          {status && (
            <div className="status-overview">
                             <div className="status-cards">
                 <div className="status-card">
                   <div className="status-number">{status.total}</div>
                   <div className="status-label">Total Webhooks</div>
                 </div>
                 <div className="status-card active">
                   <div className="status-number">{status.active}</div>
                   <div className="status-label">Active</div>
                 </div>
                 <div className="status-card inactive">
                   <div className="status-number">{status.inactive}</div>
                   <div className="status-label">Inactive</div>
                 </div>
                 {spamStats && (
                   <div className="status-card spam">
                     <div className="status-number">{spamStats.spamDetected}</div>
                     <div className="status-label">Spam Detected</div>
                   </div>
                 )}
               </div>

              <div className="webhook-list">
                <h4>Individual Webhook Status</h4>
                <div className="webhook-grid">
                  {status.webhooks.map((webhook) => (
                    <div key={webhook.id} className="webhook-item">
                      <div className="webhook-header">
                        <span className="webhook-id">{webhook.id}</span>
                        <span 
                          className="webhook-status"
                          style={{ color: getStatusColor(webhook.status) }}
                        >
                          {getStatusText(webhook)}
                        </span>
                      </div>
                      
                                             <div className="webhook-details">
                         <div className="detail-item">
                           <span className="label">Failures:</span>
                           <span className="value">{webhook.failureCount}</span>
                         </div>
                         
                         <div className="detail-item">
                           <span className="label">Messages:</span>
                           <span className="value">{webhook.messageCount || 0}</span>
                         </div>
                         
                         {webhook.lastUsed && (
                           <div className="detail-item">
                             <span className="label">Last Used:</span>
                             <span className="value">
                               {new Date(webhook.lastUsed).toLocaleString()}
                             </span>
                           </div>
                         )}
                         
                         {webhook.lastFailure && (
                           <div className="detail-item">
                             <span className="label">Last Failure:</span>
                             <span className="value">
                               {new Date(webhook.lastFailure).toLocaleString()}
                             </span>
                           </div>
                         )}
                       </div>
                      
                                             <div className="webhook-actions">
                         {webhook.status === 'inactive' && !webhook.spamDetected && (
                           <button 
                             className="btn btn-warning btn-sm"
                             onClick={() => reactivateWebhook(webhook.id)}
                           >
                             🔄 Reactivate
                           </button>
                         )}
                         
                         {webhook.spamDetected && (
                           <button 
                             className="btn btn-danger btn-sm"
                             disabled
                           >
                             🚨 Spam Detected
                           </button>
                         )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .webhook-monitor {
          padding: 20px;
          font-family: 'Courier New', monospace;
        }

        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }

        .monitor-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

                 .btn-warning {
           background: #ffc107;
           color: #212529;
         }

         .btn-danger {
           background: #dc3545;
           color: white;
         }

        .btn-sm {
          padding: 4px 8px;
          font-size: 10px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          border: 1px solid #f5c6cb;
        }

        .test-result {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          border: 1px solid;
        }

        .test-result.success {
          background: #d4edda;
          color: #155724;
          border-color: #c3e6cb;
        }

        .test-result.error {
          background: #f8d7da;
          color: #721c24;
          border-color: #f5c6cb;
        }

        .status-overview {
          margin-top: 20px;
        }

        .status-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }

        .status-card {
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .status-card.active {
          border-color: #00ff00;
        }

                 .status-card.inactive {
           border-color: #ff0000;
         }

         .status-card.spam {
           border-color: #ff6b35;
           background: #2a1a1a;
         }

        .status-number {
          font-size: 32px;
          font-weight: bold;
          color: #fff;
        }

        .status-label {
          font-size: 14px;
          color: #ccc;
          margin-top: 5px;
        }

        .webhook-list h4 {
          margin-bottom: 15px;
          color: #fff;
          border-bottom: 1px solid #444;
          padding-bottom: 5px;
        }

        .webhook-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .webhook-item {
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 15px;
        }

        .webhook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .webhook-id {
          font-weight: bold;
          color: #fff;
        }

        .webhook-status {
          font-size: 12px;
          font-weight: bold;
        }

        .webhook-details {
          margin-bottom: 10px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .label {
          color: #ccc;
        }

                 .value {
           color: #fff;
           font-weight: bold;
         }

         .webhook-actions {
           display: flex;
           gap: 5px;
           margin-top: 10px;
         }
      `}</style>
    </div>
  );
};

export default WebhookMonitor; 