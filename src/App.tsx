import { useState } from "react";
import Controls from "./components/Controls";
import Visualizer from "./components/Visualizer";
import { useMicrophone } from "./hooks/useMicrophone";

const errorMessages = {
	NotAllowedError: "Access denied",
	NotFoundError: "Microphone not found",
	NotReadableError: "Microphone busy",
} as const;

type ErrorName = keyof typeof errorMessages;

function App() {
	const { stream, err } = useMicrophone();
	const [active, setActive] = useState(true);

	const toggleActive = () => {
		setActive((prev) => !prev);
	};

	return (
		<main>
			<h1>Audio Visualizer</h1>
			{err ? (
				<p>
					{err.name in errorMessages
						? errorMessages[err.name as ErrorName]
						: "Unknown error"}
				</p>
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
