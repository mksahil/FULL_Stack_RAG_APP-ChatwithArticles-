import { useState } from "react";
import axios from "axios";
import { BounceLoader } from "react-spinners";

import Markdown from "react-markdown";
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

const Expander = ({ title, content, source }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="expander">
      <b onClick={() => setIsOpen(!isOpen)} className="expander-title">
        {title}
      </b>
      {isOpen && <p className="expander-content">{content}</p>}
      {isOpen && (
        <p className="expander-content">
          Source:{" "}
          <a href={source} target="_blank" rel="noopener noreferrer">
            {source}
          </a>
        </p>
      )}
    </div>
  );
};

function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setAnswer("");
  //   setIsLoading(true);
  //   console.log(question);
  //   const response = await api.post("/chat", { message: question });
  //   setAnswer(response.data.answer);
  //   setDocuments(response.data.documents);
  //   setIsLoading(false);
  // };

  const handleSubmit = async (e) => {
    setAnswer("");
    setIsLoading(true);
    e.preventDefault();

    const websocket = new WebSocket("ws://127.0.0.1:8000/async_chat");

    websocket.onopen = () => {
      websocket.send(question);
    };

    websocket.onmessage = (event) => {
      console.log("Received event: ", event.data);
      const data = JSON.parse(event.data);
      if (data.event_type == "on_retriever_end") {
        setDocuments(data.content);
      } else if (data.event_type == "on_chat_model_stream") {
        setAnswer((prev) => prev + data.content);
      }
    };

    websocket.onclose = (event) => {
      setIsLoading(false);
    };
  };

  const handleIndexing = async (e) => {
    e.preventDefault();
    setAnswer("");
    setIsLoading(true);
    const response = await api.post("/indexing", { message: question });
    setAnswer(response.data.response);
    setIsLoading(false);
  };

  return (
    <>
      <div>
        <h1>SummarySage</h1>
      </div>
      <form className="form">
        <input
          className="form-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="button-container">
          <button className="form-button" type="submit" onClick={handleSubmit}>
            Q&A
          </button>
          <button
            className="form-button"
            type="submit"
            style={{ backgroundColor: "red" }}
            onClick={handleIndexing}
          >
            Add Document
          </button>
        </div>
      </form>
      {isLoading && (
        <div className="loader-container">
          <BounceLoader color="#3498db" />
        </div>
      )}

      {answer && (
        <div className="results-container">
          <div className="results-answer">
            <h2>Answer:</h2>
            <Markdown>{answer}</Markdown>
          </div>
          <div className="results-documents">
            <h2>Documents:</h2>
            <ul>
              {documents.map((documents, index) => (
                <Expander
                  key={index}
                  title={
                    documents.page_content.split(" ").slice(0, 5).join(" ") +
                    "..."
                  }
                  content={documents.page_content}
                  source={documents.metadata.source_url}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default QuestionForm;
