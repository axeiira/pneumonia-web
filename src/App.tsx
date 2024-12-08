import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Click "Load Model" to start');

  const loadModel = async () => {
    try {
      setStatus('Loading model...');
      // Load the model from the public folder
      const model = await tf.loadLayersModel('/model/model.json');
      console.log('Model loaded:', model);
      setStatus('Model loaded successfully!');
    } catch (error) {
      console.error('Error loading the model:', error);
      setStatus('Failed to load the model.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>TensorFlow.js Model Loader</h1>
      <p>Status: {status}</p>
      <button
        onClick={loadModel}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Load Model
      </button>
    </div>
  );
};

export default App;
