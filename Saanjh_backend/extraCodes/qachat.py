from dotenv import load_dotenv
load_dotenv()
import streamlit as st  
import os
import google.generativeai as genai

genai.configure(api_key = os.getenv("API_KEY"))

# creating a function to old gemini pro model & get response
model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])


# the below function should give response from the model
def get_gemini_response(question):
    response = chat.send_message(question, stream = True)
    return response
    # stream = True, means as the llm gives the output we will stream it and display the output
    # stream = True, means as the llm starts giving text everything will be displayed on the UI, it will not wait for the llm to give the entire text and then displaying.
    # response is the output



# initialising streamlit app
st.set_page_config(page_title = "Q&A Demo")
st.header("Gemini LLM Application")

#initialising session state for chat history if it doesn't exist
# here the name of the session state is chat history
if 'chat_history' not in st.session_state:
    st.session_state['chat_history'] = []
    
input = st.text_input("Input: ", key = "input")
submit = st.button("Ask the question")

if submit and input:
    response = get_gemini_response(input)
    
    #Add user query and response to session chat history
    st.session_state['chat_history'].append(("You",input))
    # all the session is stored inside "You" variable
    
    st.subheader("The response is")
    
    for chunk in response:
        st.write(chunk.text)
        st.session_state['chat_history'].append(("Bot", chunk.text))
    # above what we are doing is, as soon as the response is coming we are simultaneously storing it in chat_history
    
st.subheader("The chat history is")
for role, text in st.session_state['chat_history']:
    st.write(f"{role}:{text}")
    

