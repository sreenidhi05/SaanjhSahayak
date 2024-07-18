import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import './styles/ChatBot.css';

const makeRequestAPI = async (prompt) => {
  const res = await axios.post("http://localhost:8080/chatbot", { prompt });
  return res.data;
};

function ChatBot() {
  const [prompt, setPrompt] = useState("");
  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ["gemini-ai-request"],
  });

  const submitHandler = (e) => {
    e.preventDefault();
    mutation.mutate(prompt);
  };

  const backgroundStyle = {
    backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh', // Adjust height as needed
    position: 'relative',
    zIndex: 0,
  };

  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(6px)', // Apply blur to the overlay
    zIndex: -1,
  };

  return (
    <div style={backgroundStyle}>
      <div className="container d-flex justify-content-center align-items-center h-100">
        <div style={blurOverlayStyle}></div>
        <div style={{ zIndex: 1}} className="App">
          <header className="App-header">Let's talk health, together we feel better</header>
          <div className="App-chat-container">
            <div className="App-chat">
              <p>Interact with the AI Companion:</p>
              <form className="App-form" onSubmit={submitHandler}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Write a content about..."
                  className="App-input"
                />
                <button className="App-button" type="submit">
                  Generate Content
                </button>
              </form>
            </div>
            <div className="App-response">
              {mutation.isPending && <p>Generating your content...</p>}
              {mutation.isError && <p className="App-error">{mutation.error.message}</p>}
              {mutation.isSuccess && <p className="App-success">{mutation.data}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;