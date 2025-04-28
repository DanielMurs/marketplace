import request from 'supertest';
import express from 'express';
import router from '../router'; 
import { ref, get } from 'firebase/database';


jest.mock('firebase/database');

const app = express();
app.use(express.json());
app.use(router);


describe('GET /productos', () => {
  it('should return all products when they exist', async () => {
    const mockSnapshot = {
      exists: jest.fn().mockReturnValue(true),
      val: jest.fn().mockReturnValue({
        1: { nombre: 'Producto 1', descripcion: 'Descripcion 1', precio: 100, foto_url: 'url' },
        2: { nombre: 'Producto 2', descripcion: 'Descripcion 2', precio: 200, foto_url: 'url' }
      })
    };

    get.mockResolvedValue(mockSnapshot);

    const response = await request(app).get('/productos');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: '1', nombre: 'Producto 1', descripcion: 'Descripcion 1', precio: 100, foto_url: 'url' },
      { id: '2', nombre: 'Producto 2', descripcion: 'Descripcion 2', precio: 200, foto_url: 'url' }
    ]);
    });

    it('should return 404 when no products are available', async () => {
        const mockSnapshot = {
        exists: jest.fn().mockReturnValue(false),
        };

        get.mockResolvedValue(mockSnapshot);

        const response = await request(app).get('/productos');
    
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('No hay productos disponibles');
    });
});


describe('POST /productos', () => {
    it('should create a new product when all fields are provided', async () => {
      const mockPush = jest.fn().mockReturnValue({ key: '1' });
      const mockSet = jest.fn();
  
      ref.mockReturnValueOnce({
        push: mockPush
      });
      set.mockImplementationOnce(mockSet);
  
      const newProduct = {
        nombre: 'Producto Nuevo',
        descripcion: 'Descripcion del producto',
        precio: 300,
        foto_url: 'url-imagen',
        usuario_id: 'usuario_1'
      };
  
      const response = await request(app).post('/productos').send(newProduct);
  
      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Producto Nuevo');
      expect(response.body.descripcion).toBe('Descripcion del producto');
    });
  
    it('should return 400 when required fields are missing', async () => {
      const newProduct = { nombre: 'Producto Nuevo' }; // Faltan campos
  
      const response = await request(app).post('/productos').send(newProduct);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Faltan campos requeridos');
    });
});


describe('PUT /productos/:productId', () => {
    it('should update an existing product', async () => {
      const productId = '1';
      const updatedProduct = { nombre: 'Producto Actualizado', descripcion: 'Descripcion nueva', precio: 400, foto_url: 'new-url' };
  
      const mockSnapshot = { exists: jest.fn().mockReturnValue(true) };
      const mockUpdate = jest.fn();
  
      ref.mockReturnValue({
        update: mockUpdate
      });
      get.mockResolvedValue(mockSnapshot);
  
      const response = await request(app).put(`/productos/${productId}`).send(updatedProduct);
  
      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(updatedProduct);
      expect(response.body.nombre).toBe('Producto Actualizado');
    });
  
    it('should return 404 when product not found', async () => {
      const productId = 'nonexistent-id';
      const mockSnapshot = { exists: jest.fn().mockReturnValue(false) };
      get.mockResolvedValue(mockSnapshot);
  
      const response = await request(app).put(`/productos/${productId}`).send({
        nombre: 'Producto Actualizado',
        descripcion: 'Descripcion nueva',
        precio: 400,
        foto_url: 'new-url'
      });
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Producto no encontrado');
    });
});


describe('DELETE /productos/:productId', () => {
    it('should delete an existing product', async () => {
      const productId = '1';
  
      const mockSnapshot = { exists: jest.fn().mockReturnValue(true) };
      const mockRemove = jest.fn();
  
      ref.mockReturnValue({
        remove: mockRemove
      });
      get.mockResolvedValue(mockSnapshot);
  
      const response = await request(app).delete(`/productos/${productId}`);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Producto eliminado correctamente');
      expect(mockRemove).toHaveBeenCalled();
    });
  
    it('should return 404 when product not found', async () => {
      const productId = 'nonexistent-id';
  
      const mockSnapshot = { exists: jest.fn().mockReturnValue(false) };
      get.mockResolvedValue(mockSnapshot);
  
      const response = await request(app).delete(`/productos/${productId}`);
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Producto no encontrado');
    });
});