import logo from "./logo.svg";
import "./App.css";
import QuestionForm from "./QuastionFrom";
import NavigationBar from "./NavigationBar";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <QuestionForm></QuestionForm>
        {/* <NavigationBar></NavigationBar> */}
      </header>
    </div>
  );
}

export default App;
