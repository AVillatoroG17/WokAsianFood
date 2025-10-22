import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import Platillos from './components/Platillos';
import Ordenes from './components/Ordenes';
import Usuarios from './components/Usuarios';
import Mesas from './components/Mesas';
import Clientes from './components/Clientes';

function App() {
  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/platillos">
              Platillos
            </Button>
            <Button color="inherit" component={Link} to="/ordenes">
              Órdenes
            </Button>
            <Button color="inherit" component={Link} to="/usuarios">
              Usuarios
            </Button>
            <Button color="inherit" component={Link} to="/mesas">
              Mesas
            </Button>
            <Button color="inherit" component={Link} to="/clientes">
              Clientes
            </Button>
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/platillos" element={<Platillos />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/mesas" element={<Mesas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/" element={<Platillos />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
