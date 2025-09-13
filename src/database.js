import { connect } from 'mongoose'; 

(async () => {
  try {
    const db = await connect("mongodb://localhost:27017/muebleria");
    console.log("Base de datos conectada a: ", db.connection.name);
  } catch (error) {
    console.error(error);
  }
})();
