package com.example.proyectofinal.service;

import com.example.proyectofinal.model.Carrito;
import com.example.proyectofinal.model.DetalleCarrito;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.model.PerfumePersonalizado;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.model.Factura;
import com.example.proyectofinal.model.DetalleFactura;
import com.example.proyectofinal.repository.CarritoRepository;
import com.example.proyectofinal.repository.DetalleCarritoRepository;
import com.example.proyectofinal.repository.PerfumeRepository;
import com.example.proyectofinal.repository.UsuarioRepository;
import com.example.proyectofinal.repository.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfumeRepository perfumeRepository;
    
    @Autowired
    private DetalleCarritoRepository detalleCarritoRepository;

    @Autowired
    private FacturaRepository facturaRepository;

    public Carrito getCarritoActivo(Long usuarioId) {
        try {
            System.out.println("Buscando carrito activo para usuario ID: " + usuarioId);
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            
            if (!usuarioOpt.isPresent()) {
                System.err.println("Usuario con ID " + usuarioId + " no encontrado");
                throw new RuntimeException("Usuario no encontrado con ID: " + usuarioId);
            }
            
            List<Carrito> carritos = carritoRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVO");
            
            if (!carritos.isEmpty()) {
                System.out.println("Carrito activo encontrado para usuario ID: " + usuarioId);
                Carrito carrito = carritos.get(0);
                // Si hay múltiples carritos activos, desactivamos los adicionales
                if (carritos.size() > 1) {
                    System.out.println("Se encontraron " + carritos.size() + " carritos activos. Se utilizará el primero y se desactivarán los demás.");
                    for (int i = 1; i < carritos.size(); i++) {
                        Carrito carritoExtra = carritos.get(i);
                        carritoExtra.setEstado("INACTIVO");
                        carritoRepository.save(carritoExtra);
                    }
                }
                
                // Asegurar que detalles no sea null
                if (carrito.getDetalles() == null) {
                    carrito.setDetalles(new ArrayList<>());
                }
                return carrito;
            } else {
                System.out.println("Carrito activo no encontrado, creando uno nuevo para usuario ID: " + usuarioId);
                Usuario usuario = usuarioOpt.get();
                Carrito nuevoCarrito = new Carrito();
                nuevoCarrito.setUsuario(usuario);
                nuevoCarrito.setEstado("ACTIVO");
                // Inicializar detalles como lista vacía
                nuevoCarrito.setDetalles(new ArrayList<>());
                Carrito carritoGuardado = carritoRepository.save(nuevoCarrito);
                System.out.println("Nuevo carrito creado con ID: " + carritoGuardado.getId());
                return carritoGuardado;
            }
        } catch (Exception e) {
            System.err.println("Error al obtener carrito activo: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public DetalleCarrito agregarItem(Long usuarioId, Long perfumeId, Integer cantidad) {
        try {
            System.out.println("Agregando item al carrito - Usuario ID: " + usuarioId + ", Perfume ID: " + perfumeId + ", Cantidad: " + cantidad);
            Carrito carrito = getCarritoActivo(usuarioId);
            
            Perfume perfume = perfumeRepository.findById(perfumeId)
                    .orElseThrow(() -> {
                        System.err.println("Perfume con ID " + perfumeId + " no encontrado");
                        return new RuntimeException("Perfume no encontrado con ID: " + perfumeId);
                    });

            DetalleCarrito detalle = new DetalleCarrito();
            detalle.setCarrito(carrito);
            detalle.setPerfume(perfume);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(perfume.getPrecio());
            detalle.setSubtotal(perfume.getPrecio() * cantidad);

            // Inicializar detalles si es null
            if (carrito.getDetalles() == null) {
                carrito.setDetalles(new ArrayList<>());
            }
            
            carrito.getDetalles().add(detalle);
            carritoRepository.save(carrito);
            System.out.println("Item agregado correctamente al carrito ID: " + carrito.getId());
            return detalle;
        } catch (Exception e) {
            System.err.println("Error al agregar item al carrito: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void eliminarItem(Long usuarioId, Long detalleId) {
        try {
            System.out.println("Eliminando item ID: " + detalleId + " del carrito del usuario ID: " + usuarioId);
            Carrito carrito = getCarritoActivo(usuarioId);
            
            if (carrito.getDetalles() == null) {
                System.out.println("El carrito no tiene detalles, no hay nada que eliminar");
                return;
            }
            
            boolean removido = carrito.getDetalles().removeIf(detalle -> detalle.getId().equals(detalleId));
            
            if (!removido) {
                System.out.println("No se encontró el detalle con ID: " + detalleId + " en el carrito");
            } else {
                System.out.println("Item eliminado correctamente");
            }
            
            carritoRepository.save(carrito);
        } catch (Exception e) {
            System.err.println("Error al eliminar item del carrito: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Factura checkout(Long usuarioId, String direccionEnvio, String metodoPago) {
        try {
            System.out.println("Procesando checkout para usuario ID: " + usuarioId + " - Dirección: " + direccionEnvio + " - Método de pago: " + metodoPago);
            Carrito carrito = getCarritoActivo(usuarioId);
            
            if (carrito.getDetalles() == null || carrito.getDetalles().isEmpty()) {
                System.err.println("El carrito está vacío, no se puede procesar el checkout");
                throw new RuntimeException("El carrito está vacío");
            }

            // 1. Obtener el usuario
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));
            
            // 2. Crear la factura
            Factura factura = new Factura();
            factura.setUsuario(usuario);
            factura.setFechaEmision(java.time.LocalDateTime.now());
            factura.setMetodoPago(metodoPago);
            factura.setDireccionEnvio(direccionEnvio);
            factura.setTotal(0.0); // Se calculará a continuación
            factura.setDetalles(new ArrayList<>());
            
            // 3. Crear detalles de factura a partir de detalles del carrito
            double total = 0.0;
            for (DetalleCarrito detalleCarrito : carrito.getDetalles()) {
                DetalleFactura detalleFactura = new DetalleFactura();
                detalleFactura.setFactura(factura);
                detalleFactura.setCantidad(detalleCarrito.getCantidad());
                detalleFactura.setPrecioUnitario(detalleCarrito.getPrecioUnitario());
                detalleFactura.setSubtotal(detalleCarrito.getSubtotal());
                
                // Asignar perfume o perfume personalizado según corresponda
                if (detalleCarrito.getPerfume() != null) {
                    Perfume perfume = detalleCarrito.getPerfume();
                    detalleFactura.setPerfume(perfume);
                    detalleFactura.setNombreProducto(perfume.getNombre());
                } else if (detalleCarrito.getPerfumePersonalizado() != null) {
                    PerfumePersonalizado perfumePersonalizado = detalleCarrito.getPerfumePersonalizado();
                    detalleFactura.setPerfumePersonalizado(perfumePersonalizado);
                    detalleFactura.setNombreProducto(perfumePersonalizado.getNombre() + " (Personalizado)");
                }
                
                factura.getDetalles().add(detalleFactura);
                total += detalleFactura.getSubtotal();
            }
            
            factura.setTotal(total);
            
            // 4. Guardar la factura
            Factura facturaGuardada = facturaRepository.save(factura);
            System.out.println("Factura creada con ID: " + facturaGuardada.getId());

            // 5. Marcar el carrito como procesado
            carrito.setEstado("PROCESADO");
            carritoRepository.save(carrito);
            System.out.println("Carrito ID: " + carrito.getId() + " marcado como PROCESADO");

            // 6. Crear nuevo carrito activo para el usuario
            Carrito nuevoCarrito = new Carrito();
            nuevoCarrito.setUsuario(usuario);
            nuevoCarrito.setEstado("ACTIVO");
            nuevoCarrito.setDetalles(new ArrayList<>()); // Inicializar detalles como lista vacía
            Carrito nuevoCarritoGuardado = carritoRepository.save(nuevoCarrito);
            System.out.println("Nuevo carrito activo creado con ID: " + nuevoCarritoGuardado.getId());

            return facturaGuardada;
        } catch (Exception e) {
            System.err.println("Error al procesar checkout: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public DetalleCarrito actualizarCantidadItem(Long detalleId, Integer nuevaCantidad) {
        try {
            System.out.println("Actualizando cantidad del ítem ID: " + detalleId + " a: " + nuevaCantidad);
            
            // Obtener el detalle directamente del repositorio
            Optional<DetalleCarrito> detalleOpt = detalleCarritoRepository.findById(detalleId);
            if (!detalleOpt.isPresent()) {
                throw new RuntimeException("Detalle de carrito no encontrado con ID: " + detalleId);
            }
            
            DetalleCarrito detalle = detalleOpt.get();
            
            // Actualizar cantidad y subtotal
            detalle.setCantidad(nuevaCantidad);
            detalle.setSubtotal(detalle.getPrecioUnitario() * nuevaCantidad);
            
            // Guardar los cambios
            DetalleCarrito detalleActualizado = detalleCarritoRepository.save(detalle);
            System.out.println("Ítem actualizado correctamente. Nuevo subtotal: " + detalleActualizado.getSubtotal());
            
            return detalleActualizado;
        } catch (Exception e) {
            System.err.println("Error al actualizar cantidad del ítem: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
} 