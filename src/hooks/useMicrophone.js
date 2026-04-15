import { useEffect, useRef, useState } from "react";

function useMicrophone() {
  const [stream, setStream] = useState(null);
  const [err, setErr] = useState(null);
  const streamRef = useRef(null);

  const getStream = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = s;
      setStream(s);
    } catch (err) {
      setErr(err);
    }
  };

  useEffect(() => {
    getStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { stream, err };
}

export { useMicrophone };