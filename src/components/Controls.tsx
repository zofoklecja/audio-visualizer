type Props = {
	onClick: () => void;
	active: boolean;
};

function Controls({ onClick, active }: Props) {
	return (
		<div>
			<button onClick={onClick}>{active ? "⏸ Pause" : "▶ Resume"}</button>
		</div>
	);
}

export default Controls;
