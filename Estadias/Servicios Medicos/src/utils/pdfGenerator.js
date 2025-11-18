import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFichaPDF = (data) => {
  if (!data) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // --- COLORES ---
  const colorPrimary = [41, 128, 185]; // Azul Médico
  const colorSecondary = [52, 73, 94]; // Gris Oscuro
  const colorAccent = [52, 73, 94];   // Rojo (Para Folio)
  const colorLight = [245, 245, 245];  // Fondo Gris Claro

  // --- 1. ENCABEZADO ---
  // Fondo del Header
  doc.setFillColor(...colorPrimary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Logo (Simulado: Cruz de la Vida)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.line(25, 10, 25, 25); // Vertical
  doc.line(17.5, 17.5, 32.5, 17.5); // Horizontal
  doc.setLineWidth(0.5);
  doc.circle(25, 17.5, 10, 'S');

  // --- ARREGLO: Títulos con límite de ancho ---
  // Calculamos el ancho disponible para no chocar con el cuadro del folio
  // Ancho página (210) - Margen Izq (45) - Ancho Cuadro Folio (50) - Margen Der (10) = ~105mm
  const titleMaxWidth = 105;

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); // Un poco más pequeño para asegurar que quepa
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICIOS MÉDICOS MUNICIPALES', 45, 15, { maxWidth: titleMaxWidth });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  // Este es el texto que se encimaba. Ahora tiene maxWidth.
  doc.text('DEPARTAMENTO DE ATENCIÓN PREHOSPITALARIA - TALA, JALISCO', 40, 20, { maxWidth: titleMaxWidth });
  doc.text('Reporte de Servicio de Ambulancia', 45, 30, { maxWidth: titleMaxWidth });

  // --- Cuadro de Folio (Tipo Sello) ---
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 60, 8, 50, 20, 2, 2, 'F');
  
  doc.setTextColor(...colorSecondary);
  doc.setFontSize(8);
  // Coordenadas ajustadas para que no se encimen internamente
  doc.text('FOLIO INTERNO', pageWidth - 35, 13, { align: 'center' });
  
  doc.setTextColor(...colorAccent); // Rojo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.num_reporte_local, pageWidth - 35, 23, { align: 'center' });

  // --- 2. INFORMACIÓN DEL SERVICIO (Tabla Compacta) ---
  const fecha = new Date(data.fecha_activacion).toLocaleDateString('es-MX');
  let currentY = 42;

  autoTable(doc, {
    startY: currentY,
    head: [['DATOS GENERALES DEL SERVICIO', '', '', '']],
    body: [
      ['FECHA:', fecha, 'HORA:', data.hora_activacion ? data.hora_activacion.substring(0, 5) : 'N/D'],
      ['UNIDAD:', data.unidad_asignada_nombre || 'N/D', 'TIPO:', data.tipo_activacion_nombre || 'N/D'],
      ['FOLIO EXTERNO:', data.num_reporte_externo || '---', 'ORIGEN:', data.origen_reporte],
    ],
    theme: 'grid',
    headStyles: { fillColor: colorSecondary, textColor: 255, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', width: 25 },
      2: { fontStyle: 'bold', width: 25 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 3. DATOS DEL PACIENTE ---
  autoTable(doc, {
    startY: currentY,
    head: [['DATOS DEL PACIENTE']],
    body: [
      [`NOMBRE: ${data.paciente_nombre}`],
      [`EDAD: ${data.paciente_edad || '--'} años      SEXO: ${data.paciente_sexo || '--'}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: colorPrimary, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 4. EVALUACIÓN CLÍNICA ---
  let traumas = 'Negativo';
  if (data.causas_traumaticas_nombres && data.causas_traumaticas_nombres.length > 0) {
    traumas = data.causas_traumaticas_nombres.join(', ');
  }
  const evalData = data.evaluacion || {};

  autoTable(doc, {
    startY: currentY,
    head: [['EVALUACIÓN CLÍNICA Y TRAUMATOLÓGICA']],
    body: [
      [`CAUSA CLÍNICA: ${data.causa_clinica_nombre || 'N/A'}`],
      [`DETALLE: ${data.causa_clinica_especifica || '---'}`],
      [`AGENTE CAUSAL: ${data.agente_causante_general_nombre || 'N/A'}`],
      [`TRAUMATISMO: ${traumas}`],
      [`DETALLE TRAUMA: ${data.ct_especifico || '---'}`],
      [`SIGNOS: Pupilas: ${evalData.estado_pupilas_nombre || '--'} | Piel: ${evalData.estado_piel_nombre || '--'}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: colorSecondary, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 2 },
    alternateRowStyles: { fillColor: colorLight }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 5. LESIONES ---
  const lesionesBody = (data.lesiones || []).map(l => [
    l.tipo_lesion_nombre || 'N/D',
    l.ubicacion_lesion_nombre || 'N/D',
    l.descripcion_lesion || ''
  ]);

  if (lesionesBody.length === 0) {
    lesionesBody.push(['Sin lesiones aparentes', '---', '---']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['TIPO DE LESIÓN', 'UBICACIÓN', 'DESCRIPCIÓN']],
    body: lesionesBody,
    theme: 'grid',
    headStyles: { fillColor: [220, 53, 69], textColor: 255 },
    styles: { fontSize: 9 }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 6. RESOLUCIÓN / TRASLADO ---
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(0);
  doc.setFillColor(...colorLight);
  doc.roundedRect(margin, currentY, contentWidth, 25, 1, 1, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(...colorPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('RESOLUCIÓN DEL SERVICIO', margin + 5, currentY + 8);

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const textoResolucion = data.requirio_traslado 
    ? `PACIENTE TRASLADADO A: ${data.hospital_destino}` 
    : `NO HUBO TRASLADO. MOTIVO: ${data.estado_traslado_nombre || 'No especificado'}`;
    
  doc.text(textoResolucion, margin + 5, currentY + 18);

  // --- 7. FIRMAS ---
  const firmaY = pageHeight - 30;
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(100);
  
  doc.line(40, firmaY, 90, firmaY);
  doc.setFontSize(8);
  doc.text('FIRMA PARAMÉDICO', 65, firmaY + 5, { align: 'center' });

  doc.line(120, firmaY, 170, firmaY);
  doc.text('FIRMA RECIBE / TESTIGO', 145, firmaY + 5, { align: 'center' });

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`Generado el: ${new Date().toLocaleString()} | Sistema CV Tala`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`Ficha_${data.num_reporte_local}.pdf`);
};