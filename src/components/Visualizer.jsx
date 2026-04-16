import { useEffect, useRef } from "react";

const WIDTH = 600;
const HEIGHT = 400;

function Visualizer({ stream, active }) {
	const canvasRef = useRef(null);
	const activeRef = useRef(true);

	useEffect(() => {
		activeRef.current = active;
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

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
		let drawVisual;
		function draw() {
			if (!activeRef.current) {
				cancelAnimationFrame(drawVisual);
				return;
			}
			drawVisual = requestAnimationFrame(draw);

			analyser.getByteFrequencyData(dataArray);

			canvasCtx.fillStyle = "rgba(0, 0, 0, 0.78)";
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			const barWidth = (WIDTH - bufferLength) / bufferLength;
			let barHeight;
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i];

				canvasCtx.fillStyle = "rgb(255, 189, 9)";
				canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

				x += barWidth + 1;
			}
		}

		draw();

		return () => {
			cancelAnimationFrame(drawVisual);
			audioCtx.close();
		};
	}, [stream]);

	return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
}

export default Visualizer;
