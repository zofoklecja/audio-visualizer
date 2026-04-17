import { useEffect, useRef } from "react";

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

function Visualizer({ stream, active }) {
	const canvasRef = useRef(null);
	const wrapperRef = useRef(null);
	const activeRef = useRef(true);
	const drawRef = useRef(null);

	useEffect(() => {
		if (!wrapperRef?.current) return;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentBoxSize[0].inlineSize;
				canvasRef.current.width = w;
				canvasRef.current.height = (w * DEFAULT_HEIGHT) / DEFAULT_WIDTH;
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
		if (!stream) return;
		const canvasCtx = canvasRef.current.getContext("2d");
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;
		analyser.fftSize = 32;
		const bufferLength = analyser.frequencyBinCount;

		const source = audioCtx.createMediaStreamSource(stream);
		source.connect(analyser);

		const dataArray = new Uint8Array(bufferLength);

		canvasCtx.clearRect(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height,
		);
		let drawVisual;
		function draw() {
			if (!activeRef.current) {
				cancelAnimationFrame(drawVisual);
				return;
			}
			drawVisual = requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			const { width, height } = canvasRef.current;
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
			cancelAnimationFrame(drawVisual);
			audioCtx.close();
		};
	}, [stream]);

	return (
		<div ref={wrapperRef} className="visualizer__wrapper">
			<canvas
				ref={canvasRef}
				width={DEFAULT_WIDTH}
				height={DEFAULT_HEIGHT}
			/>
		</div>
	);
}

export default Visualizer;
