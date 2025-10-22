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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOrden, setCurrentOrden] = useState({
    id: null,
    cliente: { id: 1 },
    mesa: { id: 1 },
    usuario: { id: 1 },
    estado: 'PENDIENTE',
  });

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    const response = await axios.get('/api/ordenes');
    setOrdenes(response.data);
  };

  const handleClickOpen = (orden = null) => {
    setCurrentOrden(
      orden || {
        id: null,
        cliente: { id: 1 },
        mesa: { id: 1 },
        usuario: { id: 1 },
        estado: 'PENDIENTE',
      }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentOrden.id) {
      await axios.put(`/api/ordenes/${currentOrden.id}`, currentOrden);
    } else {
      await axios.post('/api/ordenes', currentOrden);
    }
    fetchOrdenes();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/ordenes/${id}`);
    fetchOrdenes();
  };

  const handleEnviarCocina = async (id) => {
    await axios.patch(`/api/ordenes/${id}/enviar-cocina`);
    fetchOrdenes();
    };

  return (
    <div>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Añadir Orden
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Mesa</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell>{orden.cliente.nombre}</TableCell>
                <TableCell>{orden.mesa.numero}</TableCell>
                <TableCell>{orden.usuario.nombre}</TableCell>
                <TableCell>{orden.estado}</TableCell>
                <TableCell>
                  <Button onClick={() => handleClickOpen(orden)}>Editar</Button>
                  <Button onClick={() => handleDelete(orden.id)}>Eliminar</Button>
                  <Button onClick={() => handleEnviarCocina(orden.id)}>Enviar a Cocina</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentOrden.id ? 'Editar' : 'Añadir'} Orden</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID Cliente"
            type="number"
            fullWidth
            value={currentOrden.cliente.id}
            onChange={(e) =>
              setCurrentOrden({
                ...currentOrden,
                cliente: { id: parseInt(e.target.value) },
              })
            }
          />
          <TextField
            margin="dense"
            label="ID Mesa"
            type="number"
            fullWidth
            value={currentOrden.mesa.id}
            onChange={(e) =>
              setCurrentOrden({
                ...currentOrden,
                mesa: { id: parseInt(e.target.value) },
              })
            }
          />
          <TextField
            margin="dense"
            label="ID Usuario"
            type="number"
            fullWidth
            value={currentOrden.usuario.id}
            onChange={(e) =>
              setCurrentOrden({
                ...currentOrden,
                usuario: { id: parseInt(e.target.value) },
              })
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

export default Ordenes;
