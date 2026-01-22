import PDFDocument from 'pdfkit'
import { GuiaDespachoModel } from './guia-despacho.model'

/* =====================================================
   Generar PDF de Guía de Despacho
===================================================== */
export async function generarPdfGuiaDespacho(
  guiaId: string
): Promise<PDFDocument> {
  const guia = await GuiaDespachoModel.findById(guiaId)

  if (!guia) {
    throw new Error('Guía de despacho no encontrada')
  }

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  })

  /* ===============================
     Encabezado
  =============================== */
  doc
    .fontSize(18)
    .text('GUÍA DE DESPACHO INTERNA', {
      align: 'center',
    })

  doc.moveDown(0.5)

  doc
    .fontSize(12)
    .text(`N° ${guia.numero}`, {
      align: 'center',
    })

  doc.moveDown(1)

  /* ===============================
     Datos generales
  =============================== */
  doc.fontSize(10)

  doc.text(`Fecha: ${guia.createdAt.toLocaleDateString()}`)
  doc.text(`Motivo: Traslado interno entre sucursales`)

  doc.moveDown()

  /* ===============================
     Origen / Destino
  =============================== */
  doc.fontSize(11).text('ORIGEN', { underline: true })
  doc.fontSize(10)
  doc.text(`Sucursal: ${guia.nombreOrigen}`)
  doc.text(`Dirección: ${guia.direccionOrigen}`)

  doc.moveDown(0.5)

  doc.fontSize(11).text('DESTINO', { underline: true })
  doc.fontSize(10)
  doc.text(`Sucursal: ${guia.nombreDestino}`)
  doc.text(`Dirección: ${guia.direccionDestino}`)

  doc.moveDown(1)

  /* ===============================
     Tabla simple de items
  =============================== */
  doc.fontSize(11).text('DETALLE', { underline: true })
  doc.moveDown(0.5)

  doc.fontSize(10)

  guia.items.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.nombreProducto} — ${item.cantidad} ${item.unidad}`
    )
  })

  doc.moveDown(1)

  /* ===============================
     Observación
  =============================== */
  if (guia.observacion) {
    doc.fontSize(10).text('Observación:')
    doc.text(guia.observacion)
    doc.moveDown()
  }

  /* ===============================
     Pie
  =============================== */
  doc.moveDown(2)
  doc
    .fontSize(9)
    .text(
      'Documento generado por el sistema. Traslado interno sin fines tributarios.',
      { align: 'center' }
    )

  return doc
}