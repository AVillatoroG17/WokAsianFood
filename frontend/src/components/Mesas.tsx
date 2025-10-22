import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentMesa, setCurrentMesa] = useState({
    id: null,
    numero: 0,
    capacidad: 0,
  });

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    const response = await axios.get('/api/mesas');
    setMesas(response.data);
  };

  const handleClickOpen = (mesa = null) => {
    setCurrentMesa(mesa || { id: null, numero: 0, capacidad: 0 });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentMesa.id) {
      await axios.put(`/api/mesas/${currentMesa.id}`, currentMesa);
    } else {
      await axios.post('/api/mesas', currentMesa);
    }
    fetchMesas();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/mesas/${id}`);
    fetchMesas();
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Añadir Mesa
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mesas.map((mesa) => (
              <TableRow key={mesa.id}>
                <TableCell>{mesa.numero}</TableCell>
                <TableCell>{mesa.capacidad}</TableCell>
                <TableCell>
                  <Button onClick={() => handleClickOpen(mesa)}>Editar</Button>
                  <Button onClick={() => handleDelete(mesa.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentMesa.id ? 'Editar' : 'Añadir'} Mesa</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Número"
            type="number"
            fullWidth
            value={currentMesa.numero}
            onChange={(e) =>
              setCurrentMesa({ ...currentMesa, numero: parseInt(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Capacidad"
            type="number"
            fullWidth
            value={currentMesa.capacidad}
            onChange={(e) =>
              setCurrentMesa({ ...currentMesa, capacidad: parseInt(e.target.value) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Mesas;
