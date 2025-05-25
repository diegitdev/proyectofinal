import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #666',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  company: {
    fontSize: 14,
    marginBottom: 5,
  },
  info: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    borderBottomStyle: 'solid',
    padding: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '15%',
    textAlign: 'right',
  },
  total: {
    marginTop: 20,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 50,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

// Componente para la factura en PDF
const FacturaPDF = ({ factura }) => {
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} €`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.title}>FACTURA</Text>
          <Text style={styles.company}>Luxury Scents</Text>
          <Text>C/ Perfume Nº123, 28001 Madrid, España</Text>
          <Text>CIF: B12345678</Text>
          <Text>info@luxuryscents.com</Text>
        </View>

        {/* Información de la factura */}
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nº Factura:</Text>
            <Text style={styles.infoValue}>{factura.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(factura.fechaEmision)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{factura.usuario?.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{factura.usuario?.correo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección de envío:</Text>
            <Text style={styles.infoValue}>{factura.direccionEnvio}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Método de pago:</Text>
            <Text style={styles.infoValue}>{factura.metodoPago}</Text>
          </View>
        </View>

        {/* Tabla de productos */}
        <View style={styles.table}>
          {/* Cabecera de la tabla */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol1}>Descripción</Text>
            <Text style={styles.tableCol2}>Cantidad</Text>
            <Text style={styles.tableCol3}>Precio</Text>
            <Text style={styles.tableCol4}>Total</Text>
          </View>

          {/* Filas de productos */}
          {factura.detalles?.map((detalle, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{detalle.nombreProducto}</Text>
              <Text style={styles.tableCol2}>{detalle.cantidad}</Text>
              <Text style={styles.tableCol3}>{formatCurrency(detalle.precioUnitario)}</Text>
              <Text style={styles.tableCol4}>{formatCurrency(detalle.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.total}>
          <Text>TOTAL: {formatCurrency(factura.total)}</Text>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>Gracias por su compra. Este documento sirve como comprobante de pago.</Text>
          <Text>Luxury Scents © {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FacturaPDF; 