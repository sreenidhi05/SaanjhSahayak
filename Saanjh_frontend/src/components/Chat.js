// Chat.js
import React, { useState } from 'react';
import axios from 'axios';


const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const response = await axios.post('/chat', { query: input });
    setMessages([...messages, { text: input, user: true }, { text: JSON.stringify(response.data), user: false }]);
    setInput('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.user ? 'right' : 'left' }}>
            {msg.text}
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
