import { PrimeReactProvider } from "primereact/api";
import Landing from "./pages/Landing";
function App() {
  return (
    <>
      <PrimeReactProvider>
        <Landing />
      </PrimeReactProvider>
    </>
  );
}

export default App;
