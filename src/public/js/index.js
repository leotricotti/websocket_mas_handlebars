// Crear una instancia del socket
const socketIo = io();

// Variable para almacenar el id del nuevo producto
let newId = "";

// Limpia el archivo temporal al iniciar la aplicación
window.addEventListener("load", async () => {
  // Crear una variable vacia
  let tempArray = [];
  // Borra el archivo temporal al iniciar la aplicación
  socketIo.emit("borrarTemp", tempArray);
});

// Mensaje que indica que el cliente se ha conectado
socketIo.emit("mesagge", "Hola soy un cliente");

// Obtener el formulario de agregar producto
const form = document.getElementById("add-product-form");
// Agregar un controlador de eventos para el envío del formulario
form.addEventListener("submit", handleSubmit);

// Escuchar el evento 'currentId' y agreagar el id al nuevo producto
socketIo.on("currentId", (id) => {
  return (newId = id);
});

// Función para manejar el envío del formulario
function handleSubmit(e) {
  // Prevenir el comportamiento predeterminado del formulario
  e.preventDefault();
  // Obtener los elementos del formulario utilizando la desestructuración de objetos
  const { title, description, code, price, stock, category, thumbnail } =
    form.elements;
  // Validar que todos los campos del formulario tengan un valor
  if (
    !title.value ||
    !description.value ||
    !code.value ||
    !price.value ||
    !stock.value ||
    !category.value ||
    !thumbnail.value
  ) {
    return Swal.fire({
      icon: "error",
      title: "Lo siento...",
      text: "Todos los campos son necesarios!",
      focusConfirm: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    });
  } else {
    // Crear un objeto de producto con los valores de los campos del formulario
    const product = {
      id: newId,
      title: title.value,
      description: description.value,
      code: code.value,
      price: price.value,
      stock: stock.value,
      category: category.value,
      thumbnail: thumbnail.value,
    };
    // Enviar el objeto producto al servidor a través del socket
    socketIo.emit("addProduct", product);
  }
  // Mostrar un mensaje de éxito
  Swal.fire({
    icon: "success",
    title: "Producto agregado con exito!",
    showConfirmButton: true,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
  });
  // Limpiar todos los campos del formulario
  for (let i = 0; i < form.elements.length; i++) {
    form.elements[i].value = "";
  }
}

// Función para actualizar la lista de productos
function updateProductList(products) {
  // Obtener el elemento de lista de productos
  const productList = document.getElementById("products-list");
  // Vaciar la lista de productos antes de agregar los nuevos elementos de lista
  productList.innerHTML = "";
  // Recorrer los productos y crear un elemento de lista para cada uno
  products.forEach((product) => {
    // Crear un elemento de lista
    const container = document.createElement("div");
    // Agregar clases de Bootstrap al elemento de lista
    container.classList.add("list-group-item");
    // Establecer el contenido del elemento de lista utilizando los datos del producto
    container.innerHTML = `
        <div class="d-flex w-100 justify-content-between flex-column">
          <h2 class="mb-1 subtitle">${product.title}</h2>
          <p class="mb-1"><strong>Descripción:</strong> ${product.description}</p>
          <p class="mb-1"><strong>Codigo:</strong> ${product.code}</p>
          <p class="mb-1"><strong>Precio:</strong> ${product.price}</p>
          <p class="mb-1"><strong>Status:</strong> ${product.status}</p>
          <p class="mb-1"><strong>Stock:</strong> ${product.stock}</p>
          <p class="mb-1"><strong>Categoria:</strong> ${product.category}</p>
          <img src="${product.thumbnail}" alt="img" width="50" height="50" class="thumbnail">
        </div>
        <button type="button" class="btn btn-primary delete-product-btn">Eliminar</button>
      `;
    // Obtener el botón de eliminación dentro del elemento de lista
    const btnEliminar = container.querySelector(".delete-product-btn");
    // Agregar un evento de clic al botón de eliminación que llama a la función eliminarProducto con el id del producto
    btnEliminar.addEventListener("click", () => {
      eliminarProducto(product.id);
    });
    // Agregar el elemento de lista a la lista de productos
    productList.appendChild(container);
  });
}

// Escuchar el evento 'products' y llamar a la función updateProductList
socketIo.on("products", (products) => {
  // Actualizar la lista de productos
  updateProductList(products);
});

// Eliminar un producto de la lista de productos
function eliminarProducto(id) {
  // Enviar el id del producto al servidor a través del socket
  socketIo.emit("deleteProduct", id);
  // Obtener el array actualizado de productos después de que se elimina un producto
  socketIo.on("products", (products) => {
    // Actualizar la lista de productos
    updateProductList(products);
  });
  // Mostrar un mensaje de éxito
  Swal.fire({
    icon: "success",
    title: "Producto eliminado con exito!",
    showConfirmButton: true,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
  });
}
