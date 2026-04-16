function Controls({ onClick, active }) {
	return (
		<div>
			<button onClick={onClick}>{active ? "⏸ Pause" : "▶ Resume"}</button>
		</div>
	);
}

export default Controls;
