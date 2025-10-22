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

const Platillos = () => {
  const [platillos, setPlatillos] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPlatillo, setCurrentPlatillo] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: { id: 1 },
  });

  useEffect(() => {
    fetchPlatillos();
  }, []);

  const fetchPlatillos = async () => {
    const response = await axios.get('/api/platillos');
    setPlatillos(response.data);
  };

  const handleClickOpen = (platillo = null) => {
    setCurrentPlatillo(
      platillo || { id: null, nombre: '', descripcion: '', precio: 0, categoria: { id: 1 } }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentPlatillo.id) {
      await axios.put(`/api/platillos/${currentPlatillo.id}`, currentPlatillo);
    } else {
      await axios.post('/api/platillos', currentPlatillo);
    }
    fetchPlatillos();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/platillos/${id}`);
    fetchPlatillos();
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Añadir Platillo
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {platillos.map((platillo) => (
              <TableRow key={platillo.id}>
                <TableCell>{platillo.nombre}</TableCell>
                <TableCell>{platillo.descripcion}</TableCell>
                <TableCell>{platillo.precio}</TableCell>
                <TableCell>
                  <Button onClick={() => handleClickOpen(platillo)}>Editar</Button>
                  <Button onClick={() => handleDelete(platillo.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentPlatillo.id ? 'Editar' : 'Añadir'} Platillo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={currentPlatillo.nombre}
            onChange={(e) => setCurrentPlatillo({ ...currentPlatillo, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={currentPlatillo.descripcion}
            onChange={(e) =>
              setCurrentPlatillo({ ...currentPlatillo, descripcion: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Precio"
            type="number"
            fullWidth
            value={currentPlatillo.precio}
            onChange={(e) =>
              setCurrentPlatillo({ ...currentPlatillo, precio: parseFloat(e.target.value) })
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

export default Platillos;
