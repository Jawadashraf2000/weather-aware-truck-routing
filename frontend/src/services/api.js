import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD ? '' : 'http://127.0.0.1:8000'
  )
).replace(/\/$/, '') + '/api';

export const analyzeRoute = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/analyze-route/`, {
    origin: formData.origin,
    destination: formData.destination,
    departure_time: formData.departureTime,
    load_weight_lbs: parseInt(formData.loadWeight, 10),
    sample_interval_miles: parseInt(formData.sampleInterval, 10)
  });
  return response.data;
};