import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

function PuppiesTable() {
  const [puppies, setPuppies] = useState([]);
  const [newPuppy, setNewPuppy] = useState({ name: '', breed: '', age_est: '', current_kennel_number: '' });
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null); // New state for validation error
  const [editing, setEditing] = useState({ id: null, puppy: {} });
  const [editedPuppy, setEditedPuppy] = useState({});

  useEffect(() => {
    fetchPuppies();
  }, []);

  const fetchPuppies = async () => {
    try {
      const response = await axios.get('http://localhost:3000/puppies');
      setPuppies(response.data);
    } catch (error) {
      setError('Error fetching puppies');
      console.error('Error fetching puppies:', error);
    }
  };

  const createPuppy = async () => {
    if (!newPuppy.name) {
      setValidationError('Name is required');
      return;
    }
    try {
      setValidationError(null); // Clear validation error
      console.log('Creating puppy:', newPuppy); // Debugging log
      await axios.post('http://localhost:3000/puppies', newPuppy);
      fetchPuppies();
      setNewPuppy({ name: '', breed: '', age_est: '', current_kennel_number: '' }); // Clear form after submission
    } catch (error) {
      console.error('Error creating puppy:', error);
      setError('Error creating puppy');
    }
  };

  const updatePuppy = async (id, updatedPuppy) => {
    try {
      const puppyData = {
        ...updatedPuppy,
        age_est: parseInt(updatedPuppy.age_est, 10),
        current_kennel_number: parseInt(updatedPuppy.current_kennel_number, 10)
      };
      await axios.put(`http://localhost:3000/puppies/${id}`, puppyData);
      fetchPuppies();
      setEditing({ id: null, puppy: {} });
    } catch (error) {
      console.error('Error updating puppy:', error);
      setError('Error updating puppy');
    }
  };

  const deletePuppy = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/puppies/${id}`);
      fetchPuppies();
    } catch (error) {
      console.error('Error deleting puppy:', error);
      setError('Error deleting puppy');
    }
  };

  const handleEdit = (puppy) => {
    setEditing({ id: puppy.pet_id, puppy });
    setEditedPuppy(puppy);
  };

  const handleSaveEdit = () => {
    updatePuppy(editing.id, editedPuppy);
  };

  const handleCancelEdit = () => {
    setEditing({ id: null, puppy: {} });
  };

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'black' }}>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Breed</TableCell>
              <TableCell sx={{ color: 'white' }}>Age Estimate</TableCell>
              <TableCell sx={{ color: 'white' }}>Current Kennel Number</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {puppies.map(puppy => (
              <TableRow key={puppy.pet_id}>
                <TableCell>{puppy.pet_id}</TableCell>
                {editing.id === puppy.pet_id ? (
                  <>
                    <TableCell>
                      <TextField
                        label="Name"
                        value={editedPuppy.name}
                        onChange={(e) => setEditedPuppy({ ...editedPuppy, name: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Breed"
                        value={editedPuppy.breed}
                        onChange={(e) => setEditedPuppy({ ...editedPuppy, breed: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Age Estimate"
                        value={editedPuppy.age_est}
                        onChange={(e) => setEditedPuppy({ ...editedPuppy, age_est: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Current Kennel Number"
                        value={editedPuppy.current_kennel_number}
                        onChange={(e) => setEditedPuppy({ ...editedPuppy, current_kennel_number: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{puppy.name}</TableCell>
                    <TableCell>{puppy.breed}</TableCell>
                    <TableCell>{puppy.age_est}</TableCell>
                    <TableCell>{puppy.current_kennel_number}</TableCell>
                  </>
                )}
                <TableCell>
                  {editing.id === puppy.pet_id ? (
                    <>
                      <Button onClick={handleSaveEdit}>Save</Button>
                      <Button onClick={handleCancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => handleEdit(puppy)}>Edit</Button>
                      <Button onClick={() => deletePuppy(puppy.pet_id)}>Delete</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ marginTop: '20px', display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <TextField
            label="Name"
            value={newPuppy.name}
            onChange={(e) => setNewPuppy({ ...newPuppy, name: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Breed"
            value={newPuppy.breed}
            onChange={(e) => setNewPuppy({ ...newPuppy, breed: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Age Estimate"
            value={newPuppy.age_est}
            onChange={(e) => setNewPuppy({ ...newPuppy, age_est: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Current Kennel Number"
            value={newPuppy.current_kennel_number}
            onChange={(e) => setNewPuppy({ ...newPuppy, current_kennel_number: e.target.value })}
            fullWidth
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <Button onClick={createPuppy} fullWidth>
            Add Puppy
          </Button>
        </div>
        {validationError && (
          <Alert severity="error" style={{ gridColumn: 'span 2' }}>
            {validationError}
          </Alert>
        )}
      </div>
    </div>
  );
}

export default PuppiesTable;
