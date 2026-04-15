import { useMicrophone } from './hooks/useMicrophone';

function App() {
  const { stream, err } = useMicrophone();

  if (err) {
    return <p>Access denied</p>
  }

  return (
    <div>
      <h1>Audio Visualizer</h1>
    </div>

  )
}

export default App