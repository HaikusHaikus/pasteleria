//importar los framekworks necesarios parea ejecutar
//la app
const express = require('express');//SW
const mongoose = require('mongoose');//mongo
const bodyParser = require('body-parser');//json
const cors = require('cors');// permitir solicitudes
const bcrypt = require('bcrypt');//encriptar

//crear una instancia de la aplicación express
const app = express();
//Definir el puerto donde se ejecutará el server
const PORT = process.env.PORT || 3000; //USA EL PUERTO QUE ASIGNE RAIWAY O LOCAL 3000


//habilitar cors  para permitir peticiones
app.use(cors());
//sentencia que permite a express entienda el formato json
app.use(bodyParser.json());

//detectar archivos estaticos de la carpeta public
app.use(express.static('public'));

//conexion a mongoDB
//concetarse a pasteleria
mongoose.connect(process.env.MONGODB_URL, {   
    useNewUrlParser:true, //usa el parser de url
    useUnifiedTopology:true //motor de monitoreo
   })
   //si la conexion es exitosa, mmuestra mensaje
   .then(() => console.log('conectado a mongodb atlas'))
    //si hay un error, muestra mensaje
    .catch(err => console.error('ERROR DE CONEXION:', err));

    //esquemas y modelos 


// Define el esquema para los usuarios
const UsuarioSchema = new mongoose.Schema({
    nombre: String,     // Nombre del usuario
    email: String,      // Correo electrónico del usuario
    password: String    // Contraseña encriptada del usuario
});

// Crea el modelo Usuario basado en el esquema anterior
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Define el esquema para los pasteles
const PastelSchema = new mongoose.Schema({
    nombre: String,     // Nombre del pastel
    precio: Number      // Precio del pastel
});
// Crea el modelo Pastel basado en el esquema anterior
const Pastel = mongoose.model('Pastel', PastelSchema);

// Define el esquema para los empleados
const EmpleadoSchema = new mongoose.Schema({
    nombre: String,     // Nombre del empleado
    rol: String         // Rol del empleado (ejemplo: repostero, vendedor)
});
// Crea el modelo Empleado basado en el esquema anterior
const Empleado = mongoose.model('Empleado', EmpleadoSchema);

// Define el esquema para los pedidos
const PedidoSchema = new mongoose.Schema({
    cliente: String,    // Nombre del cliente que hace el pedido
    producto: String    // Producto solicitado en el pedido
});
// Crea el modelo Pedido basado en el esquema anterior
const Pedido = mongoose.model('Pedido', PedidoSchema);

// Rutas de autenticación

// Ruta para registrar un nuevo usuario
app.post('/registro', async (req, res) => {
    // Extrae nombre, email y password del cuerpo de la solicitud
    const { nombre, email, password } = req.body;
    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    // Crea un nuevo usuario con los datos recibidos y la contraseña encriptada
    const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
    // Guarda el usuario en la base de datos
    await nuevoUsuario.save();
//responde con un mensaje de exito y codigo 201
    res.status(201).send('Uusario registrado');

});

//ruta para iniciar sesion 
app.post('/login',async(req,res) =>{
//extraer email y password del cuerpo de la solicitud
const {email,password} = req.body;
// busca un usuario con el email dado
const usuario = await Usuario.findOne({email});
////si no existe el usario , responde con error
if (!usuario)return res.status(401).send('usuario no encontrado');
//compara la contraseña proporcionada
const valid = await bcrypt.compare(password,usuario.password);
//si la contraseña no es valida responde con error 401
if(!valid) return res.status(401).send('contraseña incorrecta');
//si todo coincide responde con un mensaje de éxito
res.send('bienvenido ' + usuario.nombre);
});

//crud pasteles
//ruta para obtener todos los pasteles
app.get('/api/pasteles',async(req,res) =>{
    //busca todos los pasteles en la BD
    const pasteles = await Pastel.find();
    //devuelve la lista de pasteles en formato JSON
    res.json(pasteles);
});


//crear un nuevo pastel 
app.post('/api/pasteles', async (req,res)=>{
    //crea un nuevo pastel 
    const nuevo = new Pastel(req.body);
    //guarda el pastel en la bd
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send('pastel creado');
});
// eliminar un pastel por id
app.delete('/api/pasteles/:id' , async (req,res )=> {
    //elimina el pastel cuyo id se recibe
    await Pastel.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('pastel eliminado');
});





// Ruta para obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
    // Busca todos los empleados en la base de datos
    const empleados = await Empleado.find();
    // Devuelve la lista de empleados en formato JSON
    res.json(empleados);
});

// Ruta para crear un nuevo empleado
app.post('/api/empleados', async (req, res) => {
    // Crea un nuevo empleado con los datos recibidos en la solicitud
    const nuevo = new Empleado(req.body);
    // Guarda el empleado en la base de datos
    await nuevo.save();
    // Responde con mensaje de éxito y código 201 (creado)
    res.status(201).send('Empleado agregado');
});

// Ruta para eliminar un empleado por su ID
app.delete('/api/empleados/:id', async (req, res) => {
    // Elimina el empleado cuyo ID se recibe en la URL
    await Empleado.findByIdAndDelete(req.params.id);
    // Responde con mensaje de éxito
    res.send('Empleado eliminado');
});


// Ruta para obtener todos los pedidos
app.get('/api/pedidos', async (req, res) => {
    // Busca todos los pedidos en la base de datos
    const pedidos = await Pedido.find();
    // Devuelve la lista de pedidos en formato JSON
    res.json(pedidos);
});

// Ruta para crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    // Crea un nuevo pedido con los datos recibidos en la solicitud
    const nuevo = new Pedido(req.body);
    // Guarda el pedido en la base de datos
    await nuevo.save();
    // Responde con mensaje de éxito y código 201 (creado)
    res.status(201).send('Pedido registrado');
});

// Ruta para eliminar un pedido por su ID
app.delete('/api/pedidos/:id', async (req, res) => {
    // Elimina el pedido cuyo ID se recibe en la URL
    await Pedido.findByIdAndDelete(req.params.id);
    // Responde con mensaje de éxito
    res.send('Pedido eliminado');
});


// Iniciar servidor

// Inicia el servidor y lo pone a escuchar en el puerto definido
app.listen(PORT, () => {
    // Muestra en consola la URL donde está corriendo el servidor
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
