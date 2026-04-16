import { useState } from "react";
import Controls from "./components/Controls";
import Visualizer from "./components/Visualizer";
import { useMicrophone } from "./hooks/useMicrophone";

function App() {
	const { stream, err } = useMicrophone();
	const [active, setActive] = useState(true);

	function toggleInactive() {
		return setActive(false);
	}

	return (
		<div>
			<h1>Audio Visualizer</h1>
			{err ? (
				<p>Access denied</p>
			) : (
				<div>
					<Visualizer stream={stream} active={active} />
					<Controls onPauseClick={toggleInactive} />
				</div>
			)}
		</div>
	);
}

export default App;
