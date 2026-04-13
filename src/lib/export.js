import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

function fmtDate(d) {
  if (!d) return '';
  try { return format(new Date(d), 'MM/dd/yyyy'); } catch { return d; }
}

// --- CSV ---

export function exportServiceCSV(vehicle, serviceLogs) {
  const rows = serviceLogs.map((e) => ({
    'Vehicle': `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    'Plate': vehicle.licensePlate,
    'Date': fmtDate(e.date),
    'Mileage': e.mileageAtService ?? '',
    'Service Type': e.serviceType,
    'Description': e.description,
    'Cost ($)': e.cost ?? '',
    'Technician': e.technician ?? '',
    'Next Service Date': fmtDate(e.nextServiceDue),
    'Next Service Mileage': e.nextServiceMileage ?? '',
    'Notes': e.notes ?? '',
  }));
  return Papa.unparse(rows);
}

export function exportConditionCSV(vehicle, conditionLogs) {
  const rows = conditionLogs.map((e) => ({
    'Vehicle': `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    'Plate': vehicle.licensePlate,
    'Date': fmtDate(e.date),
    'Mileage': e.mileageAtInspection ?? '',
    'Rating (1-5)': e.rating,
    'Inspector': e.inspector ?? '',
    'Photo Count': (e.photos ?? []).length,
    'Notes': e.notes ?? '',
  }));
  return Papa.unparse(rows);
}

export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- PDF ---

export async function exportVehiclePDF(vehicle, serviceLogs, conditionLogs) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const details = [
    vehicle.licensePlate && `Plate: ${vehicle.licensePlate}`,
    vehicle.vin && `VIN: ${vehicle.vin}`,
    vehicle.type && `Type: ${vehicle.type}`,
    vehicle.color && `Color: ${vehicle.color}`,
  ].filter(Boolean).join('   |   ');
  doc.text(details, 14, y);
  y += 5;
  doc.setDrawColor(200);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // Service log
  if (serviceLogs.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Log', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Mileage', 'Type', 'Description', 'Cost', 'Technician']],
      body: serviceLogs.map((e) => [
        fmtDate(e.date),
        e.mileageAtService ?? '',
        e.serviceType,
        e.description,
        e.cost != null ? `$${Number(e.cost).toFixed(2)}` : '',
        e.technician ?? '',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Condition log
  if (conditionLogs.length > 0) {
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 16;
    }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Condition Log', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Mileage', 'Rating', 'Inspector', 'Photos', 'Notes']],
      body: conditionLogs.map((e) => [
        fmtDate(e.date),
        e.mileageAtInspection ?? '',
        `${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}`,
        e.inspector ?? '',
        (e.photos ?? []).length,
        e.notes ?? '',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [5, 150, 105] },
      alternateRowStyles: { fillColor: [236, 253, 245] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Embed photos (up to 20 total across all condition entries)
    const allPhotos = conditionLogs.flatMap((e) =>
      (e.photos ?? []).slice(0, 4).map((p) => ({ ...p, entryDate: e.date }))
    ).slice(0, 20);

    for (const photo of allPhotos) {
      if (y > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        y = 16;
      }
      try {
        doc.addImage(photo.dataUrl, 'JPEG', 14, y, 80, 60);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const caption = [fmtDate(photo.entryDate), photo.caption].filter(Boolean).join(' — ');
        doc.text(caption, 14, y + 63);
        y += 70;
      } catch {
        // skip invalid images
      }
    }
  }

  doc.save(`${vehicle.year}_${vehicle.make}_${vehicle.model}_${vehicle.licensePlate}.pdf`.replace(/\s+/g, '_'));
}
