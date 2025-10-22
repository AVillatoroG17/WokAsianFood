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

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState({
    id: null,
    nombre: '',
    telefono: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const response = await axios.get('/api/clientes');
    setClientes(response.data);
  };

  const handleClickOpen = (cliente = null) => {
    setCurrentCliente(cliente || { id: null, nombre: '', telefono: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentCliente.id) {
      await axios.put(`/api/clientes/${currentCliente.id}`, currentCliente);
    } else {
      await axios.post('/api/clientes', currentCliente);
    }
    fetchClientes();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/clientes/${id}`);
    fetchClientes();
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Añadir Cliente
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.telefono}</TableCell>
                <TableCell>
                  <Button onClick={() => handleClickOpen(cliente)}>Editar</Button>
                  <Button onClick={() => handleDelete(cliente.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentCliente.id ? 'Editar' : 'Añadir'} Cliente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={currentCliente.nombre}
            onChange={(e) => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            type="text"
            fullWidth
            value={currentCliente.telefono}
            onChange={(e) => setCurrentCliente({ ...currentCliente, telefono: e.target.value })}
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

export default Clientes;
