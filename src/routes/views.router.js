import { Router } from "express";
import utils from "../utils.js";
// Array de productos
let products = [];
// Crear un router para la gestión de productos
const router = Router();
// Ruta del archivo JSON
const dataJson = "/data/products.json";
// Método asyncrono para obtener todos los productos
router.get("/", async (req, res) => {
  const { limit } = req.query;
  try {
    // Obtener los productos del archivo
    const response = await utils.readFile(dataJson);
    // Si se proporciona un parámetro limit en la consulta, devuelve solo los produntos especificados
    if (limit) {
      let tempArray = response.slice(0, limit);
      res.render("home", {
        products: tempArray,
        limit: limit,
        quantity: tempArray.length,
        style: "home.css",
        title: "Productos",
      });
    } else {
      // Si no se proporciona un parámetro limit, devuelve la lista completa de productos
      res.render("home", {
        products: response,
        limit: false,
        quantity: response.length,
        style: "home.css",
        title: "Productos",
      });
    }
  } catch (err) {
    // Manejar el error
    console.log(err);
  }
});
//
router.get("/realtimeproducts", async (req, res) => {
  try {
    // Obtener los productos del archivo
    const response = await utils.readFile(dataJson);
    res.render("realTimeProducts", {
      products: response,
      quantity: response.length,
      style: "realTimeProducts.css",
      title: "Productos en tiempo real",
    });
  } catch (err) {
    // Manejar el error
    console.log(err);
  }
});
// Metodo asyncrono para agregar un producto y validar que los datos sean correctos
router.post("/realtimeproducts", async (req, res) => {
  // Obtener los datos del body
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = req.body;
  // Validar que todos los datos estén presentes
  if (!title || !description || !price || !code || !stock) {
    // Si falta algún dato, lanzar un error
    res.status(400).json({ message: "Faltan datos" });
  }
  try {
    // Leer el archivo JSON existente
    const data = await utils.readFile(dataJson);
    // Agregar los productos del archivo al array de productos
    products.push(...data);
  } catch (error) {
    // Manejar el error
    console.log(error);
  }
  // Obtener el último id del array de productos
  const lastId = products.reduce((max, product) => {
    return product.id > max ? product.id : max;
  }, 0);
  // Generar un nuevo id autoincremental
  const newId = lastId + 1;
  // Verificar si el código ya existe en algún producto existente
  const codeExist = products.find((product) => product.code === code);
  if (codeExist) {
    // Si el código ya existe, lanzar un error
    res.status(400).json({ message: "El código ya existe" });
  } else {
    // Si todo está bien, crear el producto y agregarlo al array
    let product = {
      id: newId,
      title: title,
      description: description,
      code: code,
      price: price,
      status: !status || typeof status !== "boolean" ? true : status,
      stock: stock,
      category: category,
      thumbnails: !thumbnails ? "" : thumbnails,
    };
    // Agregar el producto al array
    products.push(product);
    try {
      // Escribir el archivo JSON actualizado
      await utils.writeFile(dataJson, products);
      // Devolver un mensaje de éxito
      res.json({ message: "Producto creado con éxito", data: product });
    } catch (err) {
      // Manejar el error
      console.log(err);
    }
  }
});
//Metodo asyncrono para eliminar un producto
router.delete("/realtimeproducts/:pid", async (req, res) => {
  const { pid } = req.params;
  console.log(products);
  try {
    // Leer el archivo JSON
    let data = await utils.readFile(dataJson);
    // Agregar los productos del archivo al array de productos
    products.push(...data);
    // Encontrar el índice del producto en el array de productos
    let productIndex = products.findIndex((dato) => dato.id === parseInt(pid));
    // Si se encuentra el producto, eliminarlo del array
    if (productIndex !== -1) {
      // Obtener el producto a eliminar
      let product = products[productIndex];
      // Eliminar el producto del array
      products.splice(productIndex, 1);
      // Escribir el archivo JSON actualizado
      await utils.writeFile(dataJson, products);
      // Devolver el producto eliminado
      res.json({ mensaje: "Producto eliminado con éxito", producto: product });
    } else {
      // Si no se encuentra el producto, devolver un mensaje indicando que no existe
      res.status(404).json({ mensaje: "Producto inexistente" });
    }
  } catch (error) {
    // Manejar el error
    console.log(error);
  }
});

export default router;
