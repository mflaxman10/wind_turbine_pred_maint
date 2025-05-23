import React, { useState, useEffect, useRef } from 'react';
import './MaintenanceChat.css';

interface MaintenanceChatProps {
  turbineId: number | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  content: string;
  timestamp: Date;
}

interface SuggestedAction {
  id: string;
  component: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  dueDate: Date;
}

const MaintenanceChat: React.FC<MaintenanceChatProps> = ({ turbineId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat with welcome message
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: 'welcome',
      sender: 'system',
      content: 'Hello! I can help you with maintenance scheduling and answer questions about asset conditions. What would you like to know?',
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  }, []);
  
  // Generate suggested actions based on turbineId
  useEffect(() => {
    if (!turbineId) {
      setSuggestedActions([]);
      return;
    }
    
    // In a real app, this would fetch from an API based on asset health data
    const actions: SuggestedAction[] = [
      {
        id: '1',
        component: 'Gearbox',
        action: 'Inspect and replace worn bearings',
        priority: 'high',
        estimatedTime: '4 hours',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
      },
      {
        id: '2',
        component: 'Converter',
        action: 'Check and repair faulty connections',
        priority: 'high',
        estimatedTime: '3 hours',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
      },
      {
        id: '3',
        component: 'Blades',
        action: 'Inspect for cracks and erosion',
        priority: 'medium',
        estimatedTime: '2 hours',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10))
      },
      {
        id: '4',
        component: 'Tower',
        action: 'Routine structural inspection',
        priority: 'low',
        estimatedTime: '2 hours',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
      }
    ];
    
    setSuggestedActions(actions);
    
    // Add a message about the turbine selection
    const turbineSelectedMessage: ChatMessage = {
      id: `turbine-${turbineId}-${Date.now()}`,
      sender: 'system',
      content: `Turbine #${turbineId} selected. I've analyzed its health data and have some maintenance suggestions based on fault probability trends.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, turbineSelectedMessage]);
  }, [turbineId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Generate a response (in a real app this would call an API)
    setTimeout(() => {
      const response = generateResponse(inputValue, turbineId);
      setMessages(prev => [...prev, response]);
    }, 1000);
  };
  
  // Simple response generation (would be replaced with actual AI in production)
  const generateResponse = (message: string, turbineId: number | null): ChatMessage => {
    const lowerMessage = message.toLowerCase();
    let content = '';
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('probability')) {
      content = turbineId 
        ? `Turbine #${turbineId} shows elevated fault probability in the Gearbox (0.28) and Converter (0.35) components. I recommend scheduling inspections for both within the next week.`
        : 'Please select a specific turbine to view its fault probability details.';
    } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('schedule')) {
      content = turbineId
        ? `There are ${suggestedActions.length} maintenance tasks currently recommended for Turbine #${turbineId}. Would you like me to schedule any of these tasks?`
        : 'Please select a turbine to view and schedule maintenance tasks.';
    } else if (lowerMessage.includes('crew') || lowerMessage.includes('technician')) {
      content = 'We currently have three maintenance crews available. Crew A is specialized in gearbox repairs, Crew B handles electrical systems, and Crew C focuses on structural components.';
    } else if (lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
      content = 'The estimated cost for all suggested maintenance tasks is approximately $8,500. Preventative maintenance now could save an estimated $45,000 in potential repair costs if failures occur.';
    } else {
      content = `I'll help you with that. For more specific information about Turbine #${turbineId || '[Select a turbine]'}, you can ask about fault probability, maintenance history, or schedule new tasks.`;
    }
    
    return {
      id: `system-${Date.now()}`,
      sender: 'system',
      content,
      timestamp: new Date()
    };
  };
  
  // Handle scheduling a suggested action
  const handleScheduleAction = (actionId: string) => {
    const action = suggestedActions.find(a => a.id === actionId);
    if (!action) return;
    
    // In a real app, this would call an API to schedule the task
    const scheduledMessage: ChatMessage = {
      id: `scheduled-${actionId}-${Date.now()}`,
      sender: 'system',
      content: `✅ Scheduled maintenance task: "${action.action}" for ${action.component} on ${action.dueDate.toLocaleDateString()}. Crew B has been assigned to this task.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, scheduledMessage]);
    
    // Remove the scheduled action from suggestions
    setSuggestedActions(prev => prev.filter(a => a.id !== actionId));
  };
  
  return (
    <div className="maintenance-chat-container">
      <div className="chat-header">
        <h3>Maintenance Assistant {turbineId ? `- Turbine #${turbineId}` : ''}</h3>
      </div>
      
      <div className="chat-content">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="suggested-actions">
          <h4>Suggested Maintenance Tasks</h4>
          {suggestedActions.length === 0 ? (
            <div className="no-actions">
              {turbineId 
                ? 'No maintenance actions currently suggested for this turbine.' 
                : 'Select a turbine to view suggested maintenance tasks.'}
            </div>
          ) : (
            <div className="action-list">
              {suggestedActions.map(action => (
                <div key={action.id} className={`action-item priority-${action.priority}`}>
                  <div className="action-header">
                    <span className="action-component">{action.component}</span>
                    <span className={`action-priority ${action.priority}`}>
                      {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                    </span>
                  </div>
                  <div className="action-description">{action.action}</div>
                  <div className="action-details">
                    <span>Est. time: {action.estimatedTime}</span>
                    <span>Due: {action.dueDate.toLocaleDateString()}</span>
                  </div>
                  <button 
                    className="schedule-button"
                    onClick={() => handleScheduleAction(action.id)}
                  >
                    Schedule Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about maintenance, schedules, or asset conditions..."
          className="chat-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MaintenanceChat;
