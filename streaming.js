function getTravelRecommendation(stationLocation, stationTitle) {
  const requestHeaders = new Headers();
  requestHeaders.append("Authorization", "Bearer ");
  requestHeaders.append("Content-Type", "application/json");

  const requestBody = JSON.stringify({
    "inputs": {
      "location": `${stationLocation}`,
      "station_name": `${stationTitle}`
    },
    "response_mode": "streaming",
    "user": "abc-123"
  });

  const requestOptions = {
    method: "POST",
    headers: requestHeaders,
    body: requestBody
  };

  fetch("https://agent.build-school.com/v1/workflows/run", requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      readChunk();
    })
    // .then(result => {
    //   console.log(result);
    // })
    .catch(error => {
      console.error('Error in getTravelRecommendation:', error.message);
    });
}

function readChunk(reader, decoder) {
  reader.read().then(({done, value}) => {
    if (done) {
      console.log("Stream complete");
      return;
    }

    // Decode and process the chunk
    const chunkText = decoder.decode(value, {stream: true});
    chunkText.split('\n').forEach(line => {
      if (line.trim()) {
        processStreamedData(line.trim());
      }
    });

    readChunk(); // Continue reading
  });
}

function processStreamedData(streamChunk) {
  try {
    // remove prefix data:
    streamChunk = streamChunk.replace("data: ", '');
    const eventData = JSON.parse(streamChunk); // Parse JSON
    console.log("Parsed Event:", eventData);

    // Process based on event type
    handleEvent(eventData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

function handleEvent(eventData) {
  const {event, data} = eventData;

  switch (event) {
    case "workflow_started":
      console.log("Workflow started:", data);
      break;

    case "node_started":
      console.log("Node started:", data);
      break;

    case "node_finished":
      console.log("Node finished:", data);
      break;

    case "workflow_finished":
      console.log("Workflow finished:", data);
      break;

    case "tts_message":
      console.log("TTS message:", data);
      // Handle the audio data
      handleAudioData(data.audio);
      break;

    case "tts_message_end":
      console.log("TTS message end:", data);
      break;

    case "text_chunk":
      console.log("Text chunk:", data.text);
      // process.stdout.write(data.text);
      break;

    default:
      console.warn("Unknown event type:", event);
  }
}

function handleAudioData(audioData) {
  if (!audioData) {
    console.log("No audio data provided");
    return;
  }

  // Example: Base64 decoding and playing audio (if Base64 encoded)
  const audioBlob = new Blob([audioData], {type: "audio/mpeg"}); // Adjust type as needed
  const audioURL = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioURL);
  audio.play().catch(err => console.error("Audio playback error:", err));
}

getTravelRecommendation("北安路/北安路77巷口(西北側)", "圓山風景區");
