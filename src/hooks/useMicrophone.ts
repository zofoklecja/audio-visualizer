import { useEffect, useRef, useState } from "react";

function useMicrophone(): { stream: MediaStream | null; err: Error | null } {
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [err, setErr] = useState<Error | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		const getStream = async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				streamRef.current = mediaStream;
				setStream(mediaStream);
			} catch (err) {
				if (err instanceof Error) {
					setErr(err);
				} else {
					setErr(new Error("Unknown error"));
				}
			}
		};
		getStream();

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => {
					track.stop();
				});
			}
		};
	}, []);

	return { stream, err };
}

export { useMicrophone };
