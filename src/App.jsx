import { useState } from "react";
import Controls from "./components/Controls";
import Visualizer from "./components/Visualizer";
import { useMicrophone } from "./hooks/useMicrophone";

function App() {
	const { stream, err } = useMicrophone();
	const [active, setActive] = useState(true);

	function toggleActive() {
		return setActive((prev) => !prev);
	}

	return (
		<main>
			<h1>Audio Visualizer</h1>
			{err ? (
				<p>Access denied</p>
			) : (
				<>
					<Visualizer stream={stream} active={active} />
					<Controls onClick={toggleActive} active={active} />
				</>
			)}
		</main>
	);
}

export default App;
