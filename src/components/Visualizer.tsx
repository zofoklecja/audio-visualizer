import { useEffect, useRef } from "react";

const ASPECT_RATIO = 2 / 3;

type Props = {
	stream: MediaStream | null;
	active: boolean;
};

function Visualizer({ stream, active }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef<boolean>(true);
	const drawRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (!wrapperRef?.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentBoxSize[0].inlineSize;
				if (canvasRef.current) {
					canvasRef.current.width = w;
					canvasRef.current.height = w * ASPECT_RATIO;
				}
			}
		});

		resizeObserver.observe(wrapperRef.current);

		return () => {
			if (wrapperRef?.current) {
				resizeObserver.unobserve(wrapperRef.current);
			}
		};
	}, []);

	useEffect(() => {
		activeRef.current = active;
		if (active && drawRef.current) drawRef.current();
	}, [active]);

	useEffect(() => {
		if (!stream || !canvasRef.current) return;
		const canvas = canvasRef.current;
		const canvasCtx = canvas.getContext("2d");
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;
		analyser.fftSize = 32;
		const bufferLength = analyser.frequencyBinCount;

		const source = audioCtx.createMediaStreamSource(stream);
		source.connect(analyser);

		const dataArray = new Uint8Array(bufferLength);

		canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
		let drawRequestId: number;
		function draw() {
			if (!activeRef.current || !canvasCtx) {
				cancelAnimationFrame(drawRequestId);
				return;
			}
			drawRequestId = requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			const { width, height } = canvas;
			canvasCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
			canvasCtx.fillRect(0, 0, width, height);

			const barWidth = (width - bufferLength) / bufferLength;
			let barHeight;
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i];

				canvasCtx.fillStyle = "rgb(255, 189, 9)";
				canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

				x += barWidth + 1;
			}
		}
		drawRef.current = draw;

		draw();

		return () => {
			cancelAnimationFrame(drawRequestId);
			audioCtx.close();
		};
	}, [stream, canvasRef]);

	return (
		<div ref={wrapperRef} className="visualizer__wrapper">
			<canvas ref={canvasRef} />
		</div>
	);
}

export default Visualizer;
