import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const orderId = order.id || order._id || 'N/A';
    const invoiceNo = order.invoiceNumber || `INV-${orderId}`;
    const orderDate = order.date || order.createdAt
        ? new Date(order.date || order.createdAt).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN');
    const customerName = order.customer?.name || order.shippingAddress?.name || order.user?.name || 'Customer';
    const customerEmail = order.customer?.email || order.shippingAddress?.email || order.user?.email || 'N/A';
    const customerPhone = order.customer?.phone || order.shippingAddress?.phone || 'N/A';
    const customerAddress = order.customer?.address
        || (order.shippingAddress
            ? [order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip]
                .filter(Boolean)
                .join(', ')
            : 'N/A');

    const rows = (order.items || []).map((item, idx) => {
        const qty = Number(item.quantity || 1);
        const unit = Number(item.price || item.product?.price || 0);
        const discountPct = Number(item.discount || item.discountPercent || 0);
        const lineBase = qty * unit;
        const lineDiscount = (lineBase * discountPct) / 100;
        const lineTotal = lineBase - lineDiscount;
        return {
            idx: idx + 1,
            name: item.name || item.product?.name || `Item ${idx + 1}`,
            qty,
            unit,
            discountPct,
            lineTotal,
        };
    });

    const subtotal = rows.reduce((s, r) => s + (r.qty * r.unit), 0);
    const totalDiscount = rows.reduce((s, r) => s + ((r.qty * r.unit * r.discountPct) / 100), 0);
    const totalPaid = Number(order.totalAmount || order.total || (subtotal - totalDiscount));
    const totalDue = Math.max(0, subtotal - totalDiscount - totalPaid);

    // Background accents similar to provided template
    doc.setFillColor(236, 236, 239);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(244, 230, 45);
    doc.rect(pageWidth - 36, 0, 36, 28, 'F');
    doc.rect(0, pageHeight - 36, 28, 36, 'F');

    // Main white card
    doc.setFillColor(255, 255, 255);
    doc.rect(12, 10, pageWidth - 24, pageHeight - 20, 'F');

    // Header
    doc.setTextColor(25, 25, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.text('Invoice', 20, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`#${invoiceNo.slice(-8).toUpperCase()}`, 20, 39);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(140, 140, 140);
    doc.text('KH Electronics', pageWidth - 20, 28, { align: 'right' });

    // Billing / Shipping blocks
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLING', 20, 60);
    doc.text('ADDRESS', 20, 67);
    doc.text('SHIPPING', pageWidth / 2 + 10, 60);
    doc.text('ADDRESS', pageWidth / 2 + 10, 67);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    const addressLines = doc.splitTextToSize(customerAddress, 70);
    doc.text(customerName, 20, 78);
    doc.text(addressLines, 20, 84);
    doc.text(customerEmail, 20, 99);
    doc.text(customerPhone, 20, 105);

    doc.text(customerName, pageWidth / 2 + 10, 78);
    doc.text(addressLines, pageWidth / 2 + 10, 84);
    doc.text(customerEmail, pageWidth / 2 + 10, 99);
    doc.text(customerPhone, pageWidth / 2 + 10, 105);

    // Table
    autoTable(doc, {
        startY: 118,
        head: [['Product Description', 'Quantity', 'Unit Price', 'Discount', 'Total']],
        body: rows.map(r => [
            r.name,
            String(r.qty),
            `Rs. ${r.unit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `${r.discountPct}%`,
            `Rs. ${r.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]),
        theme: 'plain',
        margin: { left: 15, right: 15 },
        headStyles: {
            fillColor: [244, 230, 45],
            textColor: [20, 20, 20],
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: 3,
        },
        bodyStyles: {
            textColor: [55, 55, 55],
            fontSize: 10,
            cellPadding: 3,
        },
        styles: {
            lineWidth: 0.1,
            lineColor: [90, 90, 90],
        },
        columnStyles: {
            0: { cellWidth: 75 },
            1: { cellWidth: 23, halign: 'center' },
            2: { cellWidth: 33, halign: 'right' },
            3: { cellWidth: 24, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
        },
    });

    // Totals block on right
    const totalsStartY = doc.lastAutoTable.finalY + 14;
    const labelX = pageWidth - 72;
    const valueX = pageWidth - 20;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal', labelX, totalsStartY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, totalsStartY, { align: 'right' });
    doc.line(labelX, totalsStartY + 2, valueX, totalsStartY + 2);

    doc.setFont('helvetica', 'bold');
    doc.text('Discount', labelX, totalsStartY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, totalsStartY + 12, { align: 'right' });
    doc.line(labelX, totalsStartY + 14, valueX, totalsStartY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Paid', labelX, totalsStartY + 24);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, totalsStartY + 24, { align: 'right' });
    doc.line(labelX, totalsStartY + 26, valueX, totalsStartY + 26);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Due', labelX, totalsStartY + 36);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, totalsStartY + 36, { align: 'right' });

    // Footer notes
    const footerY = pageHeight - 30;
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text(`Order ID: ${orderId} | Date: ${orderDate}`, 20, footerY - 8);
    doc.text('Please note that depending on product availability, shipping may take 5 to 7 business days.', 20, footerY);
    doc.text('For return instructions and support, contact our customer care team.', 20, footerY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for shopping!', 20, footerY + 14);

    doc.save(`Invoice_${invoiceNo}.pdf`);
};
