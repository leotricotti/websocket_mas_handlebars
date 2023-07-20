import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtiene la ruta absoluta del archivo actual y el directorio que lo contiene
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// Lee el contenido del archivo especificado y lo devuelve como un objeto JSON
async function readFile(file) {
  try {
    let result = await fs.promises.readFile(__dirname + file, "utf-8");
    let data = await JSON.parse(result);
    return data;
  } catch (err) {
    console.log(err);
  }
}
// Escribe el objeto JSON proporcionado en el archivo especificado
async function writeFile(file, data) {
  try {
    await fs.promises.writeFile(__dirname + file, JSON.stringify(data));
    return true;
  } catch (err) {
    console.log(err);
  }
}

// Exporta las funciones readFile(), writeFile() y deleteFile() para que puedan ser utilizadas en otros módulos
export default { readFile, writeFile, __dirname };
