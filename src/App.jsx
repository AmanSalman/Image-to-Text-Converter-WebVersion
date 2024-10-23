import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        extractText(reader.result.replace(/^data:image\/(png|jpeg);base64,/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async (base64Image) => {
    setLoading(true);
    try {
      const body = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      };

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_API_KEY}`,
        body
      );
      const detectedText = response.data.responses[0]?.fullTextAnnotation?.text || 'No text detected';
      setText(detectedText);
    } catch (error) {
      console.error('Error extracting text: ', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setImage(null);
    setText('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert('Text copied to clipboard!');
  };

  return (
    <div className="container">
      <h1 className="title">Image to Text Converter</h1>
      <p className="subtitle">Upload an image to extract text</p>
      
      <input type="file" accept="image/*" onChange={handleImageChange} className="inputFile" />
      
      {image && <img src={image} alt="Selected" className="image" />}
      
      {loading ? (
        <div className="loadingIndicator">Loading...</div>
      ) : (
        <>
          {text && (
            <div className="textContainer">
              <p className="extractedText">{text}</p>
              <button className="copyButton" onClick={copyToClipboard}>
                Copy Text
              </button>
            </div>
          )}
          {text && (
            <button className="clearButton" onClick={clearResults}>
              Clear Results and Pick Another Image
            </button>
          )}
        </>
      )}
    </div>
  );
}
