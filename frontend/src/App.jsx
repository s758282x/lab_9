import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PuppiesTable from './components/PuppiesTable';

function App() {
  const [puppies, setPuppies] = useState([]);

  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:3000/puppies')
      .then(response => {
        setPuppies(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Puppies Table</h1>
      <PuppiesTable puppies={puppies} />
    </div>
  );
}

export default App;