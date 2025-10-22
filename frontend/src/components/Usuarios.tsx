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

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState({
    id: null,
    nombre: '',
    rol: 'MESERO',
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const response = await axios.get('/api/usuarios');
    setUsuarios(response.data);
  };

  const handleClickOpen = (usuario = null) => {
    setCurrentUsuario(usuario || { id: null, nombre: '', rol: 'MESERO' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (currentUsuario.id) {
      await axios.put(`/api/usuarios/${currentUsuario.id}`, currentUsuario);
    } else {
      await axios.post('/api/usuarios', currentUsuario);
    }
    fetchUsuarios();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/usuarios/${id}`);
    fetchUsuarios();
  };

  return (
    <div>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Añadir Usuario
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.rol}</TableCell>
                <TableCell>
                  <Button onClick={() => handleClickOpen(usuario)}>Editar</Button>
                  <Button onClick={() => handleDelete(usuario.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentUsuario.id ? 'Editar' : 'Añadir'} Usuario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={currentUsuario.nombre}
            onChange={(e) => setCurrentUsuario({ ...currentUsuario, nombre: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Rol"
            type="text"
            fullWidth
            value={currentUsuario.rol}
            onChange={(e) => setCurrentUsuario({ ...currentUsuario, rol: e.target.value })}
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

export default Usuarios;
