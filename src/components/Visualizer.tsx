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
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			return;
		}

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentBoxSize[0].inlineSize;
				if (canvasRef.current) {
					canvasRef.current.width = w;
					canvasRef.current.height = w * ASPECT_RATIO;
				}
			}
		});

		resizeObserver.observe(wrapper);

		return () => {
			if (wrapper) {
				resizeObserver.unobserve(wrapper);
			}
		};
	}, []);

	useEffect(() => {
		activeRef.current = active;
		if (active && drawRef.current) {
			drawRef.current();
		}
	}, [active]);

	useEffect(() => {
		if (!stream || !canvasRef.current) {
			return;
		}
		const canvas = canvasRef.current;
		const canvasCtx = canvas.getContext("2d");
		if (!canvasCtx) {
			return;
		}

		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;
		analyser.fftSize = 32;

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const source = audioCtx.createMediaStreamSource(stream);
		source.connect(analyser);

		canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
		let drawRequestId: number = 0;
		const draw = () => {
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
			let x = 0;
			for (let i = 0; i < bufferLength; i++) {
				const barHeight = dataArray[i];

				canvasCtx.fillStyle = "rgb(255, 189, 9)";
				canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

				x += barWidth + 1;
			}
		};
		drawRef.current = draw;

		draw();

		return () => {
			cancelAnimationFrame(drawRequestId);
			audioCtx.close().catch((err) => {
				console.error(err);
			});
		};
	}, [stream]);

	return (
		<div ref={wrapperRef} className="visualizer__wrapper">
			<canvas ref={canvasRef} />
		</div>
	);
}

export default Visualizer;
