import { useEffect, useRef, useState } from "react";

function useMicrophone(): { stream: MediaStream | null; err: Error | null } {
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [err, setErr] = useState<Error | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const getStream = async () => {
		try {
			const s = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			streamRef.current = s;
			setStream(s);
		} catch (err) {
			if (err instanceof Error) {
				setErr(err);
			}
		}
	};

	useEffect(() => {
		getStream();

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	return { stream, err };
}

export { useMicrophone };
