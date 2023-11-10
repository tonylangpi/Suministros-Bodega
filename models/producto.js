const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const SchemaProducto = new Schema({
 Codproducto: {type:String, unique:true},
  nombre: String,
  Codcategoria: String,
  existencia: Number,
  costo: Number,
  precio: Number,
  fechaingreso: Date,
  estado: Boolean
});

module.exports = mongoose.model('producto',SchemaProducto);
