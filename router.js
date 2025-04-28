import { Router } from 'express';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import fbDatabase from "./fb_database.js";

const firebaseConfig = {
  databaseURL: fbDatabase.url,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

const router = Router();


// PRODUCTOS

// consultar productos
router.get('/productos', async (req, res) => {
    try {
      const snapshot = await get(child(dbRef, 'productos'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productos = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        res.json(productos);
      } else {
        res.status(404).json({ error: 'No hay productos disponibles' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo productos' });
    }
});


// Crear un nuevo producto
router.post('/productos', async (req, res) => {
    const { nombre, descripcion, precio, foto_url, usuario_id } = req.body;
  
    if (!nombre || !descripcion || !precio || !foto_url || !usuario_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    const newProduct = {
      nombre,
      descripcion,
      precio,
      foto_url,
      fecha_publicacion: new Date().toISOString(),
      usuario_id,
    };
  
    try {
      const newProductRef = ref(db, 'productos').push();
      await set(newProductRef, newProduct);
      res.status(201).json({ id: newProductRef.key, ...newProduct });
    } catch (error) {
      res.status(500).json({ error: 'Error creando producto' });
    }
});
  

  // Editar un producto
router.put('/productos/:productId', async (req, res) => {
    const { productId } = req.params;
    const { nombre, descripcion, precio, foto_url } = req.body;
  
    if (!nombre || !descripcion || !precio || !foto_url) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    try {
      const productRef = ref(db, `productos/${productId}`);
      const snapshot = await get(productRef);
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
  
      await update(productRef, {
        nombre,
        descripcion,
        precio,
        foto_url,
      });
  
      res.json({ id: productId, nombre, descripcion, precio, foto_url });
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando producto' });
    }
});


// Eliminar un producto
router.delete('/productos/:productId', async (req, res) => {
    const { productId } = req.params;
  
    try {
      const productRef = ref(db, `productos/${productId}`);
      const snapshot = await get(productRef);
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
  
      await remove(productRef);
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando producto' });
    }
});
  

// Crear un nuevo usuario
router.post('/usuarios', async (req, res) => {
    const { nombre, apellido, correo, contrasena, contacto } = req.body;
    
    if (!nombre || !apellido || !correo || !contrasena || !contacto) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    const newUser = {
      nombre,
      apellido,
      correo,
      contrasena,
      contacto,
    };
  
    try {
      const newUserRef = ref(db, 'usuarios').push();
      await set(newUserRef, newUser);
      res.status(201).json({ id: newUserRef.key, ...newUser });
    } catch (error) {
      res.status(500).json({ error: 'Error creando usuario' });
    }
});


//consultar usuarios
router.get('/usuarios', async (req, res) => {
    try {
      const snapshot = await get(child(dbRef, 'usuarios'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usuarios = Object.entries(data).map(([id, value]) => {
          const { contrasena, ...usuarioSinContrasena } = value;
          return { id, ...usuarioSinContrasena };
        });
        res.json(usuarios);
      } else {
        res.status(404).json({ error: 'No hay usuarios disponibles' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
});


// consultar usuario por id
router.get('/usuarios/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const snapshot = await get(child(dbRef, `usuarios`));
      
      if (snapshot.exists()) {

        const usuario = snapshot.val().find((user) => user.id === userId );

        if (usuario) {
            const { contrasena, ...usuarioSinContrasena } = usuario;
            res.json({ id: userId, ...usuarioSinContrasena });
        } else {
            res.status(404).json({ error: `Usuario con ID ${userId} no encontrado` });
        }
        
        
      } else {
        res.status(404).json({ error: `Usuario con ID ${userId} no encontrado` });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo datos del usuario' });
    }
});


// Editar un usuario
router.put('/usuarios/:userId', async (req, res) => {
    const { userId } = req.params;
    const { nombre, apellido, correo, contacto } = req.body;
  
    if (!nombre || !apellido || !correo || !contacto) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    try {
      const userRef = ref(db, `usuarios/${userId}`);
      const snapshot = await get(userRef);
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      await update(userRef, {
        nombre,
        apellido,
        correo,
        contacto,
      });
  
      res.json({ id: userId, nombre, apellido, correo, contacto });
    } catch (error) {
      res.status(500).json({ error: 'Error actualizando usuario' });
    }
});

  
// Eliminar un usuario
router.delete('/usuarios/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const userRef = ref(db, `usuarios/${userId}`);
      const snapshot = await get(userRef);
  
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      await remove(userRef); // Eliminar el usuario
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error eliminando usuario' });
    }
});


// devuelve los chats por usuario
router.get('/chats/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const snapshot = await get(child(dbRef, 'chats'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const chats = Object.entries(data)
          .map(([id, value]) => ({ id, ...value }))
          .filter(chat => chat.ofertante_id === userId || chat.interesado_id === userId);
        res.json(chats);
      } else {
        res.status(404).json({ error: 'No hay chats para este usuario' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error obteniendo chats del usuario' });
    }
});


// Crear un nuevo mensaje
router.post('/mensajes', async (req, res) => {
    const { chat_id, emisor_id, contenido } = req.body;
    
    if (!chat_id || !emisor_id || !contenido) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const newMessage = {
        chat_id,
        emisor_id,
        contenido,
        fecha_envio: new Date().toISOString(),
    };
    
    try {
        const newMessageRef = ref(db, 'mensaje').push();
        await set(newMessageRef, newMessage);
        res.status(201).json({ id: newMessageRef.key, ...newMessage });
    } catch (error) {
        res.status(500).json({ error: 'Error creando mensaje' });
    }
});


// devuelve los mensajes por chat
router.get('/mensajes/:chatId', async (req, res) => {
  const chatId = req.params.chatId;
  try {
    const snapshot = await get(child(dbRef, 'mensaje'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const mensajes = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .filter(m => m.chat_id === chatId)
        .sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio));
      res.json(mensajes);
    } else {
      res.status(404).json({ error: 'No hay mensajes para este chat' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo mensajes del chat' });
  }
});
  

// Crear un nuevo chat
router.post('/chats', async (req, res) => {
    const { producto_id, ofertante_id, interesado_id } = req.body;
  
    if (!producto_id || !ofertante_id || !interesado_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    const newChat = {
      producto_id,
      ofertante_id,
      interesado_id,
      fecha_creacion: new Date().toISOString(),
    };
  
    try {
      const newChatRef = ref(db, 'chats').push();
      await set(newChatRef, newChat);
      res.status(201).json({ id: newChatRef.key, ...newChat });
    } catch (error) {
      res.status(500).json({ error: 'Error creando chat' });
    }
});
  

// Eliminar un chat
router.delete('/chats/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        const chatRef = ref(db, `chats/${chatId}`);
        const snapshot = await get(chatRef);

        if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Chat no encontrado' });
        }

        await remove(chatRef);
        res.json({ message: 'Chat eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando chat' });
    }
});


export default router;