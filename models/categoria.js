const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const SchemaCategoria = new Schema({
 Codcategoria: {type:String, unique:true},
  nombre: String
});

module.exports = mongoose.model('categoria',SchemaCategoria);
