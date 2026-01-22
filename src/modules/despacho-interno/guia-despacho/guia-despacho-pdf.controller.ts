import { Request, Response } from 'express'
import { generarPdfGuiaDespacho } from './guia-despacho-pdf.service'

/* =====================================================
   Descargar / visualizar PDF de guía
===================================================== */
export async function descargarPdfGuiaDespacho(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params

    const doc = await generarPdfGuiaDespacho(id)

    res.setHeader(
      'Content-Type',
      'application/pdf'
    )
    res.setHeader(
      'Content-Disposition',
      `inline; filename=guia-despacho-${id}.pdf`
    )

    doc.pipe(res)
    doc.end()
  } catch (error: any) {
    res.status(404).json({
      message:
        error.message ??
        'No se pudo generar el PDF',
    })
  }
}