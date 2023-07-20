import express from "express";
import { engine } from "express-handlebars";
import viewsRouter from "./routes/views.router.js";
import utils from "./utils.js";
import { Server } from "socket.io";

// Importa las funciones de utilidad para el manejo de archivos
const { writeFile, readFile, __dirname } = utils;
// Lista de productos
let productsList = [];
// Temporal de productos
let tempArray = [];
// Archivo JSON donde se almacenan los productos
const dataJson = "/data/products.json";
// Archivo JSON donde se almacenan los productos
const dataJsonTemp = "/data/tempArray.json";

// Crea una instancia de la aplicación Express
const app = express();
// Puerto en el que escucha el servidor
const PORT = 8085;

// Inicia el servidor en el puerto especificado y registra un mensaje en la consola
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor express escuchando en http://localhost:${PORT}`);
});
// Inicializa el socket server
const ioServer = new Server(httpServer);

// Indica que todos los formatos de datos enviados al servidor se interpretan como JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura el motor de renderizado de plantillas
app.engine("handlebars", engine());
// Establece el directorio donde se encuentran las plantillas
app.set("views", __dirname + "/views");
// Establece el motor de renderizado de plantillas
app.set("view engine", "handlebars");

// Establece el directorio donde se encuentran los archivos estáticos
app.use(express.static(__dirname + "/public"));
// Establece la ruta base para las vistas
app.use("/", viewsRouter);

// Función para cargar los productos del archivo JSON
const loadProducts = async () => {
  // Leer el archivo JSON existente
  try {
    // Leer el archivo JSON existente
    const data = await readFile(dataJson);
    // Agregar los productos del archivo al array de productos
    productsList.push(...data);
  } catch (error) {
    // Manejar el error
    console.log(error);
  }
};

// Función para cargar los productos del archivo JSON
const loadTempProducts = async () => {
  try {
    // Leer el archivo JSON existente
    const data = await readFile(dataJsonTemp);
    // Agregar los productos del archivo al array de productos
    tempArray.push(...data);
  } catch (error) {
    // Manejar el error
    console.log(error);
  }
};

// Cargar los productos del archivo JSON
loadProducts();
loadTempProducts();

// Código para el manejo de conexiones de socket
ioServer.on("connection", async (socket) => {
  // Mensaje de bienvenida al cliente que se conectó
  console.log("Un cliente se ha conectado");

  socket.on("borrarTemp", async (tempArray) => {
    try {
      // Escribir el archivo JSON actualizado
      await writeFile(dataJsonTemp, tempArray);
    } catch (error) {
      // Manejar el error
      console.log(error);
    }
  });

  // Crear un id para el nuevo producto
  const prodId = productsList.length + 1;
  // Emitir el id al cliente
  ioServer.emit("currentId", prodId);

  // Escuchar evento 'agregarProducto' y emitir 'nuevoProductoAgregado'
  socket.on("addProduct", async (newProduct) => {
    try {
      // Agregar el producto al array temporal
      tempArray.push(newProduct);
      // Escribir el archivo JSON actualizado
      await writeFile(dataJsonTemp, tempArray);
      //Agregar al array de productos el nuevo producto
      productsList.push(newProduct);
      // Escribir el archivo JSON actualizado
      await writeFile(dataJson, productsList);
    } catch (error) {
      // Manejar el error
      console.log(error);
    }
    // Emitir el array de productos al cliente
    ioServer.emit("products", tempArray);
  });

  //Eliminar el producto del array temporal
  socket.on("deleteProduct", async (id) => {
    try {
      // Eliminar el producto del array de productos
      tempArray = tempArray.filter((product) => product.id !== id);
      // Escribir el archivo JSON actualizado
      await writeFile(dataJsonTemp, tempArray);
      // Eliminar el producto del array de productos
      productsList = productsList.filter((product) => product.id !== id);
      // Escribir el archivo JSON actualizado
      await writeFile(dataJson, productsList);
    } catch (error) {
      // Manejar el error
      console.log(error);
    }
    // Emitir el array de productos al cliente
    ioServer.emit("products", tempArray);
  });
});
