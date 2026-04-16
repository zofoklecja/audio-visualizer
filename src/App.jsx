import Visualizer from "./components/Visualizer";
import { useMicrophone } from "./hooks/useMicrophone";

function App() {
	const { stream, err } = useMicrophone();

	return (
		<div>
			<h1>Audio Visualizer</h1>
			{err ? <p>Access denied</p> : <Visualizer stream={stream} />}
		</div>
	);
}

export default App;
